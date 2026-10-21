const express = require('express');
const request = require('supertest');
const sharp = require('sharp');
jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('../server/Project/Submission/models/submission.model', () => ({ findOne: jest.fn() }));
const axios = require('axios');
const Submission = require('../server/Project/Submission/models/submission.model');
const { onImage } = require('../server/Project/Submission/service/image');
const id = '6acf25584e9fdf5a3408f5ba';
const app = express();
app.get('/image/:artworkId', onImage);
let image;
const stored = (source, status = 'Approved') => Submission.findOne.mockReturnValue({ select: () => ({ populate: () => ({ lean: async () => ({ assignments: [{ artworks: [{ _id: id, image: source, status:{title:[{key:'en',value:status}]} }] }] }) }) }) });

beforeAll(async () => { image = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#abcdef' } }).png().toBuffer(); });
beforeEach(() => jest.clearAllMocks());

test('does not fetch unpublished artwork images for a public visitor', async () => {
    stored('https://mfudrive.mfu.ac.th/s/unpublished/download', 'Pending');
    await request(app).get(`/image/${id}`).expect(404);
    expect(axios.get).not.toHaveBeenCalled();
});

test('serves a stored Drive image as JPEG through the API without using the thumbnail endpoint', async () => {
    stored('https://drive.google.com/thumbnail?id=public-image&sz=w1600');
    axios.get.mockResolvedValue({ status: 200, headers: { 'content-type': 'image/png' }, data: image });
    const res = await request(app).get(`/image/${id}`).expect(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
    expect(res.headers['cache-control']).toContain('max-age=3600');
    expect((await sharp(res.body).metadata()).format).toBe('jpeg');
    expect(axios.get.mock.calls[0][0]).toBe('https://lh3.googleusercontent.com/d/public-image');
    await request(app).get(`/image/${id}`).expect(200);
    expect(axios.get).toHaveBeenCalledTimes(1);
});

test('falls back to public download when the first Google endpoint is throttled', async () => {
    stored('https://drive.google.com/thumbnail?id=rate-limited&sz=w1600');
    axios.get.mockResolvedValueOnce({ status: 429, headers: {} }).mockResolvedValueOnce({ status: 200, headers: { 'content-type': 'image/png' }, data: image });
    await request(app).get(`/image/${id}`).expect(200);
    expect(axios.get.mock.calls[1][0]).toBe('https://drive.google.com/uc?export=download&id=rate-limited');
});

test('does not fetch arbitrary URLs stored in image fields', async () => {
    stored('http://127.0.0.1/private');
    await request(app).get(`/image/${id}`).expect(502);
    expect(axios.get).not.toHaveBeenCalled();
});

test('rejects redirects to unapproved hosts before making another request', async () => {
    stored('https://mfudrive.mfu.ac.th/s/redirect-test/download');
    axios.get.mockResolvedValue({ status: 302, headers: { location: 'https://127.0.0.1/private' } });
    await request(app).get(`/image/${id}`).expect(502);
    expect(axios.get).toHaveBeenCalledTimes(1);
});

test('never serves a provider login page as an image', async () => {
    stored('https://mfudrive.mfu.ac.th/s/private-test/download');
    axios.get.mockResolvedValue({ status: 200, headers: { 'content-type': 'text/html' }, data: Buffer.from('<html>Sign in</html>') });
    await request(app).get(`/image/${id}`).expect(502);
});

test('serves large MFU Drive originals above 20 MB as bounded JPEG previews', async () => {
    stored('https://mfudrive.mfu.ac.th/s/large-original-test/download');
    const original = await sharp(require('crypto').randomBytes(2700 * 2700 * 3), {
        raw: { width: 2700, height: 2700, channels: 3 }
    }).png({ compressionLevel: 0 }).toBuffer();
    expect(original.length).toBeGreaterThan(20 * 1024 * 1024);
    axios.get.mockResolvedValue({ status: 200, headers: { 'content-type': 'image/png' }, data: original });
    const res = await request(app).get(`/image/${id}`).expect(200);
    const metadata = await sharp(res.body).metadata();
    expect(metadata.format).toBe('jpeg');
    expect(metadata.width).toBe(1600);
    expect(metadata.height).toBe(1600);
    expect(axios.get.mock.calls[0][1].maxContentLength).toBe(25 * 1024 * 1024);
});

test('rejects provider images above the 25 MB preview download limit', async () => {
    stored('https://mfudrive.mfu.ac.th/s/oversized-test/download');
    axios.get.mockResolvedValue({ status: 200, headers: { 'content-type': 'image/png' }, data: Buffer.alloc(25 * 1024 * 1024 + 1) });
    await request(app).get(`/image/${id}`).expect(502);
});

test('returns 404 for missing images and rejects invalid artwork identifiers', async () => {
    stored(null);
    await request(app).get(`/image/${id}`).expect(404);
    Submission.findOne.mockClear();
    await request(app).get('/image/not-an-id').expect(400);
    expect(Submission.findOne).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
});
