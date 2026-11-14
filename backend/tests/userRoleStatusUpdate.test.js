jest.mock('../server/Project/User/controller/user', () => ({ onUpdate: jest.fn(), onCreate: jest.fn(), onQuery: jest.fn(), onQuerys: jest.fn(), onDelete: jest.fn() }));
jest.mock('../server/Project/User/models/user.model', () => ({ findById: jest.fn(), findOne: jest.fn() }));
jest.mock('../server/Project/Settings/models/role.model', () => ({ find: jest.fn() }));
jest.mock('../server/Project/Settings/models/status.model', () => ({ exists: jest.fn(), findOne: jest.fn() }));
jest.mock('../server/Project/Settings/service/message', () => ({ sendResponse: jest.fn((res, group, code, data) => res.send({ code, data })) }));

const UserController = require('../server/Project/User/controller/user');
const UserModel = require('../server/Project/User/models/user.model');
const RoleModel = require('../server/Project/Settings/models/role.model');
const StatusModel = require('../server/Project/Settings/models/status.model');
const { onUpdate } = require('../server/Project/User/service/user');

const userId = '6a8c3ffc79e61d7914daa501';
const reviewerRoleId = '6a8c3ffc79e61d7914daa502';
const oldStudentStatusId = '6a8c3ffc79e61d7914daa503';

beforeEach(() => {
  jest.clearAllMocks();
  RoleModel.find.mockReturnValue({
    lean: async () => [{ _id: reviewerRoleId, title: [{ key: 'th', value: 'อาจารย์ตรวจผลงาน' }, { key: 'en', value: 'Reviewer' }] }]
  });
  UserModel.findById.mockReturnValue({
    populate: () => ({
      lean: async () => ({
        _id: userId,
        studentId: '6600000001',
        role: { _id: 'artist-id', title: [{ key: 'en', value: 'Artist' }] },
        status: oldStudentStatusId,
        course: 'batch9',
        contact: { studentEmail: '6600000001@lamduan.mfu.ac.th', personalEmail: 'p@local.test' }
      })
    })
  });
  StatusModel.exists.mockResolvedValue(1);
  UserController.onUpdate.mockImplementation(async (_query, data) => ({ _id: userId, ...data }));
});

test('clears Student Group status and learner course when updating to a custom non-Artist role', async () => {
  const send = jest.fn();
  const status = jest.fn(() => ({ json: send }));
  await onUpdate(
    {
      user: { role: 'Admin', roleDetails: { code: 'ADMIN' } },
      body: {
        _id: userId,
        role: reviewerRoleId,
        status: ''
      }
    },
    { send, status }
  );

  expect(UserController.onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ _id: expect.anything() }),
    expect.objectContaining({
      role: reviewerRoleId,
      status: null,
      course: ''
    })
  );
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ code: 20000 }));
});

test('clears existing Student Group status even when re-saving a custom role with omitted status', async () => {
  const send = jest.fn();
  await onUpdate(
    {
      user: { role: 'Admin', roleDetails: { code: 'ADMIN' } },
      body: {
        _id: userId,
        role: reviewerRoleId
      }
    },
    { send, status: jest.fn(() => ({ json: send })) }
  );

  expect(UserController.onUpdate).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      role: reviewerRoleId,
      status: null
    })
  );
});
