jest.mock('../helpers/google/Mail', () => ({ sendMail: jest.fn().mockResolvedValue({}) }));
jest.mock('../helpers/pdf.service', () => ({ generateInvoice: jest.fn(), generateCertificateOfAuthenticity: jest.fn() }));
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Order = require('../server/Project/Order/models/order.model');
const Status = require('../server/Project/Settings/models/status.model');
const access = require('../middleware/orderAccessMiddleware');
const controller = require('../server/Project/Order/controller/order');
const service = require('../server/Project/Order/service/order');

describe('Unpaid order payment deadline', () => {
  jest.setTimeout(30000);
  let app, reserved, pending;
  const buyer = new mongoose.Types.ObjectId();
  beforeAll(async () => {
    app = await getApp();
    [reserved, pending] = await Status.create([
      { code: 'RESERVED', title: [{ key: 'en', value: 'Reserved' }] },
      { code: 'PENDING', title: [{ key: 'en', value: 'Pending' }] }
    ]);
  });
  afterAll(closeDatabase);
  const makeOrder = age => Order.create({ user: buyer, status: reserved._id, image: '', createdAt: new Date(Date.now() - age) });

  test.each([24, 25])('rejects %sh unpaid slips before storage even before cron cancellation', async hours => {
    const order = await makeOrder(hours * 3600000);
    await expect(access.authorizeUpload({ user: { userId: String(buyer), role: 'Customer' }, body: { _id: String(order._id) } }))
      .rejects.toMatchObject({ status: 409 });
    expect(String((await Order.findById(order._id)).status)).toBe(String(reserved._id));
  });

  test('allows a current unpaid reservation', async () => {
    const order = await makeOrder(23 * 3600000);
    await expect(access.authorizeUpload({ user: { userId: String(buyer), role: 'Customer' }, body: { _id: String(order._id) } })).resolves.toBeUndefined();
  });

  test('expired multipart upload is rejected before MFU Drive storage and never changes the order', async () => {
    const order = await makeOrder(25 * 3600000);
    const token = jwt.sign({ userId: String(buyer), role: 'Customer' }, require('../config/config').jwtSecret);
    const mirror = jest.spyOn(require('../helpers/mfuDrive'), 'uploadLocalFile').mockResolvedValue({});
    try {
      await request(app).put('/api/v1/order/upload').set('x-access-token', token)
        .field('_id', String(order._id)).attach('image', Buffer.from('QA expired slip'), 'qa.png').expect(409);
      expect(mirror).not.toHaveBeenCalled();
      const saved = await Order.findById(order._id);
      expect(saved.image).toBe('');
      expect(String(saved.status)).toBe(String(reserved._id));
    } finally { mirror.mockRestore(); }
  });

  test('service rechecks the deadline before image URL generation and database transition', async () => {
    const order = await makeOrder(25 * 3600000);
    const query = jest.spyOn(controller, 'onQuery').mockResolvedValue({ ...order.toObject(), status: reserved.toObject() });
    const image = jest.spyOn(controller, 'getImageUrl').mockReturnValue('qa-slip.png');
    const update = jest.spyOn(controller, 'onUpdate').mockResolvedValue(null);
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    try {
      await service.onUpload({ body: { _id: String(order._id) }, file: { destination: 'qa-fixture', filename: 'qa-slip.png' } }, response);
      expect(response.status).toHaveBeenCalledWith(409);
      expect(image).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    } finally { query.mockRestore(); image.mockRestore(); update.mockRestore(); }
  });

  test('the final database write also requires a reservation inside the payment window', async () => {
    const order = await makeOrder(23 * 3600000);
    const query = jest.spyOn(controller, 'onQuery').mockResolvedValue({ ...order.toObject(), status: reserved.toObject() });
    const image = jest.spyOn(controller, 'getImageUrl').mockReturnValue('qa-slip.png');
    const update = jest.spyOn(controller, 'onUpdate').mockResolvedValue(null);
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const started = Date.now();
    try {
      await service.onUpload({ body: { _id: String(order._id) }, file: { destination: 'qa-fixture', filename: 'qa-slip.png' } }, response);
      const filter = update.mock.calls[0][0];
      expect(filter.createdAt.$gt).toBeInstanceOf(Date);
      expect(filter.createdAt.$gt.getTime()).toBeGreaterThanOrEqual(started - 24 * 3600000);
      expect(String(filter.status)).toBe(String(reserved._id));
      expect(filter.$or).toHaveLength(3);
    } finally { query.mockRestore(); image.mockRestore(); update.mockRestore(); }
  });
});
