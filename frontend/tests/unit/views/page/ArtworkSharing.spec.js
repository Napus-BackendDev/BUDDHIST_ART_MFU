import { createLocalVue, mount } from '@vue/test-utils'
import Router from 'vue-router'
import Coreui from '@coreui/vue-pro'
import ArtworkDetail from '@/views/page/ArtworkDetail.vue'

const originalShare = navigator.share
const originalClipboard = navigator.clipboard
const context = () => {
  const vm = { shareUrl: '', shareStatus: '', isCopying: false, artwork: {},
    $i18n: { locale: 'th' }, getName: () => 'QA Artwork' }
  vm.copyArtworkLink = () => ArtworkDetail.methods.copyArtworkLink.call(vm)
  return vm
}
afterEach(() => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: originalShare })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: originalClipboard })
})
const browser = (share, clipboard) => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: share })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard })
}

test('clipboard success exposes the actual URL and a success status', async () => {
  const writeText = jest.fn().mockResolvedValue()
  browser(undefined, { writeText })
  const vm = context()
  await ArtworkDetail.methods.shareArtwork.call(vm)
  expect(writeText).toHaveBeenCalledWith(window.location.href)
  expect(vm.shareUrl).toBe(window.location.href)
  expect(vm.shareStatus).toBe('copied')
})

test.each([undefined, { writeText: jest.fn().mockRejectedValue(new Error('denied')) }])('clipboard unavailable or denied never claims success', async clipboard => {
  browser(undefined, clipboard)
  const vm = context()
  await ArtworkDetail.methods.shareArtwork.call(vm)
  expect(vm.shareUrl).toBe(window.location.href)
  expect(vm.shareStatus).toBe('manual')
  expect(vm.isCopying).toBe(false)
})

test('cancelled native sharing does not copy or claim success; the link stays available', async () => {
  const writeText = jest.fn()
  browser(jest.fn().mockRejectedValue({ name: 'AbortError' }), { writeText })
  const vm = context()
  await ArtworkDetail.methods.shareArtwork.call(vm)
  expect(writeText).not.toHaveBeenCalled()
  expect(vm.shareUrl).toBe(window.location.href)
  expect(vm.shareStatus).toBe('')
})

test('failed native sharing falls back to clipboard', async () => {
  browser(jest.fn().mockRejectedValue(new Error('unavailable')), { writeText: jest.fn().mockResolvedValue() })
  const vm = context()
  await ArtworkDetail.methods.shareArtwork.call(vm)
  expect(vm.shareStatus).toBe('copied')
})

test('native share success reports sharing without pretending to copy', async () => {
  const writeText = jest.fn()
  browser(jest.fn().mockResolvedValue(), { writeText })
  const vm = context()
  await ArtworkDetail.methods.shareArtwork.call(vm)
  expect(vm.shareStatus).toBe('shared')
  expect(writeText).not.toHaveBeenCalled()
})

test.each([null, {}])('missing artist identity exposes no broken profile link', artist => {
  expect(ArtworkDetail.computed.artistProfileRoute.call({ artwork: { artist }, getName: () => '' })).toBeNull()
})

test.each(['th', 'en'])('both responsive artist widgets expose native profile links (%s)', locale => {
  const localVue = createLocalVue(); localVue.use(Router); localVue.use(Coreui)
  const router = new Router({ mode: 'abstract', routes: [{ path: '/artist-profile/:id', name: 'ArtistPublicProfile', component: {} }] })
  const wrapper = mount({ ...ArtworkDetail, mounted() {} }, { localVue, router,
    data: () => ({ loading: false, artwork: { _id: 'qa-art', artist: { _id: 'qa-artist', title: [{ key: 'en', value: 'QA Artist' }] } } }),
    mocks: { $i18n: { locale }, $store: { getters: { 'artwork/artworks': [], 'cart/isInCart': () => false } } },
    stubs: { CIcon: true, CModal: true, ArtworkCard: true } })
  const links = wrapper.findAll('.artist-name a')
  expect(links).toHaveLength(2)
  for (const link of links.wrappers) expect(link.attributes('href')).toBe('/artist-profile/qa-artist')
  wrapper.destroy()
})
