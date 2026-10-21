const request = require('supertest');
const jwt = require('jsonwebtoken');
jest.mock('node-cron', () => ({ schedule: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })) }));
const mockVerifyIdToken=jest.fn();
jest.mock('google-auth-library',()=>({OAuth2Client:jest.fn(()=>({verifyIdToken:mockVerifyIdToken}))}));
const {getApp,closeDatabase}=require('./appHelper');
const User=require('../server/Project/User/models/user.model');
const Role=require('../server/Project/Settings/models/role.model');

describe('OAuth-only account authentication',()=>{
 jest.setTimeout(30000);let app,admin,token,customerRole;
 beforeAll(async()=>{
  process.env.JWT_SECRET='testSecret';process.env.TOKENEXPIRED='1';process.env.GOOGLE_CLIENT_ID='qa-google-client';
  app=await getApp();
  const roles=await Role.create([{title:[{key:'en',value:'Customer'}]},{title:[{key:'en',value:'Admin'}]}]);customerRole=roles[0];
  admin=await User.create({studentId:'QA-OAUTH-ADMIN',role:roles[1]._id,contact:{studentEmail:'qa-oauth-admin@example.test'},password:'legacy-unused'});
  token=jwt.sign({userId:admin._id,role:'Admin'},require('../config/config').jwtSecret);
 });
 afterAll(closeDatabase);
 test.each([{username:'QA-OAUTH-ADMIN',password:'legacy-unused'},{username:'QA-OAUTH-ADMIN',password:'wrong'},{username:{$ne:null},password:{$ne:null}}])('password login cannot mint a session for %p',async credentials=>{
  const res=await request(app).post('/api/v1/user/auth/sign-in').send(credentials);
  expect(res.status).toBe(404);expect(res.body.data?.token).toBeUndefined();
 });
 test.each(['development','production'])('dev-admin login remains unavailable in %s even with the legacy flag',async env=>{
  const old=process.env.NODE_ENV,flag=process.env.ALLOW_DEV_ADMIN_LOGIN;
  try{process.env.NODE_ENV=env;process.env.ALLOW_DEV_ADMIN_LOGIN='true';const res=await request(app).post('/api/v1/user/auth/dev-admin');expect(res.status).toBe(404);expect(res.body.data?.token).toBeUndefined();}
  finally{process.env.NODE_ENV=old;if(flag===undefined)delete process.env.ALLOW_DEV_ADMIN_LOGIN;else process.env.ALLOW_DEV_ADMIN_LOGIN=flag;}
 });
 test('manual creation does not persist a submitted password',async()=>{
  const res=await request(app).post('/api/v1/user').set('x-access-token',token).send({studentId:'QA-OAUTH-CREATED',role:customerRole._id,name:[{key:'th',value:'ผู้ใช้ทดสอบ'}],contact:{personalEmail:'qa-oauth-created@example.test'},password:'ignored-test-value'});
  expect(res.status).toBe(200);const created=await User.findOne({studentId:'QA-OAUTH-CREATED'}).select('+password');expect(created).toBeTruthy();expect(created.password).toBeFalsy();expect(res.body.data.password).toBeUndefined();
 });
 test('profile updates cannot set a password',async()=>{
  await request(app).put('/api/v1/user').set('x-access-token',token).send({_id:String(admin._id),bio:'Updated',password:'ignored-update'}).expect(200);
  expect((await User.findById(admin._id).select('+password')).password).toBe('legacy-unused');
 });
 test('verified Google identity signs in the pre-registered account by personal email',async()=>{
  mockVerifyIdToken.mockResolvedValueOnce({getPayload:()=>({email:'qa-oauth-created@example.test',name:'QA OAuth Customer',email_verified:true})});
  const res=await request(app).post('/api/v1/google/auth').send({token:'test-google-id-token'});
  expect(res.status).toBe(200);expect(res.body.data.role).toBe('Customer');expect(res.body.data.token).toBeTruthy();expect(res.body.data.password).toBeUndefined();expect(mockVerifyIdToken).toHaveBeenCalledWith({idToken:'test-google-id-token',audience:'qa-google-client'});
 });
 test('Google verification failure cannot issue a session',async()=>{
  mockVerifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
  const res=await request(app).post('/api/v1/google/auth').send({token:'invalid-token'});
  expect(res.status).toBeGreaterThanOrEqual(400);expect(res.body.data?.token).toBeUndefined();
 });
 test('legacy development fallback cannot accept an unverified Google payload',async()=>{
  const old=process.env.NODE_ENV,flag=process.env.ALLOW_UNVERIFIED_GOOGLE_DEV;
  try {
   process.env.NODE_ENV='development';process.env.ALLOW_UNVERIFIED_GOOGLE_DEV='true';
   mockVerifyIdToken.mockRejectedValueOnce(new Error('Signature verification failed'));
   const forged=jwt.sign({email:'qa-oauth-created@example.test',aud:'qa-google-client',iss:'https://accounts.google.com'},'not-google',{expiresIn:'5m'});
   const res=await request(app).post('/api/v1/google/auth').send({token:forged});
   expect(res.status).toBe(401);expect(res.body.data?.token).toBeUndefined();
  }finally{process.env.NODE_ENV=old;if(flag===undefined)delete process.env.ALLOW_UNVERIFIED_GOOGLE_DEV;else process.env.ALLOW_UNVERIFIED_GOOGLE_DEV=flag;}
 });
});
