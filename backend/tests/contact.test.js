const express = require('express');
const request = require('supertest');
jest.mock('../helpers/google/Mail', () => ({ sendMail: jest.fn() }));
const { sendMail } = require('../helpers/google/Mail');
const routePath = '../server/Project/Contact/contact.routes';
const inquiry = { name: 'QA Contact', email: 'qa@example.test', subject: '<b>QA subject</b>', message: 'QA message' };
let app;
const original = { enabled: process.env.EMAIL_ENABLED, recipient: process.env.CONTACT_EMAIL };
beforeEach(() => {
  jest.clearAllMocks();
  process.env.EMAIL_ENABLED = 'true';
  process.env.CONTACT_EMAIL = 'qa-inbox@example.test';
  // Fresh limiter per independent scenario.
  jest.isolateModules(() => {
    app = express();
    app.use(express.json());
    app.use('/contact', require(routePath));
  });
  sendMail.mockResolvedValue({ success: true });
});
afterAll(() => {
  for (const [key, value] of Object.entries({ EMAIL_ENABLED: original.enabled, CONTACT_EMAIL: original.recipient })) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
test('sends validated plain text only to the configured inbox', async () => {
  await request(app).post('/contact').send({ ...inquiry, to: 'attacker@example.test' }).expect(200, { success: true });
  expect(sendMail).toHaveBeenCalledWith('qa-inbox@example.test', 'Buddhist Art MFU: Contact inquiry', expect.stringContaining(inquiry.subject));
  expect(sendMail.mock.calls[0]).toHaveLength(3);
});
test.each([{ email: 'bad' }, { message: ' ' }, { name: ['QA'] }, { message: 'x'.repeat(5001) }])('rejects invalid or oversized input %p', async override => {
  await request(app).post('/contact').send({ ...inquiry, ...override }).expect(400);
  expect(sendMail).not.toHaveBeenCalled();
});
test('does not claim success when email is disabled or delivery fails', async () => {
  process.env.EMAIL_ENABLED = 'false';
  await request(app).post('/contact').send(inquiry).expect(503);
  expect(sendMail).not.toHaveBeenCalled();
  process.env.EMAIL_ENABLED = 'true';
  sendMail.mockRejectedValue(new Error('SMTP unavailable'));
  await request(app).post('/contact').send(inquiry).expect(502, { success: false });
});
test('limits public contact submissions per IP', async () => {
  for (let n = 0; n < 3; n++) await request(app).post('/contact').send({}).expect(400);
  const response = await request(app).post('/contact').send(inquiry).expect(429);
  expect(response.headers['retry-after']).toBeTruthy();
  expect(sendMail).not.toHaveBeenCalled();
});
