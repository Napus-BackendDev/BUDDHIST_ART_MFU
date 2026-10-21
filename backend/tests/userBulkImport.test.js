const { getApp, closeDatabase } = require('./appHelper');
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');
const Status = require('../server/Project/Settings/models/status.model');
const userService = require('../server/Project/User/service/user');
const { buildOfficialEmail } = require('../server/Project/User/service/officialEmail');

describe('Bulk user import', () => {
  jest.setTimeout(30000);
  let newStatus;
  let artistRole;
  let existingStudentId;
  let newStudentId;
  let existingEmail;
  let newEmail;
  let initialUserCount;

  beforeAll(async () => {
    await getApp();
    newStatus = await Status.create({
      code: `NEW_STUDENT_IMPORT_TEST_${Date.now()}`,
      title: [{ key: 'en', value: 'NewStudent' }, { key: 'th', value: 'ผู้เรียนใหม่' }]
    });
    await Status.create({
      code: `OLD_STUDENT_IMPORT_TEST_${Date.now()}`,
      title: [{ key: 'en', value: 'OldStudent' }, { key: 'th', value: 'ผู้เรียนเก่า' }]
    });
    artistRole = await Role.create({
      title: [{ key: 'en', value: 'Artist' }, { key: 'th', value: 'ศิลปิน' }]
    });
  });

  afterAll(async () => {
    await User.deleteMany({ studentId: /^TEST-/ });
    await Status.deleteMany({ code: /^(NEW|OLD)_STUDENT_IMPORT_TEST_/ });
    await closeDatabase();
  });

  it('creates new users and refreshes existing users to NewStudent without resetting passwords', async () => {
    const oldStatus = await Status.findOne({ 'title.value': 'OldStudent' });
    existingStudentId = `TEST-${Date.now()}-EXISTING`;
    newStudentId = `TEST-${Date.now()}-NEW`;
    existingEmail = `${Date.now()}-existing@example.com`;
    newEmail = `${Date.now()}-new@example.com`;
    initialUserCount = await User.countDocuments();
    await User.create({
      studentId: existingStudentId,
      name: [{ key: 'en', value: 'Existing User' }],
      contact: { studentEmail: existingEmail },
      password: 'existing-secret',
      role: artistRole._id,
      status: oldStatus._id
    });

    const response = await new Promise((resolve, reject) => {
      const res = {
        status(code) {
          return { json(payload) { resolve({ code, payload }); } };
        }
      };
      userService.onCreate({ body: [
        {
          studentId: existingStudentId,
          name: [{ key: 'en', value: 'Existing User Updated' }],
          contact: { studentEmail: existingEmail, telephone: '0800000000' },
          password: 'should-not-replace',
          role: artistRole._id,
          status: newStatus._id
        },
        {
          studentId: newStudentId,
          name: [{ key: 'en', value: 'New User' }],
          contact: { studentEmail: newEmail },
          password: 'new-secret',
          role: artistRole._id,
          status: newStatus._id
        }
      ] }, res).catch(reject);
    });

    expect(response.code).toBe(200);
    expect(await User.countDocuments({})).toBe(initialUserCount + 2);

    const existing = await User.findOne({ studentId: existingStudentId }).select('+password').lean();
    const existingStatus = await Status.findById(existing.status).lean();
    expect(existingStatus.title.some(item => item.value === 'NewStudent')).toBe(true);
    expect(existing.password).toBe('existing-secret');
    expect(existing.contact.studentEmail).toBe(buildOfficialEmail(existingStudentId));
    expect(existing.contact.personalEmail).toBe(existingEmail);

    const created = await User.findOne({ studentId: newStudentId }).select('+password').lean();
    const createdStatus = await Status.findById(created.status).lean();
    expect(createdStatus.title.some(item => item.value === 'NewStudent')).toBe(true);
    expect(created.password).toBeFalsy();
    expect(created.contact.studentEmail).toBe(buildOfficialEmail(newStudentId));
    expect(created.contact.personalEmail).toBe(newEmail);
  });

  it('derives an Artist email when Official Email is missing and leaves non-Artist email rules unchanged', async () => {
    const adminRole = await Role.create({
      title: [{ key: 'en', value: 'Admin' }, { key: 'th', value: 'ผู้ดูแลระบบ' }]
    });
    const artistStudentId = `TEST-${Date.now()}-NO-OFFICIAL`;
    const adminStudentId = `TEST-${Date.now()}-ADMIN`;
    const adminEmail = `${Date.now()}-admin@example.com`;

    const response = await new Promise((resolve, reject) => {
      const res = {
        status(code) {
          return { json(payload) { resolve({ code, payload }); } };
        }
      };
      userService.onCreate({ body: [
        {
          studentId: artistStudentId,
          name: [{ key: 'en', value: 'Artist Without Official Email' }],
          contact: { personalEmail: 'artist-personal@example.com' },
          password: 'artist-secret',
          role: artistRole._id,
          status: newStatus._id
        },
        {
          studentId: adminStudentId,
          name: [{ key: 'en', value: 'Admin Account' }],
          contact: { studentEmail: adminEmail },
          password: 'admin-secret',
          role: adminRole._id,
          status: newStatus._id
        }
      ] }, res).catch(reject);
    });

    expect(response.code).toBe(200);
    const artist = await User.findOne({ studentId: artistStudentId }).lean();
    const admin = await User.findOne({ studentId: adminStudentId }).lean();
    expect(artist.contact.studentEmail).toBe(buildOfficialEmail(artistStudentId));
    expect(artist.contact.personalEmail).toBe('artist-personal@example.com');
    expect(admin.contact.studentEmail).toBe(adminEmail);
  });

  it('rebuilds an Artist Official Email when Student ID changes, while preserving Admin email behavior', async () => {
    const artistStudentId = `TEST-${Date.now()}-UPDATE-ARTIST`;
    const artistNextStudentId = `TEST-${Date.now()}-UPDATE-ARTIST-NEXT`;
    const adminStudentId = `TEST-${Date.now()}-UPDATE-ADMIN`;
    const adminNextStudentId = `TEST-${Date.now()}-UPDATE-ADMIN-NEXT`;
    const adminEmail = `${Date.now()}-update-admin@example.com`;

    const artist = await User.create({
      studentId: artistStudentId,
      name: [{ key: 'en', value: 'Artist To Update' }],
      contact: { studentEmail: buildOfficialEmail(artistStudentId), personalEmail: 'artist@example.com' },
      password: 'artist-secret',
      role: artistRole._id,
      status: newStatus._id
    });
    const adminRole = await Role.findOne({ 'title.value': 'Admin' });
    const admin = await User.create({
      studentId: adminStudentId,
      name: [{ key: 'en', value: 'Admin To Update' }],
      contact: { studentEmail: adminEmail },
      password: 'admin-secret',
      role: adminRole._id,
      status: newStatus._id
    });

    const invokeUpdate = (payload) => new Promise((resolve, reject) => {
      const res = {
        status(code) {
          return { json(body) { resolve({ code, body }); } };
        }
      };
      userService.onUpdate({ body: payload }, res).catch(reject);
    });

    expect((await invokeUpdate({
      _id: artist._id,
      studentId: artistNextStudentId,
      role: artistRole._id,
      contact: { personalEmail: 'artist@example.com' }
    })).code).toBe(200);
    expect((await invokeUpdate({
      _id: admin._id,
      studentId: adminNextStudentId,
      role: adminRole._id,
      contact: { studentEmail: adminEmail }
    })).code).toBe(200);

    const updatedArtist = await User.findById(artist._id).lean();
    const updatedAdmin = await User.findById(admin._id).lean();
    expect(updatedArtist.contact.studentEmail).toBe(buildOfficialEmail(artistNextStudentId));
    expect(updatedArtist.contact.personalEmail).toBe('artist@example.com');
    expect(updatedAdmin.contact.studentEmail).toBe(adminEmail);
  });
  it('preserves an explicit old learner status on create and repeat import', async () => {
    const oldStatus = await Status.findOne({ 'title.value': 'OldStudent' });
    const studentId = `TEST-${Date.now()}-OLD-IMPORT`;
    const invoke = () => new Promise((resolve, reject) => {
      userService.onCreate({ body: [{
        studentId, name: [{ key: 'th', value: 'ผู้เรียนเดิมทดสอบ' }],
        role: artistRole._id, status: oldStatus._id, password: 'test-secret',
        contact: { personalEmail: 'old@example.com' },
        image: 'https://mfudrive.mfu.ac.th/s/test/download'
      }] }, { status(code) { return { json(payload) { resolve({ code, payload }); } }; } }).catch(reject);
    });
    expect((await invoke()).code).toBe(200);
    expect((await invoke()).code).toBe(200);
    const imported = await User.findOne({ studentId }).lean();
    expect(String(imported.status)).toBe(String(oldStatus._id));
    expect(imported.image).toBe('https://mfudrive.mfu.ac.th/s/test/download');
    expect(await User.countDocuments({ studentId })).toBe(1);
  });
});
