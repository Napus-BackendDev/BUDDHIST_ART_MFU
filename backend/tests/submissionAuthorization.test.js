jest.mock('../helpers/google/Mail', () => ({ sendMail: jest.fn().mockResolvedValue({}) }));
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Submission = require('../server/Project/Submission/models/submission.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');

describe('Submission ownership and atomic work updates', () => {
  jest.setTimeout(30000);
  let app, artist, peer, outsider, pending, approved, submission, assignment, own, other, tokens = {};
  const call = (method, role, route = '/api/v1/submission') => {
    const client = request(app)[method](route);
    return role ? client.set('x-access-token', tokens[role]) : client;
  };
  const work = artwork => ({ _id: submission._id, assignmentId: assignment._id, artwork });
  beforeAll(async () => {
    app = await getApp();
    [artist, peer, outsider] = await User.create(['OWNER', 'PEER', 'OUTSIDE'].map(name => ({
      studentId: `QA-SUB-${name}`, name: [{ key: 'en', value: name }],
      contact: { personalEmail: `${name.toLowerCase()}@example.test` }, address: { bill: 'Private address' }
    })));
    [pending, approved] = await Status.create([
      { code: 'PENDING', title: [{ key: 'en', value: 'Pending' }] },
      { code: 'APPROVED', title: [{ key: 'en', value: 'Approved' }] }
    ]);
    const cfg = require('../config/config');
    for (const [name, user, role] of [['Artist', artist, 'Artist'], ['Peer', peer, 'Artist'], ['Outside', outsider, 'Artist'], ['Customer', outsider, 'Customer'], ['Admin', outsider, 'Admin']]) {
      tokens[name] = jwt.sign({ userId: user._id, role }, cfg.jwtSecret);
    }
  });
  beforeEach(async () => {
    await Submission.deleteMany({});
    const dates = { startAt: new Date(Date.now()-86400000), endAt: new Date(Date.now()+86400000) };
    submission = await Submission.create({ title: [{ key:'en', value:'QA Submission' }], artist:[artist._id, peer._id], create:dates,
      assignments:[{ title:[{key:'en',value:'QA Round'}], artist:[artist._id,peer._id],create:dates,artworks:[
        { owner:artist._id,title:[{key:'en',value:'Own draft'}],status:pending._id,remark:[{key:'en',value:'Own note'}] },
        { owner:peer._id,title:[{key:'en',value:'Peer draft'}],status:pending._id,remark:[{key:'en',value:'Peer private note'}] }
      ]}] });
    assignment=submission.assignments[0]; [own,other]=assignment.artworks;
  });
  afterAll(closeDatabase);
  test('resolves exported enrollment-only and empty portal rows without inventing blank assignments', async () => {
    const { resolveRows } = require('../server/Project/Submission/service/excelImport');
    const base = { submissionTitleTh:'QA export', submissionTitleEn:'QA export', courseLevel:'5',academicYear:'2568',
      artworkTitleTh:'',artworkTitleEn:'',assignmentTitleTh:'',assignmentTitleEn:'' };
    const parsed = { rows:[{...base,rowNumber:2,studentId:artist.studentId}, {...base,submissionTitleEn:'QA empty',rowNumber:3,studentId:''}], warnings:[],imageCount:0 };
    const resolved = await resolveRows(parsed);
    expect(resolved.submissions).toHaveLength(2);
    expect(resolved.submissions[0].artist.map(String)).toEqual([String(artist._id)]);
    expect(resolved.submissions.every(s=>s.assignments.length===0)).toBe(true);
    expect(resolved.summary.artworkCount).toBe(0);
    expect(resolved.summary.missingImageRows).toEqual([]);
  });
  it('rejects reversed creation dates before any bulk rows are written', async () => {
    const valid = { title: [{ key:'en', value:'QA valid bulk' }], create:{ startAt:'2026-10-16', endAt:'2026-10-20' } };
    const invalid = { ...valid, create:{ startAt:'2026-10-20', endAt:'2026-10-16' } };
    const count = await Submission.countDocuments();
    await call('post','Admin').send([valid,invalid]).expect(400);
    expect(await Submission.countDocuments()).toBe(count);
  });
  it('rejects reversed assignment dates without changing existing submission data', async () => {
    const before = await Submission.findById(submission._id).lean();
    await call('put','Admin').send({_id:submission._id,title:[{key:'en',value:'Should not save'}],assignments:[{
      title:[{key:'en',value:'QA invalid round'}],create:{startAt:'2026-10-20',endAt:'2026-10-16'}
    }]}).expect(400);
    const after=await Submission.findById(submission._id).lean();
    expect(after.title).toEqual(before.title);
    expect(after.assignments).toEqual(before.assignments);
  });
  it('restricts cohort creation, deletion and bulk assignment management to admin', async () => {
    for (const role of ['Customer','Artist']) {
      await call('post',role).send({title:[]}).expect(403);
      await call('delete',role).send({_id:submission._id}).expect(403);
      await call('put',role).send({_id:submission._id,assignments:[]}).expect(403);
    }
    expect((await Submission.findById(submission._id)).assignments[0].artworks).toHaveLength(2);
  });
  it('keeps public batch metadata but hides drafts, contacts and assessment notes', async () => {
    await Submission.updateOne({_id:submission._id},{$set:{'assignments.0.artworks.1.status':approved._id}});
    const result=await call('get').expect(200);
    const doc=result.body.data[0];
    expect(doc.title[0].value).toBe('QA Submission');
    expect(doc.artist[0].contact).toBeUndefined();
    expect(doc.artist[0].studentId).toBeUndefined();
    expect(doc.assignments[0].artworks.map(item=>item._id)).toEqual([String(other._id)]);
    expect(doc.assignments[0].artworks[0].remark).toBeUndefined();
    expect(doc.assignments[0].artworks[0].owner.contact).toBeUndefined();
  });
  it('lets members see peer artwork without private notes, and denies outsider exploration', async () => {
    const result=await call('post','Artist','/api/v1/submission/explore').send({_id:submission._id}).expect(200);
    const items=result.body.data.assignments[0].artworks;
    expect(items).toHaveLength(2);
    expect(items.find(item=>item._id===String(own._id)).remark[0].value).toBe('Own note');
    expect(items.find(item=>item._id===String(other._id)).remark).toBeUndefined();
    await call('post','Outside','/api/v1/submission/explore').send({_id:submission._id}).expect(403);
  });
  it('reports per-user assignment eligibility without exposing the assignment roster', async () => {
    for (const [roster, expected] of [[[artist._id], true], [[peer._id], false], [[], true]]) {
      await Submission.updateOne({_id:submission._id}, {$set:{'assignments.0.artist':roster}});
      const result = await call('get','Artist').expect(200);
      const round = result.body.data[0].assignments[0];
      expect(round.isAssigned).toBe(expected);
      expect(round.artist).toBeUndefined();
      if (!expected) await call('put','Artist').send(work({title:[{key:'en',value:'Unassigned attempt'}]})).expect(403);
      const anonymous = await call('get').expect(200);
      expect(anonymous.body.data[0].assignments[0].isAssigned).toBe(false);
    }
    expect((await Submission.findById(submission._id)).assignments[0].artworks).toHaveLength(2);
  });
  it('adds new work under the authenticated owner as Pending', async () => {
    await call('put','Artist').send(work({title:[{key:'en',value:'New work'}],price:1000})).expect(200);
    const doc=await Submission.findById(submission._id).lean();
    expect(doc.assignments[0].artworks).toHaveLength(3);
    const added=doc.assignments[0].artworks[2];
    expect(String(added.owner)).toBe(String(artist._id));
    expect(String(added.status)).toBe(String(pending._id));
  });
  it('denies owner impersonation, cross-owner edits and self-approval', async () => {
    await call('put','Artist').send(work({owner:peer._id,title:[]})).expect(403);
    await call('put','Artist').send(work({_id:other._id,price:1})).expect(403);
    await call('put','Artist').send(work({_id:own._id,status:approved._id})).expect(403);
    expect(String((await Submission.findById(submission._id)).assignments[0].artworks[0].status)).toBe(String(pending._id));
  });
  it('clears the previous rejection reason when a rejected work is resubmitted', async () => {
    await Submission.updateOne({ _id: submission._id }, { $set: { 'assignments.0.artworks.0.rejectionReason': 'too dark' } });
    await call('put','Artist').send(work({_id:own._id,title:[{key:'en',value:'Brighter'}]})).expect(200);
    const doc=await Submission.findById(submission._id).lean();
    expect(doc.assignments[0].artworks[0].rejectionReason).toBeNull();
  });
  it('edits only the targeted work and preserves all peer rows and notes', async () => {
    const original=JSON.stringify(other.toObject());
    await call('put','Artist').send(work({_id:own._id,title:[{key:'en',value:'Resubmitted'}]})).expect(200);
    const doc=await Submission.findById(submission._id).lean();
    expect(doc.assignments[0].artworks[0].title[0].value).toBe('Resubmitted');
    expect(JSON.stringify(doc.assignments[0].artworks[1])).toBe(original);
    expect(doc.assignments[0].artworks[0].remark[0].value).toBe('Own note');
  });
  it('preserves concurrent submissions from two different members', async () => {
    await Promise.all(['Artist','Peer'].map(role=>call('put',role).send(work({title:[{key:'en',value:`Concurrent ${role}`}]})).expect(200)));
    const doc=await Submission.findById(submission._id).lean();
    expect(doc.assignments[0].artworks).toHaveLength(4);
    expect(doc.assignments[0].artworks.map(item=>item.title[0].value)).toEqual(expect.arrayContaining(['Concurrent Artist','Concurrent Peer']));
  });
  it('rejects a stale admin snapshot instead of erasing a newly submitted work', async () => {
    const stale=await Submission.findById(submission._id).lean();
    await call('put','Artist').send(work({title:[{key:'en',value:'Submitted after snapshot'}]})).expect(200);
    await call('put','Admin').send({_id:submission._id,updatedAt:stale.updatedAt,assignments:stale.assignments}).expect(409);
    expect((await Submission.findById(submission._id)).assignments[0].artworks).toHaveLength(3);
  });
  it('locks approved work and closed or not-yet-open assignments', async () => {
    await Submission.updateOne({_id:submission._id},{$set:{'assignments.0.artworks.0.status':approved._id}});
    await call('put','Artist').send(work({_id:own._id,price:1})).expect(403);
    await Submission.updateOne({_id:submission._id},{$set:{'assignments.0.create.endAt':new Date(Date.now()-1000)}});
    await call('put','Artist').send(work({title:[]})).expect(403);
    await Submission.updateOne({_id:submission._id},{$set:{'assignments.0.create.endAt':new Date(Date.now()+86400000),'assignments.0.create.startAt':new Date(Date.now()+10000)}});
    await call('put','Artist').send(work({title:[]})).expect(403);
  });
  it('rejects outsiders and unauthorized uploads before storage', async () => {
    await call('put','Outside').send(work({title:[]})).expect(403);
    await call('post','Outside','/api/v1/submission/upload').field('_id',String(submission._id)).field('assignmentId',String(assignment._id))
      .attach('image',Buffer.from('QA forbidden'),'qa.png').expect(403);
  });
  it('keeps admin cohort updates working without replacing assignments', async () => {
    await call('put','Admin').send({_id:submission._id,title:[{key:'en',value:'Updated cohort'}]}).expect(200);
    const doc=await Submission.findById(submission._id).lean();
    expect(doc.title[0].value).toBe('Updated cohort');
    expect(doc.assignments[0].artworks).toHaveLength(2);
  });
  it('stores peer uploads under that peer and generates distinct replacement filenames', async () => {
    const urls=[];
    for (let index=0;index<2;index++) {
      const result=await call('post','Peer','/api/v1/submission/upload').field('_id',String(submission._id))
        .field('assignmentId',String(assignment._id)).field('assignmentTitle','QA Round').field('artworkTitle','Same title')
        .attach('image',Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl3sAAAAASUVORK5CYII=','base64'),'qa.png').expect(200);
      urls.push(result.body.data.url);
    }
    expect(urls[0]).toContain('QA-SUB-PEER_PEER');
    expect(urls[0]).not.toBe(urls[1]);
  });
});
