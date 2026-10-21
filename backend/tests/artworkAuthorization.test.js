const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');

describe('Artwork ownership and public data boundaries', () => {
  jest.setTimeout(30000);
  let app, artist, other, own, foreign, published, statuses = {}, tokens = {};
  const call = (method, role, route = '/api/v1/artwork') => {
    const client = request(app)[method](route);
    return role ? client.set('x-access-token', tokens[role]) : client;
  };
  beforeAll(async () => {
    app = await getApp();
    [artist, other] = await User.create([
      { studentId: 'QA-ART-OWNER', name: [{ key: 'en', value: 'QA Artist' }], contact: { personalEmail: 'private-owner@example.test' } },
      { studentId: 'QA-ART-OTHER', name: [{ key: 'en', value: 'Other Artist' }], contact: { personalEmail: 'private-other@example.test' } }
    ]);
    for (const name of ['Pending', 'Approved', 'Reserved', 'Available', 'Exhibition', 'Sold Out']) {
      statuses[name] = await Status.create({ title: [{ key: 'en', value: name }] });
    }
    const cfg = require('../config/config');
    tokens.Artist = jwt.sign({ userId: artist._id, role: 'Artist' }, cfg.jwtSecret);
    tokens.Customer = jwt.sign({ userId: other._id, role: 'Customer' }, cfg.jwtSecret);
    tokens.Admin = jwt.sign({ userId: other._id, role: 'Admin' }, cfg.jwtSecret);
  });
  beforeEach(async () => {
    await Artwork.deleteMany({});
    [own, foreign, published] = await Artwork.create([
      { artworkCode: 'BA-QA-OWNER', artist: artist._id, title: [{ key: 'en', value: 'Own draft' }], status: { approval: statuses.Pending._id, sale: statuses.Available._id }, remark: [{ key: 'en', value: 'Internal note' }] },
      { artworkCode: 'BA-QA-FOREIGN', artist: other._id, status: { approval: statuses.Pending._id, sale: statuses.Available._id } },
      { artworkCode: 'BA-QA-PUBLIC', artist: other._id, status: { approval: statuses.Approved._id, sale: statuses.Available._id }, remark: [{ key: 'en', value: 'Private assessment' }] }
    ]);
  });
  afterAll(closeDatabase);
  it('rejects missing or unknown admin-import owners before any row is created', async () => {
    const before = await Artwork.countDocuments();
    for (const artistId of [null, 'invalid', '000000000000000000000001']) {
      await call('post', 'Admin').send({ artist: artistId, title: [{ key: 'en', value: 'Invalid owner' }] }).expect(400);
    }
    await call('post', 'Admin').send([
      { artist: artist._id, title: [{ key: 'en', value: 'Must not partially import' }] },
      { artist: null, title: [{ key: 'en', value: 'Missing owner' }] }
    ]).expect(400);
    expect(await Artwork.countDocuments()).toBe(before);
  });
  it('does not leave earlier rows when a later bulk row fails schema validation', async () => {
    const before = await Artwork.countDocuments();
    await call('post', 'Admin').send([
      { artist: artist._id, title: [{ key: 'en', value: 'Bulk valid first' }] },
      { artist: artist._id, price: 'not-a-number' }
    ]).expect(404);
    expect(await Artwork.countDocuments()).toBe(before);
  });
  it('rolls back only this bulk attempt after a later duplicate code, preserving existing artwork', async () => {
    await Artwork.init();
    const before = await Artwork.countDocuments();
    await call('post', 'Admin').send([
      { artist: artist._id, artworkCode: 'BA-QA-BULK-NEW' },
      { artist: artist._id, artworkCode: own.artworkCode }
    ]).expect(404);
    expect(await Artwork.countDocuments()).toBe(before);
    expect(await Artwork.findById(own._id)).not.toBeNull();
  });
  it('cleans an inserted row even when population fails, then retries without duplicating rows', async () => {
    const before = await Artwork.countDocuments();
    const payload = [
      { artist: artist._id, title: [{ key: 'en', value: 'Bulk retry one' }] },
      { artist: artist._id, title: [{ key: 'en', value: 'Bulk retry two' }] }
    ];
    const population = jest.spyOn(Artwork, 'populate').mockRejectedValueOnce(new Error('QA simulated population outage'));
    await call('post', 'Admin').send(payload).expect(404);
    population.mockRestore();
    expect(await Artwork.countDocuments()).toBe(before);
    const result = await call('post', 'Admin').send(payload).expect(200);
    expect(result.body.data).toHaveLength(2);
    expect(await Artwork.countDocuments()).toBe(before + 2);
    expect(await Artwork.countDocuments({ 'title.value': 'Bulk retry one' })).toBe(1);
  });
  it('gives repeated artwork image uploads distinct URLs so replacements do not reuse cached images', async () => {
    const urls = [];
    for (let index = 0; index < 2; index++) {
      const result = await call('put', 'Admin', '/api/v1/artwork/upload').field('_id', String(own._id))
        .attach('image', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl3sAAAAASUVORK5CYII=', 'base64'), 'qa.png').expect(200);
      urls.push(result.body.data.image);
    }
    expect(urls[0]).toContain('QA-ART-OWNER_QA_Artist/Artwork/Own_draft/');
    expect(new URL(urls[0]).pathname).not.toBe(new URL(urls[1]).pathname);
    expect((await Artwork.findById(own._id)).image).toBe(urls[1]);
  });
  it('denies artwork mutations by customers', async () => {
    await call('post', 'Customer').send({ artist: other._id }).expect(403);
    await call('put', 'Customer').send({ _id: published._id, price: 1 }).expect(403);
    await call('delete', 'Customer').send({ _id: published._id }).expect(403);
  });
  it('denies another artist edits, deletes and image uploads before storage', async () => {
    await call('put', 'Artist').send({ _id: foreign._id, price: 1 }).expect(403);
    await call('delete', 'Artist').send({ _id: foreign._id }).expect(403);
    await call('put', 'Artist', '/api/v1/artwork/upload').field('_id', String(foreign._id))
      .attach('image', Buffer.from('QA forbidden image'), 'qa.png').expect(403);
    expect(await Artwork.exists({ _id: foreign._id })).toBeTruthy();
  });
  it('denies impersonation and self-approval on creation', async () => {
    await call('post', 'Artist').send({ artist: other._id }).expect(403);
    await call('post', 'Artist').send({ artist: artist._id, status: { approval: statuses.Approved._id } }).expect(403);
  });
  it('creates own work as Pending with a server-generated identifier', async () => {
    const result = await call('post', 'Artist').send({ title: [{ key: 'en', value: 'New own work' }], status: { sale: statuses.Available._id } }).expect(200);
    expect(String(result.body.data.artist._id)).toBe(String(artist._id));
    expect(result.body.data.status.approval._id).toBe(String(statuses.Pending._id));
    expect(result.body.data.artworkCode).toBeTruthy();
  });
  it('allows own metadata edits but rejects approval, ownership and identifier changes', async () => {
    await call('put', 'Artist').send({ _id: own._id, title: [{ key: 'en', value: 'Corrected' }] }).expect(200);
    expect((await Artwork.findById(own._id)).title[0].value).toBe('Corrected');
    expect((await Artwork.findById(own._id)).remark[0].value).toBe('Internal note');
    for (const body of [{ artist: other._id }, { artworkCode: 'STOLEN' }, { status: { approval: statuses.Approved._id } }]) {
      await call('put', 'Artist').send({ _id: own._id, ...body }).expect(403);
    }
    expect((await Artwork.findById(own._id)).artworkCode).toBe('BA-QA-OWNER');
  });
  it('locks reserved and sold artworks against artist mutations', async () => {
    await Artwork.updateOne({ _id: own._id }, { 'status.approval': statuses.Reserved._id });
    await call('put', 'Artist').send({ _id: own._id, price: 1 }).expect(403);
    await call('delete', 'Artist').send({ _id: own._id }).expect(403);
    await Artwork.updateOne({ _id: own._id }, { 'status.approval': statuses.Approved._id, 'status.sale': statuses['Sold Out']._id });
    await call('put', 'Artist').send({ _id: own._id, price: 1 }).expect(403);
  });
  it('requires a new review after changing published metadata or images', async () => {
    await Artwork.updateOne({ _id: own._id }, { 'status.approval': statuses.Approved._id });
    await call('put', 'Artist', '/api/v1/artwork/upload').field('_id', String(own._id))
      .attach('image', Buffer.from('QA forbidden replacement'), 'qa.png').expect(403);
    await call('put', 'Artist').send({ _id: own._id, price: 1500 }).expect(200);
    expect(String((await Artwork.findById(own._id)).status.approval)).toBe(String(statuses.Pending._id));
  });
  it('allows an artist to delete their own unsold direct artwork', async () => {
    await call('delete', 'Artist').send({ _id: own._id }).expect(200);
    expect(await Artwork.exists({ _id: own._id })).toBeFalsy();
  });
  it('publishes only approved/reserved works without private notes or artist contacts', async () => {
    const result = await call('get').expect(200);
    expect(result.body.data.map(item => item._id)).toEqual([String(published._id)]);
    const art = result.body.data[0];
    expect(art.remark).toBeUndefined();
    expect(art.artist.name).toBeDefined();
    expect(art.artist.contact).toBeUndefined();
    await call('post', null, '/api/v1/artwork/explore').send({ _id: own._id }).expect(404);
    await call('get', null, `/api/v1/artwork/view/${own._id}`).expect(404);
    expect((await Artwork.findById(own._id)).views).toBe(0);
  });
  it('keeps drafts and internal notes available to their artist and administrator', async () => {
    const result = await call('get', 'Artist').expect(200);
    expect(result.body.data.map(item => item._id)).toEqual(expect.arrayContaining([String(own._id), String(published._id)]));
    expect(result.body.data.some(item => item._id === String(foreign._id))).toBe(false);
    expect(result.body.data.find(item => item._id === String(own._id)).remark[0].value).toBe('Internal note');
    expect((await call('get', 'Admin')).body.data).toHaveLength(3);
    await call('put', 'Admin').send({ _id: own._id, status: { approval: statuses.Approved._id } }).expect(200);
  });
});
