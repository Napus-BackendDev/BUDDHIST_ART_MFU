const request = require('supertest');

// Mock node-cron before loading the app (same pattern as submissionTransition.test.js)
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() }))
}));

const { getApp, closeDatabase } = require('./appHelper');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');
const { isPasswordHash } = require('../server/Project/User/service/password');

describe('User Sign-In Security', () => {
  jest.setTimeout(30000);
  let app;

  beforeAll(async () => {
    // config.js reads these at require-time; set them BEFORE getApp() loads the app.
    process.env.JWT_SECRET = 'testSecret';
    process.env.TOKENEXPIRED = '1'; // cfg.tokenExpired = 86400000 * 1 (avoids NaN expiresIn)
    app = await getApp();

    const customerRole = await Role.create({
      title: [{ key: 'en', value: 'Customer' }, { key: 'th', value: 'ลูกค้า' }]
    });

    const adminRole = await Role.create({
      title: [{ key: 'en', value: 'Admin' }, { key: 'th', value: 'ผู้ดูแลระบบ' }]
    });

    await User.create({
      studentId: '640000001',
      name: [{ key: 'en', value: 'Login User' }],
      role: customerRole._id,
      password: 'secret123',
      contact: { studentEmail: 'login@example.com' }
    });

    await User.create({
      studentId: 'ADMIN-TEST',
      name: [{ key: 'en', value: 'Local Admin' }],
      role: adminRole._id
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('signs in with valid credentials and never returns the password', async () => {
    const res = await request(app)
      .post('/api/v1/user/auth/sign-in')
      .send({ username: '640000001', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.password).toBeUndefined();

    const upgraded = await User.findOne({ studentId: '640000001' }).select('+password');
    expect(isPasswordHash(upgraded.password)).toBe(true);
  });

  it('rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/user/auth/sign-in')
      .send({ username: '640000001', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('blocks NoSQL operator injection auth bypass', async () => {
    // Without input coercion, { $ne: null } would match the first user and mint a token.
    const res = await request(app)
      .post('/api/v1/user/auth/sign-in')
      .send({ username: { $ne: null }, password: { $ne: null } });

    expect(res.status).toBe(401);
    expect(res.body.data).toBeUndefined();
  });

  it('allows local Admin login only when the development flag is enabled', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousFlag = process.env.ALLOW_DEV_ADMIN_LOGIN;
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_DEV_ADMIN_LOGIN = 'true';

    const res = await request(app).post('/api/v1/user/auth/dev-admin');

    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousFlag === undefined) delete process.env.ALLOW_DEV_ADMIN_LOGIN;
    else process.env.ALLOW_DEV_ADMIN_LOGIN = previousFlag;
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('Admin');
    expect(res.body.data.token).toBeDefined();
  });

  it('hides local Admin login when the development flag is disabled', async () => {
    const previousFlag = process.env.ALLOW_DEV_ADMIN_LOGIN;
    delete process.env.ALLOW_DEV_ADMIN_LOGIN;

    const res = await request(app).post('/api/v1/user/auth/dev-admin');

    if (previousFlag === undefined) delete process.env.ALLOW_DEV_ADMIN_LOGIN;
    else process.env.ALLOW_DEV_ADMIN_LOGIN = previousFlag;
    expect(res.status).toBe(404);
  });
});
