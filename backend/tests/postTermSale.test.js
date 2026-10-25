const request = require('supertest');
const jwt = require('jsonwebtoken');
const { getApp, closeDatabase } = require('./appHelper');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const { buildPostTermSale, getEffectiveMode, constants, runJob } = require('../server/Project/Artwork/service/postTermSale');

describe('Post-term sale lifecycle', () => {
  let app;
  let artist;
  let otherArtist;
  let statuses;
  let token;
  let otherToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    app = await getApp();
    statuses = {};
    for (const name of ['Available', 'Exhibition', 'Sold Out', 'Reserved', 'Approved']) {
      statuses[name] = await Status.create({ title: [{ key: 'en', value: name }, { key: 'th', value: name }] });
    }
    artist = await User.create({
      studentId: 'POSTTERM01',
      name: [{ key: 'en', value: 'Post Term Artist' }]
    });
    otherArtist = await User.create({
      studentId: 'POSTTERM02',
      name: [{ key: 'en', value: 'Other Artist' }]
    });
    token = jwt.sign({ userId: artist._id, role: 'Artist' }, 'testSecret');
    otherToken = jwt.sign({ userId: otherArtist._id, role: 'Artist' }, 'testSecret');
  });

  afterAll(async () => closeDatabase());

  beforeEach(async () => Artwork.deleteMany({}));

  it('calculates one calendar year and keeps an active term sellable', () => {
    const endAt = new Date('2024-02-29T12:00:00.000Z');
    const lifecycle = buildPostTermSale(endAt);
    expect(lifecycle.initialSaleEndsAt.toISOString()).toBe('2025-03-01T12:00:00.000Z');
    expect(getEffectiveMode(lifecycle, new Date('2025-02-28T12:00:00.000Z'))).toBe(constants.MODES.INITIAL);
  });

  it('lets an artist record display-only after expiry and changes sale status', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Display Only Work' }], artist: artist._id,
      artworkCode: 'BA-POSTTERM-01',
      status: { approval: statuses.Approved._id, sale: statuses.Available._id },
      postTermSale: { ...buildPostTermSale(new Date(Date.now() - 86400000 * 365)), initialSaleEndsAt: new Date(Date.now() - 86400000), applicable: true }
    });
    const response = await request(app)
      .post('/api/v1/artwork/post-term/decision')
      .set('Authorization', `Bearer ${token}`)
      .send({ artworkId: artwork._id, decision: 'display_only', contactMethod: 'portal' });
    expect(response.status).toBe(200);
    const updated = await Artwork.findById(artwork._id).lean();
    expect(updated.postTermSale.mode).toBe(constants.MODES.DISPLAY);
    expect(String(updated.status.sale)).toBe(String(statuses.Exhibition._id));
    expect(updated.postTermSale.history).toHaveLength(1);
    const duplicate = await request(app)
      .post('/api/v1/artwork/post-term/decision')
      .set('Authorization', `Bearer ${token}`)
      .send({ artworkId: artwork._id, decision: 'display_only', contactMethod: 'portal' });
    expect(duplicate.status).toBe(200);
    expect((await Artwork.findById(artwork._id).lean()).postTermSale.history).toHaveLength(1);
  });

  it('records a future decision without stopping first-year sales', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Future Work' }], artist: artist._id,
      artworkCode: 'BA-POSTTERM-02',
      status: { approval: statuses.Approved._id, sale: statuses.Available._id },
      postTermSale: buildPostTermSale(new Date(Date.now() + 86400000))
    });
    const response = await request(app)
      .post('/api/v1/artwork/post-term/decision')
      .set('Authorization', `Bearer ${token}`)
      .send({ artworkId: artwork._id, decision: 'continue_sale', contactMethod: 'portal' });
    expect(response.status).toBe(200);
    const updated = await Artwork.findById(artwork._id).lean();
    expect(updated.postTermSale.mode).toBe(constants.MODES.INITIAL);
    expect(updated.postTermSale.decision).toBe('continue_sale');
    expect(String(updated.status.sale)).toBe(String(statuses.Available._id));
  });

  it('keeps first-year sale status on artist edits and rejects another artist', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Protected Work' }], artist: artist._id,
      artworkCode: 'BA-POSTTERM-04',
      status: { approval: statuses.Approved._id, sale: statuses.Available._id },
      postTermSale: buildPostTermSale(new Date(Date.now() + 86400000))
    });
    const editResponse = await request(app)
      .put('/api/v1/artwork')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: artwork._id, status: { sale: statuses.Exhibition._id } });
    expect(editResponse.status).toBe(200);
    const afterEdit = await Artwork.findById(artwork._id).lean();
    expect(String(afterEdit.status.sale)).toBe(String(statuses.Available._id));

    const otherResponse = await request(app)
      .post('/api/v1/artwork/post-term/decision')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ artworkId: artwork._id, decision: 'display_only', contactMethod: 'portal' });
    expect(otherResponse.status).toBe(403);
  });

  it('pauses a pending artwork at expiry and does not transition it twice', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Expired Work' }],
      artworkCode: 'BA-POSTTERM-03',
      status: { approval: statuses.Approved._id, sale: statuses.Available._id },
      postTermSale: {
        ...buildPostTermSale(new Date(Date.now() - 86400000 * 365)),
        initialSaleEndsAt: new Date(Date.now() - 86400000),
        applicable: true,
        mode: constants.MODES.INITIAL,
        decision: constants.DECISIONS.PENDING
      }
    });
    const now = new Date();
    const first = await runJob(now);
    const second = await runJob(new Date(now.getTime() + 60 * 1000));
    const updated = await Artwork.findById(artwork._id).lean();
    expect(first.transitioned).toBe(1);
    expect(second.transitioned).toBe(0);
    expect(updated.postTermSale.mode).toBe(constants.MODES.DISPLAY);
    expect(updated.postTermSale.history).toHaveLength(1);
    expect(String(updated.status.sale)).toBe(String(statuses.Exhibition._id));
  });

  it('claims each reminder once across repeated job runs', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Reminder Work' }],
      artworkCode: 'BA-POSTTERM-05',
      status: { approval: statuses.Approved._id, sale: statuses.Available._id },
      postTermSale: {
        ...buildPostTermSale(new Date(Date.now() - 345 * 86400000)),
        initialSaleEndsAt: new Date(Date.now() + 20 * 86400000),
        applicable: true,
        mode: constants.MODES.INITIAL,
        decision: constants.DECISIONS.PENDING
      }
    });
    const now = new Date();
    const first = await runJob(now);
    const second = await runJob(new Date(now.getTime() + 60 * 1000));
    const updated = await Artwork.findById(artwork._id).lean();
    expect(first.reminded).toBe(1);
    expect(second.reminded).toBe(0);
    expect(updated.postTermSale.notifications.day30SentAt).toBeTruthy();
  });

  it('reminder emails link to the artist portal (CLIENT_URL first, production site as fallback)', async () => {
    const mail = require('../helpers/google/Mail');
    const spy = jest.spyOn(mail, 'sendMail').mockResolvedValue();
    const emailed = await User.create({ studentId: 'POSTTERM-MAIL', name: [{ key: 'en', value: 'Mail Artist' }], contact: { studentEmail: 'posttermmail@example.test' } });
    await Artwork.create({
      title: [{ key: 'en', value: 'Link Work' }],
      artworkCode: 'BA-POSTTERM-LINK',
      artist: emailed._id,
      status: { approval: statuses.Approved._id, sale: statuses.Available._id },
      postTermSale: { ...buildPostTermSale(new Date(Date.now() - 345 * 86400000)), initialSaleEndsAt: new Date(Date.now() + 5 * 86400000), applicable: true, mode: constants.MODES.INITIAL, decision: constants.DECISIONS.PENDING }
    });
    const before = process.env.CLIENT_URL;
    process.env.CLIENT_URL = 'https://site.example.test/, https://other.example.test';
    try {
      await runJob(new Date());
    } finally {
      if (before === undefined) delete process.env.CLIENT_URL; else process.env.CLIENT_URL = before;
    }
    const call = spy.mock.calls.find(args => args[0] === 'posttermmail@example.test');
    expect(call[3]).toContain('https://site.example.test/artist/profile');
    expect(require('../server/Project/Artwork/service/postTermSale').appBaseUrl()).toBe('https://buddhistart.mfu.ac.th');
    spy.mockRestore();
  });
});
