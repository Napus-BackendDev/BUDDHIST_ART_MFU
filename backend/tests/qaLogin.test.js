const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
jest.mock('node-cron', () => ({ schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })) }));
const { getApp, closeDatabase } = require('./appHelper');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');
const qaLogin = require('../server/qa/qaLogin.routes');

const local = { NODE_ENV: 'development', QA_LOCAL_LOGIN: 'true', MONGODB: 'mongodb://127.0.0.1:27017/qa' };

describe('guarded local QA login', () => {
  jest.setTimeout(30000);
  let app;
  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    await getApp();
    const role = await Role.create({ title: [{ key: 'en', value: 'Admin' }] });
    await User.create({ studentId: 'QA-LOCAL-ADMIN', role: role._id, contact: { personalEmail: 'qa-admin@local.test' } });
    await User.create({ studentId: 'REAL-USER', role: role._id, contact: { personalEmail: 'real@mfu.ac.th' } });
    app = express().use(express.json()).use('/qa', qaLogin.router);
  });
  afterAll(closeDatabase);

  test.each([
    ['production', { ...local, NODE_ENV: 'production' }],
    ['flag off', { ...local, QA_LOCAL_LOGIN: 'false' }],
    ['flag missing', { NODE_ENV: 'development', MONGODB: local.MONGODB }],
    ['remote database', { ...local, MONGODB: 'mongodb+srv://u:p@cluster.example.net/db' }],
  ])('is disabled for %s', (_, env) => expect(qaLogin.isEnabled(env)).toBe(false));

  test('is enabled only for local development with the flag', () => expect(qaLogin.isEnabled(local)).toBe(true));

  test('main app does not mount the route without the flag', async () => {
    const res = await request(await getApp()).post('/api/v1/qa/login').send({ email: 'qa-admin@local.test' });
    expect(res.status).toBe(404);
  });

  test('issues the same session shape as Google sign-in for a seeded QA account', async () => {
    const res = await request(app).post('/qa/login').send({ email: 'qa-admin@local.test' });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('Admin');
    expect(jwt.verify(res.body.data.token, 'testSecret').email).toBe('qa-admin@local.test');
  });

  test.each(['real@mfu.ac.th', 'admin@local.test', '', { $ne: null }])('refuses non-QA email %p', async email => {
    const res = await request(app).post('/qa/login').send({ email });
    expect(res.status).toBe(400);
    expect(res.body.data?.token).toBeUndefined();
  });

  test('refuses unseeded QA account', async () => {
    const res = await request(app).post('/qa/login').send({ email: 'qa-ghost@local.test' });
    expect(res.status).toBe(404);
  });
});
