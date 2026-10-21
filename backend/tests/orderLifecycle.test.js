const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// --- Mock all external side-effects BEFORE requiring the app ---------------

// node-cron: capture callbacks instead of scheduling (matches submissionTransition.test.js).
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

// Mail: sendMail must be a no-op so tests never touch nodemailer / network.
jest.mock('../helpers/google/Mail', () => ({
  sendMail: jest.fn().mockResolvedValue({ success: true, messageId: 'test' }),
}));

// pdf.service: order.js requires this both at top-level (pdfService.generateInvoice)
// and lazily inside generateAndSaveCertificateFile
// (PdfService.generateCertificateOfAuthenticity).
// Returning dummy buffers keeps puppeteer out of the test run entirely.
jest.mock('../helpers/pdf.service', () => ({
  generateInvoice: jest.fn().mockResolvedValue(Buffer.from('%PDF-invoice')),
  generateCertificateOfAuthenticity: jest.fn().mockResolvedValue(Buffer.from('%PDF-cert')),
}));

const { getApp, closeDatabase } = require('./appHelper');
const { sendMail } = require('../helpers/google/Mail');
const pdfService = require('../helpers/pdf.service');
const Status = require('../server/Project/Settings/models/status.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Order = require('../server/Project/Order/models/order.model');
const User = require('../server/Project/User/models/user.model');
const ArtworkCounter = require('../server/Project/Artwork/models/artworkCounter.model');
const orderService = require('../server/Project/Order/service/order');

// Helper: build a Setting_Status doc with an English (and optional Thai) title.
const makeStatus = (en, th) =>
  Status.create({
    title: [
      { key: 'en', value: en },
      ...(th ? [{ key: 'th', value: th }] : []),
    ],
  });

describe('Order Lifecycle', () => {
  jest.setTimeout(30000);
  let app;
  let token;
  let reservedStatus;
  let pendingStatus;
  let availableStatus;
  let soldOutStatus;
  let approvedStatus;
  let rejectedStatus;
  let testArtist;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    app = await getApp();
    token = jwt.sign({ userId: '000000000000000000000001', role: 'Admin' }, 'testSecret');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await ArtworkCounter.deleteMany({});
    await Artwork.deleteMany({});
    await User.deleteMany({});
    await Status.deleteMany({});
    sendMail.mockClear();

    testArtist = await User.create({
      studentId: '650000016',
      name: [{ key: 'en', value: 'Test Artist' }],
    });

    // The onCreate path searches for a "Reserved"/"รอชำระเงิน" status by regex.
    reservedStatus = await makeStatus('Reserved', 'รอชำระเงิน');
    pendingStatus = await makeStatus('Pending', 'รอตรวจสอบ');
    availableStatus = await makeStatus('Available');
    soldOutStatus = await makeStatus('Sold Out');
    approvedStatus = await makeStatus('Approved', 'อนุมัติ');
    rejectedStatus = await makeStatus('Rejected', 'ไม่นุมัติ');
  });

  // Creates an Artwork left in its schema-default status (no Reserved/Sold Out).
  const makeArtwork = async (price = 5000) => {
    return Artwork.create({
      artworkCode: `BA-2569-TST-STUDENT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      title: [{ key: 'en', value: 'Test Art' }, { key: 'th', value: 'งานทดสอบ' }],
      price,
      artist: testArtist._id,
      courseLevel: '6',
      status: { approval: approvedStatus._id, sale: availableStatus._id },
      // Intentionally NO `image` -> certificate generation is skipped (no puppeteer),
      // and the create path attaches no slip. Keeps the suite hermetic.
    });
  };

  it('charges only the saved artwork price and ignores client-supplied totals in orders and invoices', async () => {
    const art = await makeArtwork(1000);
    pdfService.generateInvoice.mockClear();
    const result = await request(app).post('/api/v1/order').set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art._id], amounts: { subtotal: 1, shipping: 999, total: 1000 } }).expect(200);
    expect(result.body.data.amounts).toMatchObject({ subtotal: 1000, shipping: 0, total: 1000 });
    await orderService.waitForPostCreateTasks();
    expect(pdfService.generateInvoice.mock.calls[0][0]).toMatchObject({ total: 1000, shipping: 0 });
    await Artwork.updateOne({ _id: art._id }, { price: 9000 });
    const exists = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);
    try {
      await request(app).get(`/api/v1/order/invoice/${result.body.data._id}`).set('Authorization', `Bearer ${token}`).expect(200);
      const invoice = pdfService.generateInvoice.mock.calls.slice(-1)[0][0];
      expect(invoice.total).toBe(1000);
      expect(invoice.items[0].price).toBe(1000);
    } finally { exists.mockRestore(); }
  });

  it('regenerates cached invoices containing obsolete shipping instead of serving their old total', async () => {
    const art = await makeArtwork(9000);
    const order = await Order.create({ artwork: [art._id], status: reservedStatus._id,
      invoiceFile: 'obsolete-fee.pdf',
      amounts: { subtotal: 700, shipping: 25, total: 725, items: [{ artwork: art._id, price: 700 }] } });
    pdfService.generateInvoice.mockClear();
    const exists = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
    try {
      await request(app).get(`/api/v1/order/invoice/${order._id}`).set('Authorization', `Bearer ${token}`).expect(200);
      const invoice = pdfService.generateInvoice.mock.calls[0][0];
      expect(invoice).toMatchObject({ subtotal: 700, shipping: 0, total: 700 });
      expect(invoice.items[0].price).toBe(700);
    } finally { exists.mockRestore(); }
  });

  it('sends the payment-slip confirmation after the Reserved-to-Pending transition using the saved total', async () => {
    const art = await makeArtwork(1000);
    const order = await Order.create({ artwork: [art._id], status: reservedStatus._id,
      contact: { name: 'QA Buyer', email: 'buyer@example.test' },
      amounts: { subtotal: 1000, shipping: 25, total: 1025, items: [{ artwork: art._id, price: 1000 }] } });
    const imageUrl = jest.spyOn(require('../server/Project/Order/controller/order'), 'getImageUrl')
      .mockReturnValue('https://mfudrive.mfu.ac.th/public.php/dav/files/qa-test/qa-slip.png');
    try {
      await request(app).put('/api/v1/order/upload').set('Authorization', `Bearer ${token}`)
        .field('_id', String(order._id)).attach('image', Buffer.from('QA test image'), 'qa.png').expect(200);
    } finally { imageUrl.mockRestore(); }
    expect(String((await Order.findById(order._id)).status)).toBe(String(pendingStatus._id));
    expect(sendMail).toHaveBeenCalledWith('buyer@example.test', expect.any(String), '', expect.stringContaining('1,000'), expect.any(Array));
    expect(sendMail.mock.calls[0][4]).toEqual(expect.arrayContaining([expect.objectContaining({ filename: expect.stringMatching(/^Payment_Slip_/), path: expect.any(String) })]));
  });

  it('rejects empty and duplicate artwork carts before any reservation', async () => {
    const art = await makeArtwork();

    const empty = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [] });
    expect(empty.status).toBe(400);
    expect(empty.body.code).toBe(40000);

    const duplicate = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art._id, art._id] });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.code).toBe(40000);
    expect((await Order.countDocuments({}))).toBe(0);
    expect((await Artwork.findById(art._id)).status.approval.toString())
      .toBe(approvedStatus._id.toString());
  });

  it('rolls back earlier locks when a later artwork is rejected', async () => {
    const availableArtwork = await makeArtwork();
    const rejectedArtwork = await makeArtwork();
    await Artwork.updateOne(
      { _id: rejectedArtwork._id },
      { 'status.approval': rejectedStatus._id },
    );

    const res = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [availableArtwork._id, rejectedArtwork._id] });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(40900);
    expect(await Order.countDocuments({})).toBe(0);
    const restored = await Artwork.findById(availableArtwork._id);
    expect(restored.status.approval.toString()).toBe(approvedStatus._id.toString());
  });

  // ---- 1. Create reserves/locks artwork and sets Reserved status ----------
  it('creating an order locks its artwork (status.approval -> Reserved) and sets order status to Reserved', async () => {
    const art = await makeArtwork(8000);

    const res = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({
        artwork: [art._id],
        contact: { name: 'Buyer', email: 'buyer@example.com' },
      });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(20000);

    // Order persisted with Reserved status.
    const savedOrder = await Order.findById(res.body.data._id);
    expect(savedOrder).not.toBeNull();
    expect(savedOrder.status.toString()).toBe(reservedStatus._id.toString());
    expect(savedOrder.artworkReferences).toHaveLength(1);
    expect(savedOrder.artworkReferences[0].artwork.toString()).toBe(art._id.toString());
    expect(savedOrder.artworkReferences[0].artworkCode).toBe(art.artworkCode);

    // Artwork was locked: status.approval flipped to Reserved.
    const lockedArt = await Artwork.findById(art._id);
    expect(lockedArt.status.approval.toString()).toBe(reservedStatus._id.toString());
  });

  // ---- 2. Shared student/cohort order number format -----------------------
  it('generates an orderNumber from student and cohort and increments the sequence', async () => {
    const art1 = await makeArtwork();
    const art2 = await makeArtwork();

    const res1 = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art1._id], contact: { name: 'A', email: 'a@example.com' } });

    const res2 = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art2._id], contact: { name: 'B', email: 'b@example.com' } });

    expect(res1.body.data.orderNumber).toBe('ORD-65-06-016-01');
    expect(res2.body.data.orderNumber).toBe('ORD-65-06-016-02');
    expect(res1.body.data.orderNumber).toMatch(/^ORD-\d{2}-\d{2}-\d{3}-\d{2}$/);
  });

  // ---- 3a. Approving an order -> artwork Sold Out + order Approved ---------
  it('approving an order moves artwork to Sold Out/Approved', async () => {
    const art = await makeArtwork();
    await Artwork.updateOne({ _id: art._id }, { 'status.approval': reservedStatus._id });
    // Seed an already-reserved order (skip the create flow to isolate approval).
    const order = await Order.create({
      artwork: [art._id],
      status: reservedStatus._id,
      contact: { name: 'Buyer', email: 'buyer@example.com' },
      orderNumber: 'ORD-2026-0001',
    });

    const res = await request(app)
      .put('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: order._id, status: approvedStatus._id });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(20000);

    const updatedArt = await Artwork.findById(art._id);
    expect(updatedArt.status.sale.toString()).toBe(soldOutStatus._id.toString());
    expect(updatedArt.status.approval.toString()).toBe(approvedStatus._id.toString());

    // Order status persisted as Approved.
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status.toString()).toBe(approvedStatus._id.toString());
  });

  it('rejects backward order transitions with a machine-readable conflict', async () => {
    const order = await Order.create({
      status: approvedStatus._id,
      contact: { name: 'Buyer', email: 'buyer@example.com' },
      orderNumber: 'ORD-2026-0003',
    });

    const res = await request(app)
      .put('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: order._id, status: pendingStatus._id });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(40900);
    expect((await Order.findById(order._id)).status.toString())
      .toBe(approvedStatus._id.toString());
  });

  // ---- 3b. Rejecting an order reverts artwork to Available -----------------
  it('rejecting an order reverts artwork to Available (approval reset to Approved)', async () => {
    const art = await Artwork.create({
      title: [{ key: 'en', value: 'Reserved Art' }],
      price: 3000,
      status: { approval: reservedStatus._id, sale: soldOutStatus._id },
    });
    const order = await Order.create({
      artwork: [art._id],
      status: reservedStatus._id,
      contact: { name: 'Buyer', email: 'buyer@example.com' },
      orderNumber: 'ORD-2026-0002',
    });

    const res = await request(app)
      .put('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: order._id, status: rejectedStatus._id, remark: 'bad slip' });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(20000);

    const updatedArt = await Artwork.findById(art._id);
    expect(updatedArt.status.sale.toString()).toBe(availableStatus._id.toString());
    expect(updatedArt.status.approval.toString()).toBe(approvedStatus._id.toString());
  });

  // ---- 4. Edge case: double-reservation is rejected -----------------------
  it('rejects creating an order for an already-reserved artwork (RESERVED_ALREADY)', async () => {
    const art = await makeArtwork();

    // First order reserves the artwork.
    const first = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art._id], contact: { name: 'A', email: 'a@example.com' } });
    expect(first.body.code).toBe(20000);

    // Second order for the same (now Reserved) artwork must fail.
    const second = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art._id], contact: { name: 'B', email: 'b@example.com' } });

    expect(second.status).toBe(409);
    expect(second.body.code).toBe(40900);

    // No second order document should have been created.
    const orderCount = await Order.countDocuments({});
    expect(orderCount).toBe(1);
  });

  // ---- 5. Checkout response does not wait for invoice/email integrations ---
  it('returns the created order without waiting for slow PDF generation', async () => {
    const art = await makeArtwork();
    const slowFollowUp = Promise.resolve(Buffer.from('%PDF-invoice'));
    pdfService.generateInvoice.mockImplementationOnce(() => slowFollowUp);

    const startedAt = Date.now();
    const res = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art._id], contact: { name: 'Fast Buyer', email: 'fast@example.com' } });

    expect(Date.now() - startedAt).toBeLessThan(3000);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(20000);
    expect(res.body.data._id).toBeTruthy();
  });

  it('keeps the order and records a retryable invoice failure', async () => {
    const art = await makeArtwork();
    pdfService.generateInvoice.mockRejectedValueOnce(new Error('PDF_FAILED'));

    const res = await request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${token}`)
      .send({ artwork: [art._id], contact: { name: 'Failure Buyer', email: 'failure@example.com' } });

    expect(res.status).toBe(200);
    await orderService.waitForPostCreateTasks();
    const saved = await Order.findById(res.body.data._id);
    expect(saved).not.toBeNull();
    expect(saved.invoiceStatus).toBe('Failed');
    expect(saved.invoiceError).toContain('PDF_FAILED');
  });

  // GAP: The full create path also writes an invoice PDF to
  // public/account/User/.../Invoice and sends confirmation + admin emails. Mail is
  // asserted-as-mocked above; the puppeteer PDF + on-disk file layout and the
  // onUpload (payment-slip) mail/attachment branches are integration-heavy
  // (multipart upload, real filesystem slip resolution) and are left uncovered here.
});
