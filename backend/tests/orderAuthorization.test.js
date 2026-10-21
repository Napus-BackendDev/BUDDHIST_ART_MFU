jest.mock('../helpers/google/Mail', () => ({ sendMail: jest.fn().mockResolvedValue({}) }));
jest.mock('../helpers/pdf.service', () => ({
  generateInvoice: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')),
  generateCertificateOfAuthenticity: jest.fn().mockResolvedValue(Buffer.from('%PDF-test'))
}));
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Order = require('../server/Project/Order/models/order.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');

describe('Order resource authorization', () => {
  jest.setTimeout(30000);
  let app, buyer, other, ownOrder, otherOrder, reserved, approved, buyerToken, adminToken;
  const call = (method, token, path = '/api/v1/order') => request(app)[method](path).set('x-access-token', token);
  beforeAll(async () => {
    app = await getApp();
    [buyer, other] = await User.create([{ studentId: 'QA-ORDER-BUYER' }, { studentId: 'QA-ORDER-OTHER' }]);
    [reserved, approved] = await Status.create([
      { code: 'RESERVED', title: [{ key: 'en', value: 'Reserved' }] },
      { code: 'APPROVED', title: [{ key: 'en', value: 'Approved' }] }
    ]);
    [ownOrder, otherOrder] = await Order.create([
      { user: buyer._id, status: reserved._id, contact: { name: 'Buyer' }, address: { bill: 'Original' } },
      { user: other._id, status: reserved._id, contact: { name: 'Other private customer' } }
    ]);
    const cfg = require('../config/config');
    buyerToken = jwt.sign({ userId: buyer._id, role: 'Customer' }, cfg.jwtSecret);
    adminToken = jwt.sign({ userId: other._id, role: 'Admin' }, cfg.jwtSecret);
  });
  afterAll(closeDatabase);
  it('rejects unsupported slip files with a client error before storage or state changes', async () => {
    await call('put', adminToken, '/api/v1/order/upload').field('_id', String(otherOrder._id))
      .attach('image', Buffer.from('QA not an image'), { filename: 'invalid-slip.txt', contentType: 'text/plain' }).expect(400);
    const unchanged = await Order.findById(otherOrder._id);
    expect(unchanged.image).toBe('');
    expect(String(unchanged.status)).toBe(String(reserved._id));
  });
  it('limits both list endpoints to the buyer while admin can list all', async () => {
    for (const [method, path] of [['get', '/api/v1/order'], ['post', '/api/v1/order/order']]) {
      const result = await call(method, buyerToken, path).send({ user: other._id });
      expect(result.status).toBe(200);
      expect(result.body.data.map(item => item._id)).toEqual([String(ownOrder._id)]);
    }
    expect((await call('get', adminToken)).body.data).toHaveLength(2);
  });
  it('rejects cross-account edits and document downloads', async () => {
    await call('put', buyerToken).send({ _id: otherOrder._id, remark: 'Unauthorized' }).expect(403);
    for (const type of ['invoice', 'certificate']) {
      await call('get', buyerToken, `/api/v1/order/${type}/${otherOrder._id}`).expect(403);
    }
    expect((await Order.findById(otherOrder._id)).remark).toBe('');
  });
  it('keeps invoice downloads available to the buyer and administrator', async () => {
    const invoice = await call('get', buyerToken, `/api/v1/order/invoice/${ownOrder._id}`).expect(200);
    expect(invoice.headers['content-type']).toMatch(/application\/pdf/);
    await call('get', adminToken, `/api/v1/order/invoice/${otherOrder._id}`).expect(200);
  });
  it('rejects self-approval and changes to payment/delivery records', async () => {
    await call('put', buyerToken).send({ _id: ownOrder._id, status: approved._id }).expect(403);
    for (const data of [{ image: 'fake-slip' }, { trackingId: 'fake-tracking' }, { invoiceStatus: 'Completed' }]) {
      await call('put', buyerToken).send({ _id: ownOrder._id, ...data }).expect(403);
    }
    expect(String((await Order.findById(ownOrder._id)).status)).toBe(String(reserved._id));
  });
  it('allows own shipping corrections during checkout but not after approval', async () => {
    await call('put', buyerToken).send({ _id: ownOrder._id, contact: { name: 'Corrected' }, address: { shipping: 'QA address' } }).expect(200);
    expect((await Order.findById(ownOrder._id)).contact.name).toBe('Corrected');
    await Order.updateOne({ _id: ownOrder._id }, { status: approved._id });
    await call('put', buyerToken).send({ _id: ownOrder._id, address: { shipping: 'Changed later' } }).expect(403);
    await Order.updateOne({ _id: ownOrder._id }, { status: reserved._id });
  });
  it('rejects creating an order attributed to another buyer', async () => {
    await call('post', buyerToken).send({ user: other._id, artwork: [] }).expect(403);
  });
  it('rejects malformed contact emails before reserving artworks or updating checkout details', async () => {
    const available = await Status.findOne({ code:'AVAILABLE' }) || await Status.create({code:'AVAILABLE',title:[{key:'en',value:'Available'}]});
    const art = await Artwork.create({artworkCode:'BA-QA-EMAIL',artist:other._id,price:700,
      status:{approval:approved._id,sale:available._id}});
    const before = (await Order.findById(ownOrder._id).lean()).contact;
    const count = await Order.countDocuments();
    for(const email of ['invalid-email','bad @example.test','',null,{address:'buyer@example.test'}]) {
      await call('post',buyerToken).send({artwork:[art._id],contact:{name:'QA Buyer',email}}).expect(400);
      await call('put',buyerToken).send({_id:ownOrder._id,contact:{name:'Must not save',email}}).expect(400);
    }
    expect(await Order.countDocuments()).toBe(count);
    expect((await Order.findById(ownOrder._id).lean()).contact).toEqual(before);
    expect(String((await Artwork.findById(art._id)).status.approval)).toBe(String(approved._id));
  });
  it('rejects deletion and cross-account slip uploads before storage', async () => {
    await call('put', buyerToken, '/api/v1/order/upload').field('_id', String(otherOrder._id))
      .attach('image', Buffer.from('QA forbidden file'), 'qa.png').expect(403);
    await call('delete', buyerToken).send({ _id: otherOrder._id }).expect(403);
    expect(await Order.exists({ _id: otherOrder._id })).toBeTruthy();
  });
  it('creates an order for the signed-in buyer without trusting payment metadata', async () => {
    const available = await Status.findOne({ code:'AVAILABLE' }) || await Status.create({ code: 'AVAILABLE', title: [{ key: 'en', value: 'Available' }] });
    const art = await Artwork.create({ artworkCode: 'BA-QA-AUTH-01', artist: other._id, price: 1000,
      title: [{ key: 'en', value: 'QA Authorization' }], status: { approval: approved._id, sale: available._id } });
    const result = await call('post', buyerToken).send({ artwork: [art._id],
      image: 'fake-slip', invoiceStatus: 'Completed', trackingId: 'fake-tracking' }).expect(200);
    expect(result.body.data._id).toBeDefined();
    const stored = await Order.findById(result.body.data._id).lean();
    expect(String(stored.user)).toBe(String(buyer._id));
    expect(stored.image).toBe('');
    expect(stored.trackingId).toBe('');
    expect(String(stored.status)).toBe(String(reserved._id));
  });
  it('releases the reserved artwork when its buyer cancels an unpaid order', async () => {
    const cancelled = await Status.create({ code: 'CANCELLED', title: [{ key: 'en', value: 'Cancelled' }] });
    const available = await Status.findOne({ code: 'AVAILABLE' });
    const art = await Artwork.create({ artworkCode: 'BA-QA-AUTH-CANCEL', artist: other._id,
      status: { approval: reserved._id, sale: available._id } });
    const order = await Order.create({ user: buyer._id, status: reserved._id, artwork: [art._id] });
    await call('put', buyerToken).send({ _id: order._id, status: cancelled._id }).expect(200);
    const restored = await Artwork.findById(art._id).lean();
    expect(String(restored.status.approval)).toBe(String(approved._id));
    expect(String(restored.status.sale)).toBe(String(available._id));
  });
});
