const express = require('express');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

describe('Order documents cannot bypass authenticated download endpoints', () => {
  let app, folder, baseUrl;
  beforeAll(() => {
    const parent = path.join(__dirname, '../public/account/User');
    fs.mkdirSync(parent, { recursive: true });
    folder = fs.mkdtempSync(path.join(parent, 'QA-STATIC-DOC-'));
    for (const name of ['Invoice', 'Certificate']) {
      fs.mkdirSync(path.join(folder, name));
      fs.writeFileSync(path.join(folder, name, 'qa.pdf'), '%PDF-QA-private');
    }
    fs.writeFileSync(path.join(folder, 'qa.png'), Buffer.from('QA-image'));
    baseUrl = '/account/User/' + path.basename(folder);
    app = express();
    require('../middleware/middlewares')(app);
  });
  afterAll(() => {
    for (const name of ['Invoice', 'Certificate']) {
      fs.unlinkSync(path.join(folder, name, 'qa.pdf'));
      fs.rmdirSync(path.join(folder, name));
    }
    fs.unlinkSync(path.join(folder, 'qa.png'));
    fs.rmdirSync(folder);
  });
  test.each(['', '/uploads'])('blocks both private document folders under %s', async alias => {
    for (const name of ['Invoice', 'Certificate']) {
      await request(app).get(`${alias}${baseUrl}/${name}/qa.pdf`).expect(404);
    }
  });
  it('blocks encoded folder names too', async () => {
    await request(app).get(`${baseUrl}/%49nvoice/qa.pdf`).expect(404);
    await request(app).get(`/uploads${baseUrl}/%43ertificate/qa.pdf`).expect(404);
  });
  it('keeps existing artwork/profile image URLs available', async () => {
    await request(app).get(`${baseUrl}/qa.png`).expect(200);
    await request(app).get(`/uploads${baseUrl}/qa.png`).expect(200);
  });
});
