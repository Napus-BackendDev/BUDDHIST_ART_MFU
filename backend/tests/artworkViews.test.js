const request = require('supertest');
const { getApp, closeDatabase } = require('./appHelper');
const Artwork = require('../server/Project/Artwork/models/artwork.model');
const Status = require('../server/Project/Settings/models/status.model');

describe('Artwork view tracking', () => {
  jest.setTimeout(30000);
  let app;
  let approved;

  beforeAll(async () => {
    app = await getApp();
    approved = await Status.create({ code: 'APPROVED', title: [{ key: 'en', value: 'Approved' }] });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await Artwork.deleteMany({});
  });

  it('keeps artwork reads and background polling from incrementing views', async () => {
    const artwork = await Artwork.create({
      title: [{ key: 'en', value: 'Test artwork' }],
      views: 0,
      status: { approval: approved._id },
    });
    const artworkId = artwork._id.toString();

    const firstRead = await request(app)
      .post('/api/v1/artwork/explore')
      .send({ _id: artworkId })
      .expect(200);
    const secondRead = await request(app)
      .post('/api/v1/artwork/explore')
      .send({ _id: artworkId })
      .expect(200);

    expect(firstRead.body.data.views).toBe(0);
    expect(secondRead.body.data.views).toBe(0);

    const recordedView = await request(app)
      .get(`/api/v1/artwork/view/${artworkId}`)
      .expect(200);

    expect(recordedView.body.data.views).toBe(1);
    expect((await Artwork.findById(artworkId)).views).toBe(1);
  });
});
