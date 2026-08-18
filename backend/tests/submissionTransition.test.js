const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Mock node-cron before loading the app
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
const User = require('../server/Project/User/models/user.model');
const Status = require('../server/Project/Settings/models/status.model');
const Role = require('../server/Project/Settings/models/role.model');
const Submission = require('../server/Project/Submission/models/submission.model');

describe('Submission Student Status Transition Tests', () => {
  jest.setTimeout(30000);
  let app;
  let newStudentStatus;
  let oldStudentStatus;
  let artistRole;
  let testToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testSecret';
    app = await getApp();

    // Create NewStudent and OldStudent statuses
    newStudentStatus = await Status.create({
      title: [
        { key: 'en', value: 'NewStudent' },
        { key: 'th', value: 'นักศึกษาใหม่' }
      ]
    });

    oldStudentStatus = await Status.create({
      title: [
        { key: 'en', value: 'OldStudent' },
        { key: 'th', value: 'นักศึกษาเก่า' }
      ]
    });

    // Create Artist role
    artistRole = await Role.create({
      title: [
        { key: 'en', value: 'Artist' },
        { key: 'th', value: 'ศิลปิน' }
      ]
    });

    testToken = jwt.sign({ id: 'dummyUser' }, 'testSecret');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    // Clear submissions and users between tests
    await Submission.deleteMany({});
    await User.deleteMany({});
  });

  it('should transition status on onQuery (POST /api/v1/submission/explore) when deadline has passed', async () => {
    const artist = await User.create({
      studentId: '621234567',
      name: [{ key: 'en', value: 'Artist One' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artist1@example.com' }
    });

    const expiredDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    const submission = await Submission.create({
      title: [{ key: 'en', value: 'Test Submission' }],
      artist: [artist._id],
      create: {
        startAt: new Date(Date.now() - 7200000),
        endAt: expiredDeadline
      }
    });

    const response = await request(app)
      .post('/api/v1/submission/explore')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ _id: submission._id });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(20000);

    // Verify user in db
    const updatedArtist = await User.findById(artist._id);
    expect(updatedArtist.status.toString()).toBe(oldStudentStatus._id.toString());

    // Verify in response doc
    const responseDoc = response.body.data;
    expect(responseDoc.artist[0]._id.toString()).toBe(artist._id.toString());
    expect(responseDoc.artist[0].status.toString()).toBe(oldStudentStatus._id.toString());
  });

  it('should transition status on onQuerys (GET /api/v1/submission) when deadline has passed', async () => {
    const artist = await User.create({
      studentId: '621234568',
      name: [{ key: 'en', value: 'Artist Two' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artist2@example.com' }
    });

    const expiredDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    const submission = await Submission.create({
      title: [{ key: 'en', value: 'Test Submission 2' }],
      artist: [artist._id],
      create: {
        startAt: new Date(Date.now() - 7200000),
        endAt: expiredDeadline
      }
    });

    const response = await request(app)
      .get('/api/v1/submission');

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(20000);

    // Verify user in db
    const updatedArtist = await User.findById(artist._id);
    expect(updatedArtist.status.toString()).toBe(oldStudentStatus._id.toString());

    // Verify in response docs
    const responseDocs = response.body.data;
    const responseDoc = responseDocs.find(d => d._id.toString() === submission._id.toString());
    expect(responseDoc).toBeDefined();
    expect(responseDoc.artist[0]._id.toString()).toBe(artist._id.toString());
    expect(responseDoc.artist[0].status.toString()).toBe(oldStudentStatus._id.toString());
  });

  it('should transition status on onUpdate (PUT /api/v1/submission) when deadline has passed', async () => {
    const artist = await User.create({
      studentId: '621234569',
      name: [{ key: 'en', value: 'Artist Three' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artist3@example.com' }
    });

    const expiredDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    const submission = await Submission.create({
      title: [{ key: 'en', value: 'Test Submission 3' }],
      artist: [artist._id],
      create: {
        startAt: new Date(Date.now() - 7200000),
        endAt: expiredDeadline
      }
    });

    const updateBody = {
      _id: submission._id,
      title: [{ key: 'en', value: 'Updated Submission 3' }]
    };

    const response = await request(app)
      .put('/api/v1/submission')
      .set('Authorization', `Bearer ${testToken}`)
      .send(updateBody);

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(20000);

    // Verify user in db
    const updatedArtist = await User.findById(artist._id);
    expect(updatedArtist.status.toString()).toBe(oldStudentStatus._id.toString());

    // Verify in response doc
    const responseDoc = response.body.data;
    expect(responseDoc.artist[0]._id.toString()).toBe(artist._id.toString());
    expect(responseDoc.artist[0].status.toString()).toBe(oldStudentStatus._id.toString());
  });

  it('should NOT transition status if the deadline has not passed', async () => {
    const artist = await User.create({
      studentId: '621234570',
      name: [{ key: 'en', value: 'Artist Four' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artist4@example.com' }
    });

    const futureDeadline = new Date(Date.now() + 3600000); // 1 hour in future
    const submission = await Submission.create({
      title: [{ key: 'en', value: 'Future Submission' }],
      artist: [artist._id],
      create: {
        startAt: new Date(Date.now() - 3600000),
        endAt: futureDeadline
      }
    });

    const response = await request(app)
      .post('/api/v1/submission/explore')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ _id: submission._id });

    expect(response.status).toBe(200);

    // Verify user in db
    const updatedArtist = await User.findById(artist._id);
    expect(updatedArtist.status.toString()).toBe(newStudentStatus._id.toString());

    // Verify in response doc
    const responseDoc = response.body.data;
    expect(responseDoc.artist[0].status.toString()).toBe(newStudentStatus._id.toString());
  });

  it('should transition statuses via the cron job execution', async () => {
    const artist = await User.create({
      studentId: '621234571',
      name: [{ key: 'en', value: 'Artist Five' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artist5@example.com' }
    });

    const expiredDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    await Submission.create({
      title: [{ key: 'en', value: 'Expired Cron Submission' }],
      artist: [artist._id],
      create: {
        startAt: new Date(Date.now() - 7200000),
        endAt: expiredDeadline
      }
    });

    // Run the cron jobs by requiring the cron file and invoking all scheduled tasks
    const runCron = require('../server/crons/submissionDeadline');
    runCron();

    expect(cronCallbacks.length).toBeGreaterThan(0);

    // Manually invoke the scheduled cron callback
    const cronCallback = cronCallbacks[cronCallbacks.length - 1];
    await cronCallback();

    // Verify user in db has transitioned
    const updatedArtist = await User.findById(artist._id);
    expect(updatedArtist.status.toString()).toBe(oldStudentStatus._id.toString());
  });

  it('should transition status of multiple enrolled artists from NewStudent to OldStudent, leaving non-Artists and other statuses unaffected', async () => {
    const artistNew1 = await User.create({
      studentId: '621234581',
      name: [{ key: 'en', value: 'Artist New 1' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artistnew1@example.com' }
    });

    const artistNew2 = await User.create({
      studentId: '621234582',
      name: [{ key: 'en', value: 'Artist New 2' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artistnew2@example.com' }
    });

    const artistOld = await User.create({
      studentId: '621234583',
      name: [{ key: 'en', value: 'Artist Old' }],
      role: artistRole._id,
      status: oldStudentStatus._id,
      contact: { studentEmail: 'artistold@example.com' }
    });

    const otherRole = await Role.create({
      title: [{ key: 'en', value: 'Customer' }]
    });

    const customerNew = await User.create({
      studentId: '621234584',
      name: [{ key: 'en', value: 'Customer New' }],
      role: otherRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'customer@example.com' }
    });

    const expiredDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    const submission = await Submission.create({
      title: [{ key: 'en', value: 'Multi-Artist Transition Test' }],
      artist: [artistNew1._id, artistNew2._id, artistOld._id, customerNew._id],
      create: {
        startAt: new Date(Date.now() - 7200000),
        endAt: expiredDeadline
      }
    });

    const response = await request(app)
      .post('/api/v1/submission/explore')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ _id: submission._id });

    expect(response.status).toBe(200);

    // Verify status updates
    const updatedArtistNew1 = await User.findById(artistNew1._id);
    expect(updatedArtistNew1.status.toString()).toBe(oldStudentStatus._id.toString());

    const updatedArtistNew2 = await User.findById(artistNew2._id);
    expect(updatedArtistNew2.status.toString()).toBe(oldStudentStatus._id.toString());

    const updatedArtistOld = await User.findById(artistOld._id);
    expect(updatedArtistOld.status.toString()).toBe(oldStudentStatus._id.toString());

    const updatedCustomerNew = await User.findById(customerNew._id);
    expect(updatedCustomerNew.status.toString()).toBe(newStudentStatus._id.toString());
  });

  it('should NOT transition when a submission has no deadline (endAt unset)', async () => {
    const artist = await User.create({
      studentId: '621234599',
      name: [{ key: 'en', value: 'Artist NoDeadline' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'artistnodeadline@example.com' }
    });

    // No create.endAt provided — the model must not default it to "now" (which would
    // make a brand-new submission instantly past-deadline and flip its artists).
    const submission = await Submission.create({
      title: [{ key: 'en', value: 'No Deadline Submission' }],
      artist: [artist._id]
    });

    const response = await request(app)
      .post('/api/v1/submission/explore')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ _id: submission._id });

    expect(response.status).toBe(200);

    const updatedArtist = await User.findById(artist._id);
    expect(updatedArtist.status.toString()).toBe(newStudentStatus._id.toString());
  });

  it('should bulk-create an ARRAY of submissions (POST /api/v1/submission) and return the created array, transitioning only past-deadline artists', async () => {
    const pastArtist = await User.create({
      studentId: '621234601',
      name: [{ key: 'en', value: 'Bulk Past Artist' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'bulkpast@example.com' }
    });

    const futureArtist = await User.create({
      studentId: '621234602',
      name: [{ key: 'en', value: 'Bulk Future Artist' }],
      role: artistRole._id,
      status: newStudentStatus._id,
      contact: { studentEmail: 'bulkfuture@example.com' }
    });

    const expiredDeadline = new Date(Date.now() - 3600000); // 1 hour ago
    const futureDeadline = new Date(Date.now() + 3600000); // 1 hour ahead

    const bulkBody = [
      {
        title: [{ key: 'en', value: 'Bulk Past Submission' }],
        artist: [pastArtist._id],
        create: {
          startAt: new Date(Date.now() - 7200000),
          endAt: expiredDeadline
        }
      },
      {
        title: [{ key: 'en', value: 'Bulk Future Submission' }],
        artist: [futureArtist._id],
        create: {
          startAt: new Date(Date.now() - 3600000),
          endAt: futureDeadline
        }
      }
    ];

    const response = await request(app)
      .post('/api/v1/submission')
      .set('Authorization', `Bearer ${testToken}`)
      .send(bulkBody);

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(20000);

    // The re-query branch must return the ARRAY of created submissions, not null.
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(2);

    // Both submissions persisted
    const persisted = await Submission.find({});
    expect(persisted.length).toBe(2);

    // Past-deadline artist flipped to OldStudent; future-deadline artist unchanged
    const updatedPastArtist = await User.findById(pastArtist._id);
    expect(updatedPastArtist.status.toString()).toBe(oldStudentStatus._id.toString());

    const updatedFutureArtist = await User.findById(futureArtist._id);
    expect(updatedFutureArtist.status.toString()).toBe(newStudentStatus._id.toString());

    // Response payload reflects the transitioned status for the past-deadline submission
    const pastDoc = response.body.data.find(
      d => d.title.some(t => t.value === 'Bulk Past Submission')
    );
    expect(pastDoc).toBeDefined();
    expect(pastDoc.artist[0].status.toString()).toBe(oldStudentStatus._id.toString());

    const futureDoc = response.body.data.find(
      d => d.title.some(t => t.value === 'Bulk Future Submission')
    );
    expect(futureDoc).toBeDefined();
    expect(futureDoc.artist[0].status.toString()).toBe(newStudentStatus._id.toString());
  });
});
