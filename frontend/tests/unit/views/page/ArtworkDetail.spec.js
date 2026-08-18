import ArtworkDetail from '@/views/page/ArtworkDetail.vue'

describe('ArtworkDetail.vue related artworks', () => {
  it('shows only approved artworks owned by current artwork artist', () => {
    const currentArtwork = {
      _id: 'current-artwork',
      artist: { _id: 'owner-1' },
      category: { _id: 'category-1' }
    }
    const approvedArtworks = [
      { _id: 'same-owner', artist: 'owner-1', category: 'category-2' },
      { _id: 'other-owner', artist: { _id: 'owner-2' }, category: 'category-1' },
      { _id: 'current-artwork', artist: 'owner-1', category: 'category-1' },
      { _id: 'no-owner', category: 'category-1' }
    ]

    const relatedArtworks = ArtworkDetail.computed.relatedArtworks.call({
      artwork: currentArtwork,
      approvedArtworks
    })

    expect(relatedArtworks.map(artwork => artwork._id)).toEqual(['same-owner'])
  })
})
