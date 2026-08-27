const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Group = require('../server/Project/Settings/models/group.model');
const Status = require('../server/Project/Settings/models/status.model');
const Category = require('../server/Project/Artwork/models/category.model');

let cfg;
const token = role => jwt.sign({ userId: '000000000000000000000001', role }, cfg.jwtSecret, { expiresIn: '5m' });
const bilingual = (th, en) => [{ key: 'th', value: th }, { key: 'en', value: en }];

describe('Admin system settings', () => {
  let app;
  beforeAll(async () => { app = await getApp(); cfg = require('../config/config'); });
  afterAll(async () => { await closeDatabase(); });
  beforeEach(async () => { await Promise.all([Group.deleteMany({}), Status.deleteMany({}), Category.deleteMany({})]); });

  test('requires admin role for settings mutations', async () => {
    const payload = { title: bilingual('กลุ่มทดสอบ', 'Test Group'), description: bilingual('', '') };
    await request(app).post('/api/v1/settings/group').send(payload).expect(401);
    await request(app).post('/api/v1/settings/group').set('X-Access-Token', token('artist')).send(payload).expect(403);
  });

  test('creates and updates bilingual group/status/category while keeping codes immutable', async () => {
    const admin = { 'X-Access-Token': token('admin') };
    const groupResponse = await request(app).post('/api/v1/settings/group').set(admin).send({ title: bilingual('กลุ่มทดสอบ', 'Test Group'), description: bilingual('', '') }).expect(200);
    const group = groupResponse.body.data;
    expect(group.code).toMatch(/^GROUP_/);

    const statusResponse = await request(app).post('/api/v1/settings/status').set(admin).send({ group: group._id, title: bilingual('รอตรวจ', 'Review'), description: bilingual('', '') }).expect(200);
    const status = statusResponse.body.data;
    expect(status.code).toMatch(/^STATUS_/);

    const categoryResponse = await request(app).post('/api/v1/artwork/category').set(admin).send({ title: bilingual('จิตรกรรมใหม่', 'New Painting'), description: bilingual('', '') }).expect(200);
    const category = categoryResponse.body.data;
    expect(category.code).toMatch(/^CATEGORY_/);

    const updated = await request(app).put('/api/v1/settings/group').set(admin).send({ _id: group._id, code: 'SHOULD_NOT_CHANGE', title: bilingual('กลุ่มแก้ไข', 'Edited Group'), description: bilingual('', '') }).expect(200);
    expect(updated.body.data.code).toBe(group.code);
    expect(updated.body.data.title.find(item => item.key === 'en').value).toBe('Edited Group');

    const updatedStatus = await request(app).put('/api/v1/settings/status').set(admin).send({ _id: status._id, group: group._id, code: 'SHOULD_NOT_CHANGE', title: bilingual('สถานะใหม่', 'Edited Status'), description: bilingual('', '') }).expect(200);
    expect(updatedStatus.body.data.code).toBe(status.code);
    const updatedCategory = await request(app).put('/api/v1/artwork/category').set(admin).send({ _id: category._id, code: 'SHOULD_NOT_CHANGE', title: bilingual('หมวดใหม่', 'Edited Category'), description: bilingual('', '') }).expect(200);
    expect(updatedCategory.body.data.code).toBe(category.code);
  });

  test('returns impact data and protects core workflow status from deletion', async () => {
    const group = await Group.create({ code: 'SHOW_STATUS', title: bilingual('การแสดงผล', 'Show Status'), description: bilingual('', '') });
    const status = await Status.create({ code: 'PENDING', group: group._id, title: bilingual('รอตรวจ', 'Renamed Pending'), description: bilingual('', '') });
    const admin = { 'X-Access-Token': token('Admin') };
    const impact = await request(app).get(`/api/v1/settings/status/${status._id}/impact`).set(admin).expect(200);
    expect(impact.body.data.protected).toBe(true);
    await request(app).delete('/api/v1/settings/status').set(admin).send({ id: status._id }).expect(409);
    await request(app).get(`/api/v1/settings/status/${status._id}/impact`).set({ 'X-Access-Token': token('artist') }).expect(403);
  });

  test('deletes an unused non-core status on standalone development MongoDB', async () => {
    const group = await Group.create({ code: 'CUSTOM_GROUP', title: bilingual('กลุ่มกำหนดเอง', 'Custom Group'), description: bilingual('', '') });
    const status = await Status.create({ code: 'CUSTOM_STATUS', group: group._id, title: bilingual('กำหนดเอง', 'Custom'), description: bilingual('', '') });
    const deletion = await request(app).delete('/api/v1/settings/status').set('X-Access-Token', token('admin')) .send({ id: status._id });
    if (deletion.status !== 200) console.log('settings deletion failure', deletion.status, deletion.body);
    expect(deletion.status).toBe(200);
    expect(await Status.exists({ _id: status._id })).toBeFalsy();
  });
});
