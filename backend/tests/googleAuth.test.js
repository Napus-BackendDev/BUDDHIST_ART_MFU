const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock node-cron before loading the app
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() }))
}));

const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken
  }))
}));

const { getApp, closeDatabase } = require('./appHelper');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');
const Status = require('../server/Project/Settings/models/status.model');

describe('Google OAuth Authentication', () => {
  jest.setTimeout(30000);
  let app;
  let customerRoleId;
  let artistRoleId;
  let adminRoleId;
  const testClientId = '225788483142-8pkg8on8nh60ao83ve33ff3lflv2ccvo.apps.googleusercontent.com';

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    process.env.TOKENEXPIRED = '1';
    process.env.GOOGLE_CLIENT_ID = testClientId;
    process.env.ALLOW_UNVERIFIED_GOOGLE_DEV = 'true';
    app = await getApp();

    const adminRole = await Role.create({
      title: [{ key: 'en', value: 'Admin' }, { key: 'th', value: 'ผู้ดูแลระบบ' }]
    });
    adminRoleId = adminRole._id;

    const customerRole = await Role.create({
      title: [{ key: 'en', value: 'Customer' }, { key: 'th', value: 'ลูกค้า' }]
    });
    customerRoleId = customerRole._id;

    const artistRole = await Role.create({
      title: [{ key: 'en', value: 'Artist' }, { key: 'th', value: 'ศิลปิน' }]
    });
    artistRoleId = artistRole._id;

    await Status.create({
      title: [{ key: 'en', value: 'NewStudent' }, { key: 'th', value: 'นักศึกษาใหม่' }]
    });


    // Create existing user with uppercase letters in email to test case-insensitive match
    await User.create({
      studentId: 'ARTIST-001',
      name: [{ key: 'th', value: 'ศิลปินทดสอบ' }, { key: 'en', value: 'Test Artist' }],
      role: artistRoleId,
      contact: {
        personalEmail: 'Artist.MixedCase@Gmail.com'
      }
    });

    // Create existing MFU student by studentId
    await User.create({
      studentId: '6880000099',
      name: [{ key: 'th', value: 'นักศึกษา มฟล.' }, { key: 'en', value: 'MFU Student' }],
      role: customerRoleId
    });
  });

  afterAll(async () => {
    delete process.env.ALLOW_UNVERIFIED_GOOGLE_DEV;
    await closeDatabase();
  });

  beforeEach(() => {
    mockVerifyIdToken.mockImplementation(async ({ idToken, audience }) => {
      const decoded = jwt.decode(idToken);
      const now = Math.floor(Date.now() / 1000);
      const aud = Array.isArray(decoded?.aud) ? decoded.aud : [decoded?.aud];
      if (!decoded || !aud.includes(audience) || !decoded.exp || decoded.exp <= now) {
        throw new Error('Invalid or expired Google ID token');
      }
      return { getPayload: () => decoded };
    });
  });

  function createMockGoogleToken(payload = {}) {
    const defaultPayload = {
      iss: 'https://accounts.google.com',
      aud: testClientId,
      sub: 'google-sub-12345',
      email: 'newuser@example.com',
      name: 'New Google User',
      picture: 'https://example.com/avatar.png',
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    return jwt.sign({ ...defaultPayload, ...payload }, 'fake_google_signing_key_for_test');
  }

  it('rejects request without token', async () => {
    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('ID Token is required');
  });

  it('rejects expired token', async () => {
    const expiredToken = createMockGoogleToken({
      exp: Math.floor(Date.now() / 1000) - 100
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token: expiredToken });

    expect(res.status).toBe(401);
  });

  it('rejects token with mismatched audience', async () => {
    const wrongAudToken = createMockGoogleToken({
      aud: 'wrong-client-id.apps.googleusercontent.com'
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token: wrongAudToken });

    expect(res.status).toBe(401);
  });

  it('authenticates existing user case-insensitively and returns valid JWT', async () => {
    const token = createMockGoogleToken({
      email: 'artist.mixedcase@gmail.com'
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.role).toBe('Artist');
    expect(res.body.data.studentId).toBe('ARTIST-001');
    expect(res.body.data.token).toBeDefined();

    // Verify system JWT signature
    const verified = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(verified.role).toBe('Artist');
    expect(verified.email).toBe('artist.mixedcase@gmail.com');
  });

  it('authenticates MFU student by email prefix studentId and links studentEmail', async () => {
    const token = createMockGoogleToken({
      email: '6880000099@lamduan.mfu.ac.th',
      name: 'MFU Student User'
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.studentId).toBe('6880000099');

    // Confirm studentEmail was updated on the existing user record
    const updated = await User.findOne({ studentId: '6880000099' });
    expect(updated.contact.studentEmail).toBe('6880000099@lamduan.mfu.ac.th');
  });

  it('auto-registers a new customer when email is not found', async () => {
    const token = createMockGoogleToken({
      email: 'brandnewcustomer@gmail.com',
      name: 'Somchai Jaidee',
      picture: 'https://example.com/somchai.jpg'
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.role).toBe('Customer');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.contact.personalEmail).toBe('brandnewcustomer@gmail.com');

    const created = await User.findOne({ 'contact.personalEmail': 'brandnewcustomer@gmail.com' });
    expect(created).toBeDefined();
    expect(created.image).toBe('https://example.com/somchai.jpg');
  });

  it('automatically registers designated admin email (buddhistart@mfu.ac.th) with Admin role', async () => {
    const token = createMockGoogleToken({
      email: 'buddhistart@mfu.ac.th',
      name: 'Buddhist Art Admin'
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.role).toBe('Admin');
    expect(res.body.data.token).toBeDefined();

    const verified = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(verified.role).toBe('Admin');
    expect(verified.email).toBe('buddhistart@mfu.ac.th');

    const created = await User.findOne({ 'contact.personalEmail': 'buddhistart@mfu.ac.th' }).populate('role');
    expect(created).toBeDefined();
    expect(created.role.title.find(t => t.key === 'en').value).toBe('Admin');
  });

  it('elevates existing Customer (sattawat.nor@mfu.ac.th) to Admin role upon login', async () => {
    // Create sattawat.nor as Customer first
    await User.create({
      studentId: 'CUST-SATTAWAT',
      name: [{ key: 'th', value: 'สัตวรรษ' }, { key: 'en', value: 'Sattawat' }],
      role: customerRoleId,
      contact: {
        personalEmail: 'sattawat.nor@mfu.ac.th'
      }
    });

    const token = createMockGoogleToken({
      email: 'sattawat.nor@mfu.ac.th',
      name: 'Sattawat Nor'
    });

    const res = await request(app)
      .post('/api/v1/google/auth')
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.role).toBe('Admin');
    expect(res.body.data.token).toBeDefined();

    const verified = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(verified.role).toBe('Admin');

    const updated = await User.findOne({ 'contact.personalEmail': 'sattawat.nor@mfu.ac.th' }).populate('role');
    expect(updated.role.title.find(t => t.key === 'en').value).toBe('Admin');
  });
});

