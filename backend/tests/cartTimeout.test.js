const mongoose = require('mongoose');

// Mock node-cron before loading the app / cron module, so schedule() captures
// the callback instead of registering a real timer.
const cronCallbacks = [];
jest.mock('node-cron', () => {
  return {
    schedule: jest.fn((pattern, callback) => {
      cronCallbacks.push(callback);
      return {
        start: jest.fn(),
        stop: jest.fn()
      };
    })
  };
});

const { getApp, closeDatabase } = require('./appHelper');
const Order = require('../server/Project/Order/models/order.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Status = require('../server/Project/Settings/models/status.model');
const { buildPostTermSale, constants } = require('../server/Project/Artwork/service/postTermSale');

// Helper: create an order and force its createdAt to a specific past date
// (timestamps auto-set createdAt on insert, so override it directly).
const createOrderWithCreatedAt = async (fields, createdAt) => {
  const order = await Order.create(fields);
  await Order.updateOne(
    { _id: order._id },
    { $set: { createdAt } },
    { timestamps: false }
  );
  return Order.findById(order._id);
};

describe('cartTimeout cron', () => {
  jest.setTimeout(30000);

  let reservedStatus;
  let cancelledStatus;
  let availableStatus;
  let exhibitionStatus;
  let approvedStatus;
  let pendingStatus;
  let rejectedStatus;

  const runCronCallback = async () => {
    const runCron = require('../server/crons/cartTimeout');
    runCron();
    expect(cronCallbacks.length).toBeGreaterThan(0);
    const cb = cronCallbacks[cronCallbacks.length - 1];
    await cb();
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    await getApp();

    // Create the Setting_Status docs the cron looks up by title.value.
    reservedStatus = await Status.create({ title: [{ key: 'en', value: 'Reserved' }] });
    cancelledStatus = await Status.create({ title: [{ key: 'en', value: 'Cancelled' }] });
    availableStatus = await Status.create({ title: [{ key: 'en', value: 'Available' }] });
    exhibitionStatus = await Status.create({ title: [{ key: 'en', value: 'Exhibition' }] });
    approvedStatus = await Status.create({ title: [{ key: 'en', value: 'Approved' }] });
    pendingStatus = await Status.create({ title: [{ key: 'en', value: 'Pending' }] });
    rejectedStatus = await Status.create({ title: [{ key: 'en', value: 'Rejected' }] });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await Artwork.deleteMany({});
  });

  const twentyFiveHoursAgo = () => new Date(Date.now() - 25 * 60 * 60 * 1000);
  const oneHourAgo = () => new Date(Date.now() - 1 * 60 * 60 * 1000);

  it('cancels a Reserved order older than 24h with no payment slip and releases its artworks', async () => {
    // Artwork starts in a non-Available/non-Approved state so the release is observable.
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Reserved Artwork' }],
      status: { approval: reservedStatus._id, sale: reservedStatus._id }
    });

    const order = await createOrderWithCreatedAt({
      status: reservedStatus._id,
      image: '', // no payment slip
      artwork: [artwork._id],
      orderNumber: 'ORD-EXPIRED'
    }, twentyFiveHoursAgo());

    await runCronCallback();

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status.toString()).toBe(cancelledStatus._id.toString());
    // The auto-cancel remark is persisted now that the Order schema defines `remark`.
    expect(updatedOrder.remark).toBe('Auto-cancelled due to 24-hour payment timeout.');

    const updatedArtwork = await Artwork.findById(artwork._id);
    expect(updatedArtwork.status.sale.toString()).toBe(availableStatus._id.toString());
    expect(updatedArtwork.status.approval.toString()).toBe(approvedStatus._id.toString());
  });

  it('leaves a Reserved order older than 24h that HAS a payment slip alone', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Paid Artwork' }],
      status: { approval: reservedStatus._id, sale: reservedStatus._id }
    });

    const order = await createOrderWithCreatedAt({
      status: reservedStatus._id,
      image: 'uploads/slip.jpg', // payment slip present
      artwork: [artwork._id],
      orderNumber: 'ORD-PAID'
    }, twentyFiveHoursAgo());

    await runCronCallback();

    const updatedOrder = await Order.findById(order._id);
    // Still Reserved, not cancelled.
    expect(updatedOrder.status.toString()).toBe(reservedStatus._id.toString());
    expect(updatedOrder.remark).toBe('');

    // Artwork untouched.
    const updatedArtwork = await Artwork.findById(artwork._id);
    expect(updatedArtwork.status.sale.toString()).toBe(reservedStatus._id.toString());
    expect(updatedArtwork.status.approval.toString()).toBe(reservedStatus._id.toString());
  });

  it('leaves a Reserved order younger than 24h alone', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Recent Artwork' }],
      status: { approval: reservedStatus._id, sale: reservedStatus._id }
    });

    const order = await createOrderWithCreatedAt({
      status: reservedStatus._id,
      image: '', // no slip, but too recent to time out
      artwork: [artwork._id],
      orderNumber: 'ORD-RECENT'
    }, oneHourAgo());

    await runCronCallback();

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status.toString()).toBe(reservedStatus._id.toString());
    expect(updatedOrder.remark).toBe('');

    const updatedArtwork = await Artwork.findById(artwork._id);
    expect(updatedArtwork.status.sale.toString()).toBe(reservedStatus._id.toString());
    expect(updatedArtwork.status.approval.toString()).toBe(reservedStatus._id.toString());
  });

  it('returns a post-term display-only artwork to Exhibition after reservation timeout', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Expired Display Artwork' }],
      status: { approval: reservedStatus._id, sale: availableStatus._id },
      postTermSale: {
        ...buildPostTermSale(new Date(Date.now() - 86400000 * 365)),
        initialSaleEndsAt: new Date(Date.now() - 86400000),
        applicable: true,
        mode: constants.MODES.DISPLAY,
        decision: constants.DECISIONS.DISPLAY
      }
    });
    const order = await createOrderWithCreatedAt({
      status: reservedStatus._id,
      image: '',
      artwork: [artwork._id],
      orderNumber: 'ORD-EXPIRED-DISPLAY'
    }, twentyFiveHoursAgo());

    await runCronCallback();
    const updatedOrder = await Order.findById(order._id);
    const updatedArtwork = await Artwork.findById(artwork._id);
    expect(updatedOrder.status.toString()).toBe(cancelledStatus._id.toString());
    expect(updatedArtwork.status.sale.toString()).toBe(exhibitionStatus._id.toString());
    expect(updatedArtwork.status.approval.toString()).toBe(approvedStatus._id.toString());
  });
});
