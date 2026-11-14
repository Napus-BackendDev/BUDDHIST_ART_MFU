const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Role = require('../server/Project/Settings/models/role.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const Submission = require('../server/Project/Submission/models/submission.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const New = require('../server/Project/New/models/new.model');
const { ensureDefaultRoles } = require('../server/Project/Settings/service/role');

describe('Dynamic Roles & Permissions (RBAC)', () => {
  jest.setTimeout(30000);
  let app, cfg;
  let adminRole, customerRole, reviewerRole, adminUser, reviewerUser, artistUser;
  let adminToken, reviewerToken, artistToken, customerToken;
  let pendingStatus, submissionDoc, artworkDoc, newsDoc;

  const call = (method, token, path) => {
    const agent = request(app)[method](path);
    return token ? agent.set('x-access-token', token) : agent;
  };

  beforeAll(async () => {
    app = await getApp();
    cfg = require('../config/config');

    await ensureDefaultRoles();
    const roles = await Role.find().lean();
    adminRole = roles.find(r => r.title.some(t => t.key === 'en' && t.value === 'Admin'));
    customerRole = roles.find(r => r.title.some(t => t.key === 'en' && t.value === 'Customer'));
    reviewerRole = roles.find(r => r.title.some(t => t.key === 'en' && t.value === 'Reviewer'));
    const artistRole = roles.find(r => r.title.some(t => t.key === 'en' && t.value === 'Artist'));

    pendingStatus = await Status.create({
      code: 'PENDING',
      title: [{ key: 'en', value: 'Pending' }, { key: 'th', value: 'รอดำเนินการ' }],
    });

    [adminUser, reviewerUser, artistUser] = await User.create([
      {
        studentId: 'QA-RBAC-ADMIN',
        role: adminRole._id,
        name: [{ key: 'en', value: 'RBAC Admin' }],
        contact: { studentEmail: 'rbac-admin@example.test' },
      },
      {
        studentId: 'QA-RBAC-REVIEWER',
        role: reviewerRole._id,
        name: [{ key: 'en', value: 'RBAC Reviewer' }],
        contact: { studentEmail: 'rbac-reviewer@example.test' },
      },
      {
        studentId: 'QA-RBAC-ARTIST',
        role: artistRole._id,
        name: [{ key: 'en', value: 'RBAC Artist' }],
        contact: { studentEmail: 'rbac-artist@example.test' },
      },
    ]);

    adminToken = jwt.sign({ userId: adminUser._id, role: 'Admin' }, cfg.jwtSecret);
    reviewerToken = jwt.sign({ userId: reviewerUser._id, role: 'Reviewer' }, cfg.jwtSecret);
    artistToken = jwt.sign({ userId: artistUser._id, role: 'Artist' }, cfg.jwtSecret);
    customerToken = jwt.sign({ userId: '000000000000000000000099', role: 'Customer' }, cfg.jwtSecret);

    submissionDoc = await Submission.create({
      title: [{ key: 'en', value: 'Round 1' }],
      submissionCode: 'SUB-RBAC-1',
      artist: [artistUser._id],
      assignments: [{
        title: [{ key: 'en', value: 'Task 1' }],
        artworks: [{
          title: [{ key: 'en', value: 'Hidden Artwork' }],
          owner: artistUser._id,
          status: pendingStatus._id,
          remark: [{ key: 'en', value: 'Reviewer private remark' }],
        }],
      }],
    });

    artworkDoc = await Artwork.create({
      title: [{ key: 'en', value: 'Pending Art' }],
      artist: artistUser._id,
      price: 5000,
      status: { approval: pendingStatus._id, sale: pendingStatus._id },
      remark: [{ key: 'en', value: 'Pending inspection' }],
    });

    newsDoc = await New.create({
      title: [{ key: 'en', value: 'Exhibition Opening' }],
      description: [{ key: 'en', value: 'News body' }],
    });
  });

  afterAll(closeDatabase);

  it('seeds core system roles and default Reviewer role idempotently', async () => {
    const again = await ensureDefaultRoles();
    expect(again.length).toBeGreaterThanOrEqual(4);

    const res = await call('get', null, '/api/v1/settings/role');
    expect(res.status).toBe(200);
    const adminItem = res.body.data.find(r => r.title.some(t => t.value === 'Admin'));
    const reviewerItem = res.body.data.find(r => r.title.some(t => t.value === 'Reviewer'));
    expect(adminItem.isSystem).toBe(true);
    expect(adminItem.permissions.roles).toBe('edit');
    expect(adminItem.permissions.submissions).toBe('edit');
    expect(reviewerItem.isSystem).toBe(false);
    expect(reviewerItem.permissions.submissions).toBe('view');
    expect(reviewerItem.permissions.users).toBe('none');
  });

  it('blocks non-editors from creating, updating, or deleting roles', async () => {
    const payload = {
      title: [{ key: 'en', value: 'Curator' }, { key: 'th', value: 'ภัณฑารักษ์' }],
      permissions: { artworks: 'view' },
    };
    expect((await call('post', customerToken, '/api/v1/settings/role').send(payload)).status).toBe(403);
    expect((await call('post', reviewerToken, '/api/v1/settings/role').send(payload)).status).toBe(403);
    expect((await call('put', reviewerToken, '/api/v1/settings/role').send({ _id: reviewerRole._id, permissions: { roles: 'edit' } })).status).toBe(403);
    expect((await call('delete', reviewerToken, '/api/v1/settings/role').send({ _id: reviewerRole._id })).status).toBe(403);
  });

  it('allows view-only Reviewer to inspect submissions/reference data while blocking all mutations with 403', async () => {
    const listRes = await call('get', reviewerToken, '/api/v1/submission');
    expect(listRes.status).toBe(200);
    const found = listRes.body.data.find(s => String(s._id) === String(submissionDoc._id));
    expect(found).toBeDefined();
    expect(found.assignments[0].artworks[0].remark[0].value).toBe('Reviewer private remark');

    const exploreRes = await call('post', reviewerToken, '/api/v1/submission/explore').send({ _id: submissionDoc._id });
    expect(exploreRes.status).toBe(200);

    const artRes = await call('get', reviewerToken, '/api/v1/artwork');
    expect(artRes.status).toBe(200);
    expect(artRes.body.data.some(a => String(a._id) === String(artworkDoc._id))).toBe(true);

    const usersRes = await call('get', reviewerToken, '/api/v1/user');
    expect(usersRes.status).toBe(200);
    expect(usersRes.body.data.some(u => String(u._id) === String(artistUser._id))).toBe(true);

    // Every mutation endpoint must deny Reviewer with 403
    expect((await call('put', reviewerToken, '/api/v1/submission').send({ _id: submissionDoc._id, submissionCode: 'HACK' })).status).toBe(403);
    expect((await call('post', reviewerToken, '/api/v1/submission').send({ title: [{ key: 'en', value: 'Nope' }] })).status).toBe(403);
    expect((await call('delete', reviewerToken, '/api/v1/submission').send({ _id: submissionDoc._id })).status).toBe(403);
    expect((await call('put', reviewerToken, '/api/v1/artwork').send({ _id: artworkDoc._id, price: 9999 })).status).toBe(403);
    expect((await call('post', reviewerToken, '/api/v1/news').send({ title: [{ key: 'en', value: 'Unauthorized News' }] })).status).toBe(403);
    expect((await call('put', reviewerToken, '/api/v1/news').send({ _id: newsDoc._id, title: [{ key: 'en', value: 'Hacked News' }] })).status).toBe(403);
    expect((await call('post', reviewerToken, '/api/v1/user').send({ studentId: 'X' })).status).toBe(403);
    expect((await call('put', reviewerToken, '/api/v1/user').send({ _id: artistUser._id, bio: 'Tamper' })).status).toBe(403);
  });

  it('applies live permission updates from DB immediately without re-login and protects Admin lock & system/assigned roles', async () => {
    // 1. Admin cannot delete core system roles or assign non-edit permissions to Admin
    const delAdmin = await call('delete', adminToken, '/api/v1/settings/role').send({ _id: adminRole._id });
    expect(delAdmin.status).toBe(409);

    const updAdmin = await call('put', adminToken, '/api/v1/settings/role').send({
      _id: adminRole._id,
      permissions: { roles: 'none', submissions: 'view' },
    });
    expect(updAdmin.status).toBe(200);
    expect(updAdmin.body.data.permissions.roles).toBe('edit');
    expect(updAdmin.body.data.permissions.submissions).toBe('edit');

    // 2. Custom role deletion is blocked (409) while still assigned to a user
    const createCustom = await call('post', adminToken, '/api/v1/settings/role').send({
      title: [{ key: 'en', value: 'News Editor' }, { key: 'th', value: 'ผู้ดูแลข่าว' }],
      description: [{ key: 'en', value: 'Can inspect and edit news' }],
      permissions: { news: 'view' },
    });
    expect(createCustom.status).toBe(200);
    const customRoleId = createCustom.body.data._id;

    // Assign custom role to reviewerUser temporarily via admin PUT /user
    const assignRes = await call('put', adminToken, '/api/v1/user').send({ _id: reviewerUser._id, role: customRoleId });
    expect(assignRes.status).toBe(200);

    // Same token cannot create news while news === 'view'
    expect((await call('post', reviewerToken, '/api/v1/news').send({ title: [{ key: 'en', value: 'View Only Fail' }] })).status).toBe(403);

    // Deleting assigned custom role fails with 409
    const delInUse = await call('delete', adminToken, '/api/v1/settings/role').send({ _id: customRoleId });
    expect(delInUse.status).toBe(409);

    // Upgrade customRoleId news -> 'edit'; existing reviewerToken immediately gains edit power!
    const upgradeRes = await call('put', adminToken, '/api/v1/settings/role').send({
      _id: customRoleId,
      permissions: { news: 'edit' },
    });
    expect(upgradeRes.status).toBe(200);

    const createNewsOk = await call('post', reviewerToken, '/api/v1/news').send({
      title: [{ key: 'en', value: 'Dynamic Editor News' }],
      description: [{ key: 'en', value: 'Created after live upgrade' }],
    });
    expect(createNewsOk.status).toBe(200);

    // Reassign user back to Customer, then custom role can be deleted cleanly (200)
    await call('put', adminToken, '/api/v1/user').send({ _id: reviewerUser._id, role: customerRole._id });
    const delOk = await call('delete', adminToken, '/api/v1/settings/role').send({ _id: customRoleId });
    expect(delOk.status).toBe(200);
  });

  it('renders Customer Information label as ผู้สั่งซื้อ in PDF template', () => {
    const fs = require('fs');
    const path = require('path');
    const pdfSource = fs.readFileSync(path.join(__dirname, '../helpers/pdf.service.js'), 'utf8');
    expect(pdfSource).toContain('ข้อมูลผู้สั่งซื้อ (Customer Information)');
    expect(pdfSource).not.toContain('ข้อมูลผู้สั่งจอง (Customer Information)');
  });
});
