const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');

describe('User resource authorization', () => {
  jest.setTimeout(30000);
  let app, buyer, admin, buyerToken, adminToken;
  const call = (method, token, path = '/api/v1/user') => {
    const agent = request(app)[method](path);
    return token ? agent.set('x-access-token', token) : agent;
  };
  beforeAll(async () => {
    app = await getApp();
    const roles = await Role.create([
      { title: [{ key: 'en', value: 'Customer' }] },
      { title: [{ key: 'en', value: 'Admin' }] }
    ]);
    [buyer, admin] = await User.create([
      { studentId: 'QA-AUTH-BUYER', role: roles[0]._id, name: [{ key: 'en', value: 'QA Buyer' }], contact: { studentEmail: 'buyer@example.test', telephone: '0800000000' } },
      { studentId: 'QA-AUTH-ADMIN', role: roles[1]._id, name: [{ key: 'en', value: 'QA Admin' }], bio: 'Original', contact: { studentEmail: 'admin@example.test' }, address: { bill: 'Private address' } }
    ]);
    const cfg = require('../config/config');
    buyerToken = jwt.sign({ userId: buyer._id, role: 'Customer' }, cfg.jwtSecret);
    adminToken = jwt.sign({ userId: admin._id, role: 'Admin' }, cfg.jwtSecret);
  });
  afterAll(closeDatabase);
  it('lists only the current account for buyers and all accounts for administrators', async () => {
    const own = await call('get', buyerToken);
    expect(own.status).toBe(200);
    expect(own.body.data.map(u => u._id)).toEqual([String(buyer._id)]);
    const all = await call('get', adminToken);
    expect(all.body.data.some(u => u._id === String(admin._id))).toBe(true);
  });
  it('publishes only public profile fields while retaining private fields for self', async () => {
    const publicProfile = await call('post', null, '/api/v1/user/explore').send({ _id: admin._id });
    expect(publicProfile.status).toBe(200);
    expect(publicProfile.body.data.name).toBeDefined();
    for (const field of ['contact', 'address', 'studentId', 'password', 'role', 'status']) {
      expect(publicProfile.body.data[field]).toBeUndefined();
    }
    const own = await call('post', buyerToken, '/api/v1/user/explore').send({ _id: buyer._id });
    expect(own.body.data.contact.studentEmail).toBe('buyer@example.test');
    expect((await call('post', 'invalid', '/api/v1/user/explore').send({ _id: buyer._id })).status).toBe(401);
  });
  it('rejects cross-account edits without changing stored data', async () => {
    expect((await call('put', buyerToken).send({ _id: admin._id, bio: 'Unauthorized' })).status).toBe(403);
    expect((await User.findById(admin._id)).bio).toBe('Original');
  });
  it('allows self-profile edits without replacing identity, role or official email', async () => {
    const result = await call('put', buyerToken).send({
      _id: buyer._id, bio: 'Updated profile', role: admin.role, studentId: 'CHANGED',
      contact: { personalEmail: 'personal@example.test', studentEmail: 'stolen@example.test' }
    });
    expect(result.status).toBe(200);
    const stored = await User.findById(buyer._id).lean();
    expect(stored.bio).toBe('Updated profile');
    expect(String(stored.role)).toBe(String(buyer.role));
    expect(stored.studentId).toBe('QA-AUTH-BUYER');
    expect(stored.contact.studentEmail).toBe('buyer@example.test');
    expect(stored.contact.telephone).toBe('0800000000');
    expect(stored.contact.personalEmail).toBe('personal@example.test');
  });
  it('requires admin for account creation and deletion', async () => {
    expect((await call('post', buyerToken).send({ studentId: 'QA-FORBIDDEN' })).status).toBe(403);
    expect((await call('delete', buyerToken).send({ _id: admin._id })).status).toBe(403);
    expect(await User.exists({ _id: admin._id })).toBeTruthy();
  });
  it('rejects invalid personal email updates atomically while allowing clear and valid updates', async () => {
    for (const personalEmail of ['invalid-email', 'a@@example.test', { value: 'bad' }]) {
      const result = await call('put', buyerToken).send({ _id: buyer._id, bio: 'Must not save', contact: { personalEmail } });
      expect(result.status).toBe(400);
      expect((await User.findById(buyer._id)).bio).not.toBe('Must not save');
    }
    const valid = await call('put', buyerToken).send({ _id: buyer._id, contact: { personalEmail: ' qa+buyer@example.test ' } });
    expect(valid.status).toBe(200);
    expect((await User.findById(buyer._id)).contact.personalEmail).toBe('qa+buyer@example.test');
    expect((await call('put', buyerToken).send({ _id: buyer._id, contact: { personalEmail: '' } })).status).toBe(200);
  });
  it('rejects profile uploads to another account before storage', async () => {
    const result = await call('put', buyerToken, '/api/v1/user/upload')
      .field('_id', String(admin._id)).attach('image', Buffer.from('not-an-image'), 'test.png');
    expect(result.status).toBe(403);
    expect((await User.findById(admin._id)).image).toBeFalsy();
  });
});
