const request = require('supertest');
const jwt = require('jsonwebtoken');

// --- Mock external side-effects BEFORE requiring the app ---------------------

// node-cron: capture-and-noop so no real timers are scheduled by the app.
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

// Mail: the through-submission approval flow calls sendMail; keep it off the network.
jest.mock('../helpers/google/Mail', () => ({
  sendMail: jest.fn().mockResolvedValue({ success: true, messageId: 'test' }),
}));

const { getApp, closeDatabase } = require('./appHelper');
const { sendMail } = require('../helpers/google/Mail');
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const Role = require('../server/Project/Settings/models/role.model');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Submission = require('../server/Project/Submission/models/submission.model');
const ArtworkCounter = require('../server/Project/Artwork/models/artworkCounter.model');

// Decompose code into prefix, student prefix, cohort, student suffix, sequence.
const parseCode = (code) => {
  const [prefix, studentPrefix, courseLevel, studentSuffix, sequence] = code.split('-');
  return { prefix, studentPrefix, courseLevel, studentSuffix, sequence };
};

describe('Artwork Code format — prefix + student first 2 + cohort + student last 3 + sequence', () => {
  jest.setTimeout(30000);
  let app;
  let token;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    app = await getApp();
    token = jwt.sign({ id: 'adminUser' }, 'testSecret');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await Artwork.deleteMany({});
    await ArtworkCounter.deleteMany({});
    await Submission.deleteMany({});
    await User.deleteMany({});
    await Status.deleteMany({});
    await Role.deleteMany({});
    sendMail.mockClear();
  });

  // ---- 1. MANUAL path: POST /api/v1/artwork -> generateArtworkCode ----------
  it('MANUAL create: uses student first 2, cohort, student last 3, sequence', async () => {
    const artist = await User.create({
      studentId: '650000016',
      name: [{ key: 'en', value: 'Manual Artist' }],
    });

    const res = await request(app)
      .post('/api/v1/artwork')
      .set('Authorization', `Bearer ${token}`)
      .send({
        artist: artist._id,
        courseLevel: '6',
        title: [{ key: 'en', value: 'Manual Piece' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(20000);

    const code = res.body.data.artworkCode;
    expect(code).toMatch(/^BA-65-06-016-\d{2}$/);

    const f = parseCode(code);
    expect(f.prefix).toBe('BA');
    expect(f.studentPrefix).toBe('65');
    expect(f.courseLevel).toBe('06');
    expect(f.studentSuffix).toBe('016');
    expect(f.sequence).toBe('01');
    expect(code).toBe('BA-65-06-016-01');

    // Persisted value matches the returned envelope.
    const saved = await Artwork.findById(res.body.data._id);
    expect(saved.artworkCode).toBe(code);
  });

  it('MANUAL create: sequence is scoped per student and cohort', async () => {
    const artist = await User.create({
      studentId: '650000016',
      name: [{ key: 'en', value: 'Manual Artist Seq' }],
    });

    const post = () =>
      request(app)
        .post('/api/v1/artwork')
        .set('Authorization', `Bearer ${token}`)
        .send({ artist: artist._id, courseLevel: '6', title: [{ key: 'en', value: 'Piece' }] });

    const first = await post();
    const second = await post();

    expect(parseCode(first.body.data.artworkCode).sequence).toBe('01');
    expect(parseCode(second.body.data.artworkCode).sequence).toBe('02');
    // SS/AA are stable across the sequence.
    expect(parseCode(second.body.data.artworkCode).studentSuffix).toBe('016');
  });

  it('MANUAL create: pads short student IDs', async () => {
    const artist = await User.create({
      studentId: '9',
      name: [{ key: 'en', value: 'Short Id Artist' }],
    });

    const res = await request(app)
      .post('/api/v1/artwork')
      .set('Authorization', `Bearer ${token}`)
      .send({ artist: artist._id, courseLevel: '1', title: [{ key: 'en', value: 'Fallback Piece' }] });

    expect(res.status).toBe(200);
    const f = parseCode(res.body.data.artworkCode);
    expect(f.studentSuffix).toBe('009');
    expect(f.sequence).toBe('01');
  });

  // ---- 2. THROUGH-SUBMISSION path: PUT /api/v1/submission -> processApprovals ----
  it('THROUGH SUBMISSION approval: uses submission cohort and artist student ID', async () => {
    const approvedStatus = await Status.create({
      title: [{ key: 'en', value: 'Approved' }, { key: 'th', value: 'อนุมัติ' }],
    });
    const availableStatus = await Status.create({
      title: [{ key: 'en', value: 'Available' }],
    });

    const artist = await User.create({
      studentId: '650000016',
      name: [{ key: 'en', value: 'Submission Artist' }],
      contact: { studentEmail: 'subartist@example.com' },
    });

    const submission = await Submission.create({
      title: [{ key: 'th', value: 'ผลงานส่ง' }, { key: 'en', value: 'Sub Title' }],
      courseLevel: '2', // -> SS "02"
      artist: [artist._id],
      assignments: [
        {
          title: [{ key: 'th', value: 'งานที่ 1' }],
          artist: [artist._id],
          artworks: [
            {
              title: [{ key: 'en', value: 'Approved Piece' }],
              status: approvedStatus._id,
              owner: artist._id,
              image: 'http://example.test/approved.jpg',
              price: 1000,
            },
          ],
        },
      ],
    });

    const assignmentArtworkId = submission.assignments[0].artworks[0]._id;

    const res = await request(app)
      .put('/api/v1/submission')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: submission._id, title: [{ key: 'en', value: 'Sub Title Updated' }] });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(20000);

    // The approval flow published exactly one Artwork for the approved piece.
    const published = await Artwork.findOne({ submissionArtworkId: assignmentArtworkId });
    expect(published).not.toBeNull();

    const code = published.artworkCode;
    expect(code).toMatch(/^BA-65-02-016-\d{2}$/);

    const f = parseCode(code);
    expect(f.prefix).toBe('BA');
    expect(f.studentPrefix).toBe('65');
    expect(f.courseLevel).toBe('02');
    expect(f.studentSuffix).toBe('016');
    expect(f.sequence).toBe('01');
    expect(code).toBe('BA-65-02-016-01');
    expect(published.courseLevel).toBe('2');

    const linkedSubmission = await Submission.findById(submission._id);
    expect(linkedSubmission.submissionCode).toBe('SUB-65-02-016-01');
    expect(linkedSubmission.assignments[0].artworks[0].artworkCode).toBe(code);

    // Mail side-effect ran but was mocked (no network).
    expect(sendMail).toHaveBeenCalled();
  });

  it('THROUGH SUBMISSION approval: same image URL still publishes distinct artwork IDs', async () => {
    const approvedStatus = await Status.create({ title: [{ key: 'en', value: 'Approved' }] });
    const artist = await User.create({
      studentId: '650000016',
      name: [{ key: 'en', value: 'Duplicate Image Artist' }],
    });
    const sharedImage = 'http://example.test/shared.jpg';
    const submission = await Submission.create({
      courseLevel: '2',
      artist: [artist._id],
      assignments: [{
        artist: [artist._id],
        artworks: [
          { title: [{ key: 'en', value: 'Piece A' }], status: approvedStatus._id, owner: artist._id, image: sharedImage },
          { title: [{ key: 'en', value: 'Piece B' }], status: approvedStatus._id, owner: artist._id, image: sharedImage },
        ],
      }],
    });

    const response = await request(app)
      .put('/api/v1/submission')
      .set('Authorization', `Bearer ${token}`)
      .send({ _id: submission._id });

    expect(response.status).toBe(200);
    const published = await Artwork.find({ artist: artist._id }).sort({ artworkCode: 1 });
    expect(published).toHaveLength(2);
    expect(published[0].submissionArtworkId.toString())
      .not.toBe(published[1].submissionArtworkId.toString());
    expect(published[0].image).toBe(sharedImage);
    expect(published[1].image).toBe(sharedImage);
  });
});
