jest.mock('../server/Project/User/models/user.model', () => ({ findOne: jest.fn(), findByIdAndUpdate: jest.fn(), create: jest.fn(), populate: jest.fn(v => v) }));
jest.mock('../server/Project/Settings/models/role.model', () => ({ find: jest.fn() }));
jest.mock('../server/Project/Settings/models/status.model', () => ({ findOne: jest.fn() }));
jest.mock('../server/Project/Settings/service/message', () => ({ sendResponse: jest.fn((res, group, code, data) => res.send({code,data})) }));
const User = require('../server/Project/User/models/user.model');
const Role = require('../server/Project/Settings/models/role.model');
const Status = require('../server/Project/Settings/models/status.model');
const {onCreate} = require('../server/Project/User/service/user');
const roleId = '6a8c3ffc79e61d7914daa4f9';
beforeEach(() => {
  jest.clearAllMocks();
  Role.find.mockReturnValue({lean:async()=>[{_id:roleId,title:[{key:'en',value:'Artist'}]}]});
  Status.findOne.mockReturnValue({select:()=>({lean:async()=>({_id:'new-status'})})});
  User.create.mockImplementation(async v=>v);
  User.findByIdAndUpdate.mockImplementation(async (id,v)=>({_id:id,...v.$set}));
});
test.each([null,{_id:'existing',role:roleId,contact:{}}])('preserves explicit learner status and photo for a new or existing user: %p',async existing=>{
  User.findOne.mockReturnValue({populate:async()=>existing});
  const send=jest.fn();
  await onCreate({body:[{studentId:'0012345678',role:roleId,status:'old-status',name:[],contact:{},image:'https://mfudrive.mfu.ac.th/s/test/download'}]},{send});
  expect(send).toHaveBeenCalledWith(expect.objectContaining({code:20000}));
  const saved=existing?User.findByIdAndUpdate.mock.calls[0][1].$set:User.create.mock.calls[0][0];
  expect(saved.status).toBe('old-status');
  expect(saved.image).toBe('https://mfudrive.mfu.ac.th/s/test/download');
});
test('defaults to NewStudent only when no status is supplied',async()=>{
  User.findOne.mockReturnValue({populate:async()=>null});
  await onCreate({body:[{studentId:'0012345678',role:roleId,name:[],contact:{}}]},{send:jest.fn()});
  expect(User.create.mock.calls[0][0].status).toBe('new-status');
});
