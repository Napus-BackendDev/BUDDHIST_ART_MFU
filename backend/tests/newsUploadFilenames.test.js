jest.mock('multer', () => {
  const multer = jest.fn(() => ({ array: jest.fn(), single: jest.fn() }));
  multer.diskStorage = jest.fn(options => options);
  return multer;
});
const multer = require('multer');
const uploadImage = require('../middleware/uploadMiddleware');
const filename = (storage, request, originalname) => {
  let result;
  storage.filename(request, { originalname }, (error, name) => { if (error) throw error; result = name; });
  return result;
};
let storage;
beforeEach(() => {
  multer.diskStorage.mockClear();
  uploadImage('news', 'images', true, 10);
  storage = multer.diskStorage.mock.calls[0][0];
});
test('independent uploads to the same news folder never reuse their image URL', () => {
  const first = filename(storage, {}, 'qa.png');
  const second = filename(storage, {}, 'qa.png');
  expect(first).not.toBe(second);
  expect(first.endsWith('.png')).toBe(true);
  expect(second.endsWith('.png')).toBe(true);
});
test('multiple image uploads retain extensions and distinct filenames in one request', () => {
  const request = {};
  const first = filename(storage, request, 'qa.png');
  const second = filename(storage, request, 'qa.jpeg');
  expect(first).not.toBe(second);
  expect(first.endsWith('.png')).toBe(true);
  expect(second.endsWith('.jpeg')).toBe(true);
});
