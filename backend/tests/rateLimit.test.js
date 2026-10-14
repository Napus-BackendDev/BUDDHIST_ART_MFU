const express = require('express');
const request = require('supertest');
const { createApiLimiter, configureTrustProxy } = require('../config/rateLimit');

function app(config = {}, proxies = '127.0.0.1,::1') {
    const server = express();
    configureTrustProxy(server, { TRUSTED_PROXIES: proxies });
    server.use('/api/v1', createApiLimiter({ RATE_LIMIT_READ_MAX: '2', RATE_LIMIT_AUTH_MAX: '1', RATE_LIMIT_UPLOAD_MAX: '1', RATE_LIMIT_IMAGE_MAX: '1', RATE_LIMIT_WRITE_MAX: '1', ...config }));
    server.use((req, res) => res.sendStatus(req.path.includes('auth') ? 401 : 200));
    return server;
}
const get = (server, ip = '198.51.100.5') => request(server).get('/api/v1/artwork').set('X-Forwarded-For', ip);
beforeEach(() => { jest.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => jest.restoreAllMocks());

test('keeps separate clients behind the trusted proxy in separate buckets', async () => {
    const server = app();
    await get(server).expect(200); await get(server).expect(200); await get(server).expect(429);
    await get(server, '198.51.100.6').expect(200);
});
test('ignores spoofed addresses before the first untrusted hop', async () => {
    const server = app();
    await get(server, '203.0.113.1, 198.51.100.5').expect(200);
    await get(server, '203.0.113.2, 198.51.100.5').expect(200);
    await get(server, '203.0.113.3, 198.51.100.5').expect(429);
});
test('does not trust forwarded IPs when no proxy is configured', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const server = app({}, '');
    await get(server, '198.51.100.1').expect(200);
    await get(server, '198.51.100.2').expect(200);
    await get(server, '198.51.100.3').expect(429);
});
test.each(['true', '1', '0.0.0.0/0', '::/0', '127.0.0.1/33'])('rejects unsafe proxy configuration %s', value => {
    expect(() => configureTrustProxy(express(), { TRUSTED_PROXIES: value })).toThrow();
});
test('reads, images, uploads, writes and authentication have independent limits', async () => {
    const server = app();
    const client = {
        get: path => request(server).get(path).set('X-Forwarded-For', '198.51.100.5'),
        post: path => request(server).post(path).set('X-Forwarded-For', '198.51.100.5')
    };
    await get(server).expect(200); await get(server).expect(200); await get(server).expect(429);
    await client.get('/api/v1/submission/image/a').expect(200);
    await client.get('/api/v1/submission/image/b').expect(429);
    await client.post('/api/v1/news').expect(200);
    await client.post('/api/v1/news').expect(429);
    await client.post('/api/v1/news/upload').expect(200);
    await client.post('/api/v1/submission/upload').expect(429);
    await client.post('/api/v1/google/auth').expect(401);
    await client.post('/api/v1/user/auth/sign-in').expect(429);
});
test('successful logins do not exhaust the failed-login budget', async () => {
    const server = express();
    server.use('/api/v1', createApiLimiter({ RATE_LIMIT_AUTH_MAX: '1' }));
    server.post('/api/v1/google/auth', (req, res) => res.sendStatus(req.query.fail ? 401 : 200));
    await request(server).post('/api/v1/google/auth').expect(200);
    await request(server).post('/api/v1/google/auth').expect(200);
    await request(server).post('/api/v1/google/auth?fail=1').expect(401);
    await request(server).post('/api/v1/google/auth?fail=1').expect(429);
});
test('the window expires without leaving a separate 15-minute ban', async () => {
    const server = app({ RATE_LIMIT_READ_WINDOW_MS: '100', RATE_LIMIT_READ_MAX: '1' });
    await get(server).expect(200);
    const limited = await get(server).expect(429);
    expect(limited.body.code).toBe('RATE_LIMITED');
    expect(limited.headers['retry-after']).toBe('1');
    await new Promise(resolve => setTimeout(resolve, 120));
    await get(server).expect(200);
});
