const express = require('express');
const request = require('supertest');
jest.mock('../config/logger', () => jest.fn());
const configureMiddlewares = require('../middleware/middlewares');

const keys = ['NODE_ENV', 'DISABLE_IP_BLOCKING', 'API_ALLOWED_IPS', 'RATE_LIMIT_READ_MAX'];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
beforeEach(() => {
    process.env.NODE_ENV = 'production';
    process.env.RATE_LIMIT_READ_MAX = '2';
    delete process.env.DISABLE_IP_BLOCKING;
    delete process.env.API_ALLOWED_IPS;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
    jest.restoreAllMocks();
    for (const key of keys) {
        if (original[key] === undefined) delete process.env[key];
        else process.env[key] = original[key];
    }
});
function app(disabled, remoteAddress) {
    if (disabled !== undefined) process.env.DISABLE_IP_BLOCKING = disabled;
    const server = express();
    if (remoteAddress) server.use((req, res, next) => {
        Object.defineProperty(req, 'ip', { value: remoteAddress }); next();
    });
    configureMiddlewares(server);
    server.get('/api/v1/check', (req, res) => res.sendStatus(200));
    server.get('/healthz', (req, res) => res.sendStatus(200));
    return server;
}
test('production limits API requests with 429 without globally banning health or static routes', async () => {
    const server = app();
    await request(server).get('/api/v1/check').expect(200);
    await request(server).get('/api/v1/check').expect(200);
    const limited = await request(server).get('/api/v1/check').expect(429);
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    await request(server).get('/api/v1/check').expect(429);
    await request(server).get('/healthz').expect(200);
});
test('retains the explicit development bypass', async () => {
    const server = app('true');
    for (let i = 0; i < 4; i++) await request(server).get('/api/v1/check').expect(200);
});
test('development can explicitly enable protection and explicitly disable it', async () => {
    process.env.NODE_ENV = 'development';
    const protectedServer = app('false');
    await request(protectedServer).get('/api/v1/check').expect(200);
    await request(protectedServer).get('/api/v1/check').expect(200);
    await request(protectedServer).get('/api/v1/check').expect(429);
    const disabledServer = app('true');
    for (let i = 0; i < 4; i++) await request(disabledServer).get('/api/v1/check').expect(200);
});
test('public gallery accepts real client IPs while an explicit private allowlist still blocks', async () => {
    await request(app('false', '203.0.113.99')).get('/api/v1/check').expect(200);
    process.env.API_ALLOWED_IPS = '203.0.113.10';
    await request(app('false', '203.0.113.99')).get('/api/v1/check').expect(403);
    await request(app('false', '203.0.113.10')).get('/api/v1/check').expect(200);
    await request(app('true', '203.0.113.99')).get('/api/v1/check').expect(200);
});
