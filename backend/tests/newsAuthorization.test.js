const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');

describe('News mutation authorization', () => {
  jest.setTimeout(30000);
  let app, cfg;
  const token = role => jwt.sign({ userId: '000000000000000000000001', role }, cfg.jwtSecret);
  beforeAll(async () => { app = await getApp(); cfg = require('../config/config'); });
  afterAll(closeDatabase);
  test.each(['Customer', 'Artist'])('%s cannot create, edit, delete or upload news', async role => {
    for (const method of ['post', 'put', 'delete']) {
      await request(app)[method]('/api/v1/news').set('x-access-token', token(role)).send({}).expect(403);
    }
    await request(app).post('/api/v1/news/upload').set('x-access-token', token(role)).expect(403);
  });
  it('keeps published news public and permits administrator edits', async () => {
    const created = await request(app).post('/api/v1/news').set('x-access-token', token('Admin'))
      .send({ title: [{ key: 'en', value: 'QA News' }] }).expect(200);
    expect(created.body.data._id).toBeDefined();
    const id = created.body.data._id;
    await request(app).put('/api/v1/news').set('x-access-token', token('Admin'))
      .send({ _id: id, title: [{ key: 'en', value: 'QA Updated' }] }).expect(200);
    const list = await request(app).get('/api/v1/news').expect(200);
    expect(list.body.data.find(n => n._id === id).title[0].value).toBe('QA Updated');
  });
  it('returns 413 for oversized news images without modifying saved images', async () => {
    const created = await request(app).post('/api/v1/news').set('x-access-token', token('Admin'))
      .send({ title: [{ key: 'en', value: 'QA Oversized News Image' }] }).expect(200);
    const id = created.body.data._id;
    const result = await request(app).post('/api/v1/news/upload').set('x-access-token', token('Admin'))
      .field('_id', id).attach('images', Buffer.alloc(10 * 1024 * 1024 + 1), { filename: 'oversize.png', contentType: 'image/png' }).expect(413);
    expect(result.body.code).toBe('41300');
    const doc = await require('mongoose').model('New').findById(id).lean();
    expect(doc.images).toEqual([]);
  });
});

