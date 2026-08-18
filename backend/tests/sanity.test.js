const request = require('supertest');
const { getApp, closeDatabase } = require('./appHelper');

describe('Sanity Check', () => {
  jest.setTimeout(30000);
  let app;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should respond to health endpoint', async () => {
    const res = await request(app).get('/healthz');
    // Note: /healthz requires isReady = true which has a 10s delay.
    // If not ready, it returns 503. Both status codes prove the route was reached.
    expect([200, 503]).toContain(res.status);
  });
});
