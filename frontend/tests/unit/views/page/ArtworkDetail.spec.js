import ArtworkDetail from '@/views/page/ArtworkDetail.vue'
import CardArtwork from '@/components/CardArtwork.vue'

test('image zoom focuses its close control and restores the trigger when closed', () => {
  const focusClose = jest.fn(), focusTrigger = jest.fn()
  const vm = { artwork: { image: 'qa.png' }, showZoomModal: false,
    $refs: { zoomClose: { focus: focusClose }, zoomTrigger: { focus: focusTrigger } },
    $nextTick: callback => callback() }
  ArtworkDetail.methods.zoomImg.call(vm)
  expect(vm.showZoomModal).toBe(true)
  expect(focusClose).toHaveBeenCalled()
  ArtworkDetail.methods.closeZoom.call(vm)
  expect(vm.showZoomModal).toBe(false)
  expect(focusTrigger).toHaveBeenCalled()
})

const firstId = '6acf2ac75ba90021589e530a'
const secondId = '6acf2acc5ba90021589e54f0'
const works = [
  { _id: secondId, title: [{ key: 'en', value: 'The cycle of faith' }, { key: 'th', value: 'วัฏจักรแห่งศัทธา 2' }] },
  { _id: firstId, title: [{ key: 'en', value: 'The cycle of faith' }, { key: 'th', value: 'วัฏจักรแห่งศัทธา 1' }] }
]
const getName = (lang, art) => art.title.find(t => t.key === lang)?.value || ''

describe('Artwork purchase eligibility', () => {
  const art = (approval, sale = 'Available') => ({ _id: 'qa-work', status: {
    approval: { title: [{ key: 'en', value: approval }] },
    sale: { title: [{ key: 'en', value: sale }] }
  } })
  test.each(['Pending', 'Rejected', 'Reserved', undefined])('blocks %s approval on detail and cards', approval => {
    const artwork = art(approval)
    expect(ArtworkDetail.computed.isPurchasable.call({ artwork, getName })).toBe(false)
    expect(CardArtwork.methods.isPurchasable.call({ getName }, artwork)).toBe(false)
  })
  test('permits only approved, available work within its sale term', () => {
    expect(CardArtwork.methods.isPurchasable.call({ getName }, art('Approved'))).toBe(true)
    expect(CardArtwork.methods.isPurchasable.call({ getName }, art('Approved', 'Sold Out'))).toBe(false)
    const expired = { ...art('Approved'), postTermSale: { applicable: true, initialSaleEndsAt: '2020-01-01' } }
    expect(CardArtwork.methods.isPurchasable.call({ getName }, expired)).toBe(false)
    expect(CardArtwork.methods.isPurchasable.call({ getName }, { ...expired,
      postTermSale: { ...expired.postTermSale, decision: 'continue_sale' } })).toBe(true)
    expect(CardArtwork.methods.isPurchasable.call({ getName }, { ...expired,
      postTermSale: { ...expired.postTermSale, mode: 'standard_sale', decision: 'display_only' } })).toBe(false)
  })
  test.each(['Pending', 'Rejected', 'Reserved'])('does not add work whose approval changed to %s', async approval => {
    const dispatch = jest.fn().mockResolvedValue(art(approval))
    const vm = { artwork: art('Approved'), getName, isPurchasable: true,
      $store: { dispatch }, loadingItems: [], isInCart: () => false,
      isApprovalReserved: () => false, currentLocale: 'th' }
    await ArtworkDetail.methods.addToCart.call({ ...vm, isInCart: false })
    await CardArtwork.methods.handleCartAction.call({ ...vm,
      isPurchasable: artwork => CardArtwork.methods.isPurchasable.call({ getName }, artwork) }, vm.artwork)
    expect(dispatch.mock.calls.some(([action]) => action === 'cart/addToCart')).toBe(false)
  })
})

describe('Artwork links with duplicate English titles', () => {
  test('cards navigate by the identity of the selected artwork', () => {
    const push = jest.fn()
    for (const art of works) CardArtwork.methods.getDetail.call({ $router: { push }, getName }, art)
    expect(push.mock.calls.map(call => call[0])).toEqual([`/artwork/${secondId}`, `/artwork/${firstId}`])
  })

  const context = routeId => ({
    $route: { params: { id: routeId } }, allArtworks: works, getName,
    $store: { dispatch: jest.fn().mockImplementation((action, payload) => Promise.resolve(
      action === 'artwork/explore' ? works.find(a => a._id === payload._id) : undefined
    )) }, artwork: null, loading: false
  })

  test.each([firstId, secondId])('loads the exact artwork for its ID %s', async id => {
    const vm = context(id)
    await ArtworkDetail.methods.fetchArtwork.call(vm)
    expect(vm.artwork._id).toBe(id)
  })

  test('does not silently choose the first artwork for an ambiguous legacy slug', async () => {
    const vm = context('the-cycle-of-faith')
    vm.artwork = works[0]
    await ArtworkDetail.methods.fetchArtwork.call(vm)
    expect(vm.artwork).toBeNull()
    expect(vm.$store.dispatch).not.toHaveBeenCalled()
    expect(vm.loading).toBe(false)
  })

  test('retains legacy links whose title uniquely identifies an artwork', async () => {
    const vm = context('วัฏจักรแห่งศัทธา-1')
    await ArtworkDetail.methods.fetchArtwork.call(vm)
    expect(vm.artwork._id).toBe(firstId)
  })
})

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
