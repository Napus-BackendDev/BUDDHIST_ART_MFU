jest.doMock('@/service/api', () => ({ __esModule: true, default: {} }))
const Queue = require('@/views/Admin/components/post_term/PostTermSaleQueue.vue').default
const AdminTable = require('@/views/Admin/components/table/AdminTable.vue').default

const artwork = {
  _id: 'published-artwork-id', submissionArtworkId: 'original-submission-artwork-id',
  image: 'https://drive.google.com/thumbnail?id=public-image&sz=w1600'
}

describe('Published artwork images', () => {
  test('the post-term table and preview resolve a published artwork through the original image API', () => {
    const url = Queue.methods.getImageUrl(artwork)
    expect(url).toMatch(/\/api\/v1\/submission\/image\/original-submission-artwork-id$/)
    const context = { getImageUrl: Queue.methods.getImageUrl, titleOf: () => 'Artwork' }
    Queue.methods.zoomImg.call(context, artwork)
    expect(context.zoomedImage).toBe(url)
    expect(context.showZoomModal).toBe(true)
  })

  test('the artwork management table zoom uses the same source image', () => {
    const context = {}
    AdminTable.methods.zoomImg.call(context, artwork)
    expect(context.zoomImageUrl).toMatch(/\/api\/v1\/submission\/image\/original-submission-artwork-id$/)
    expect(context.zoomArtwork).toBe(artwork)
  })

  test('keeps directly uploaded images working in the post-term queue', () => {
    expect(Queue.methods.getImageUrl({ image: 'https://example.com/upload.jpg' })).toBe('https://example.com/upload.jpg')
    expect(Queue.methods.getImageUrl({ image: null })).toBe('')
  })
})
