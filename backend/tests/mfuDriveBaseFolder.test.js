'use strict';
jest.mock('axios', () => jest.fn());
const axios = require('axios');
const mfuDrive = require('../helpers/mfuDrive');

test('creates the configured base folder once before nested folders and the upload', async () => {
  Object.assign(process.env, {
    MFU_DRIVE_ENABLED: 'true',
    MFU_DRIVE_WEBDAV_URL: 'https://drive.example.test/public.php/dav/files/share/qa-base',
    MFU_DRIVE_PUBLIC_URL: 'https://drive.example.test/public.php/dav/files/share/qa-base',
  });
  axios.mockResolvedValue({ status: 201 });
  await mfuDrive.uploadBuffer('order/slip/a.png', Buffer.from('x'), 'image/png');
  await mfuDrive.uploadBuffer('order/slip/b.png', Buffer.from('y'), 'image/png');
  const calls = axios.mock.calls.map(([o]) => `${o.method} ${o.url.replace('https://drive.example.test/public.php/dav/files/share', '')}`);
  expect(calls).toEqual([
    'MKCOL /qa-base', 'MKCOL /qa-base/order', 'MKCOL /qa-base/order/slip', 'PUT /qa-base/order/slip/a.png',
    'PUT /qa-base/order/slip/b.png',
  ]);
});

test('a share root that already exists (405) is accepted', async () => {
  jest.resetModules();
  jest.doMock('axios', () => jest.fn(async o => ({ status: o.method === 'MKCOL' ? 405 : 201 })));
  const fresh = require('../helpers/mfuDrive');
  await expect(fresh.uploadBuffer('x/y.png', Buffer.from('z'))).resolves.toMatchObject({ relativePath: 'x/y.png' });
});

test('a refused base-folder MKCOL does not block the upload', async () => {
  jest.resetModules();
  jest.doMock('axios', () => jest.fn(async o => ({ status: o.method === 'MKCOL' && o.url.endsWith('/qa-base') ? 403 : 201 })));
  Object.assign(process.env, { MFU_DRIVE_ENABLED: 'true', MFU_DRIVE_WEBDAV_URL: 'https://drive.example.test/public.php/dav/files/share/qa-base' });
  const fresh = require('../helpers/mfuDrive');
  await expect(fresh.uploadBuffer('x/y.png', Buffer.from('z'))).resolves.toMatchObject({ relativePath: 'x/y.png' });
});
