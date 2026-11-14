import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Router from 'vue-router'
import Coreui from '@coreui/vue-pro'
import CardArtwork from '@/components/CardArtwork.vue'
import Artworks from '@/views/page/Artworks.vue'
import Archive from '@/views/page/Archive.vue'
import ArtworkDetail from '@/views/page/ArtworkDetail.vue'
import SectionFeaturedHome from '@/views/page/components/SectionFeaturedHome.vue'
import PostTermSaleNotice from '@/views/Artist/components/PostTermSaleNotice.vue'
import i18nMixin from '@/mixins/i18nMixin'
import { isArtworkArchived, isArtworkPurchasable } from '@/utils/artworkPurchase'

const DAY = 86400000
const status = (en, th = en) => ({ title: [{ key: 'en', value: en }, { key: 'th', value: th }] })
const getName = (lang, item) => {
  if (!item) return ''
  if (typeof item === 'string') return item
  const field = item.title || item.name
  if (Array.isArray(field)) {
    return (field.find(v => v.key === lang) || field[0] || {}).value || ''
  }
  return ''
}

const makeArt = (id, overrides = {}) => ({
  _id: id,
  title: [{ key: 'th', value: `ผลงาน ${id}` }, { key: 'en', value: `Work ${id}` }],
  price: 12000,
  status: { approval: status('Approved'), sale: status('Available') },
  category: { title: [{ key: 'en', value: 'Painting' }, { key: 'th', value: 'จิตรกรรม' }] },
  courseLevel: '06',
  academicYear: '2568',
  views: 3,
  ...overrides
})

describe('Submission 1-Year Archive rules', () => {
  const now = Date.now()

  test('isArtworkArchived handles active, expired, Sold Out, Reserved, direct, and Admin override works', () => {
    const expiredSub = makeArt('expired-available', {
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const expiredSoldOut = makeArt('expired-sold', {
      status: { approval: status('Approved'), sale: status('Sold Out') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const expiredReserved = makeArt('expired-reserved', {
      status: { approval: status('Reserved'), sale: status('Reserved') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const activeSub = makeArt('active-sub', {
      postTermSale: { applicable: true, mode: 'initial_term', decision: 'pending', initialSaleEndsAt: new Date(now + 10 * DAY).toISOString() }
    })
    const directWork = makeArt('direct-work', {
      courseLevel: '00',
      postTermSale: { applicable: false }
    })
    const earlyArchived = makeArt('early-archived', {
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'display_only', initialSaleEndsAt: new Date(now + 30 * DAY).toISOString() }
    })
    const adminRestored = makeArt('admin-restored', {
      postTermSale: { applicable: true, mode: 'standard_sale', decision: 'continue_sale', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })

    expect(isArtworkArchived(expiredSub, getName, now)).toBe(true)
    expect(isArtworkArchived(expiredSoldOut, getName, now)).toBe(true)
    expect(isArtworkArchived(expiredReserved, getName, now)).toBe(false)
    expect(isArtworkArchived(activeSub, getName, now)).toBe(false)
    expect(isArtworkArchived(directWork, getName, now)).toBe(false)
    expect(isArtworkArchived(earlyArchived, getName, now)).toBe(true)
    expect(isArtworkPurchasable(earlyArchived, getName)).toBe(false)
    expect(isArtworkArchived(adminRestored, getName, now)).toBe(false)
    expect(isArtworkPurchasable(adminRestored, getName)).toBe(true)
  })

  test('CardArtwork hides prices and cart buttons for archived & Sold Out archived works', () => {
    const localVue = createLocalVue()
    localVue.use(Router); localVue.use(Coreui); localVue.mixin(i18nMixin)
    const router = new Router({ mode: 'abstract', routes: [{ path: '/artwork/:id', component: {} }] })
    const archivedExhibit = makeArt('arch-ex', {
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const archivedSold = makeArt('arch-sold', {
      status: { approval: status('Approved'), sale: status('Sold Out') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })

    const wrapper = mount(CardArtwork, {
      localVue,
      router,
      propsData: { artworks: [archivedExhibit, archivedSold], archiveMode: true },
      mocks: { $i18n: { locale: 'en' }, $store: { getters: { 'cart/isInCart': () => false }, dispatch: jest.fn() } },
      stubs: { CIcon: true, CModal: true }
    })

    expect(wrapper.find('.action-btn-circle-premium').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('12,000')
    expect(wrapper.text()).toContain('Archive')
    expect(wrapper.text()).toContain('Sold Out')
    wrapper.destroy()
  })

  test('Artworks and Archive separate expired works and hide price filters on /archive', () => {
    const localVue = createLocalVue()
    localVue.use(Router); localVue.use(Coreui); localVue.mixin(i18nMixin)
    const router = new Router({ mode: 'abstract', routes: [{ path: '/artworks', component: {} }, { path: '/archive', component: {} }] })

    const active = makeArt('active-1', {
      postTermSale: { applicable: true, mode: 'initial_term', decision: 'pending', initialSaleEndsAt: new Date(now + 20 * DAY).toISOString() }
    })
    const expired = makeArt('arch-1', {
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const expiredSold = makeArt('arch-sold-1', {
      status: { approval: status('Approved'), sale: status('Sold Out') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const direct = makeArt('direct-1', { postTermSale: { applicable: false } })

    const mountCatalog = archiveMode => mount(Artworks, {
      localVue,
      router,
      propsData: { archiveMode },
      mocks: {
        $i18n: { locale: 'en' },
        $route: { query: {} },
        $store: {
          getters: {
            'artwork/artworks': [active, expired, expiredSold, direct],
            'cart/isInCart': () => false
          },
          dispatch: jest.fn().mockResolvedValue([])
        }
      },
      stubs: { CIcon: true, SectionHeaderArtworks: true }
    })

    const gallery = mountCatalog(false)
    expect(gallery.vm.approvedArtworks.map(a => a._id)).toEqual(['active-1', 'direct-1'])
    expect(gallery.find('.archive-callout-banner').exists()).toBe(false)
    expect(gallery.text()).toContain('FILTER BY PRICE')
    expect(gallery.text()).toContain('FILTER BY RANGE')
    expect(gallery.vm.heroDescription).toContain('60%')
    expect(gallery.vm.heroDescription).toContain('40%')
    gallery.destroy()

    const archive = mountCatalog(true)
    expect(archive.vm.approvedArtworks.map(a => a._id)).toEqual(['arch-1', 'arch-sold-1'])
    expect(archive.find('.archive-callout-banner').exists()).toBe(false)
    expect(archive.text()).not.toContain('FILTER BY PRICE')
    expect(archive.text()).not.toContain('FILTER BY RANGE')
    expect(archive.vm.heroDescription).toContain('Cohort 1')
    archive.destroy()

    expect(Archive.name).toBe('Archive')
  })

  test('Thai navigation cuts Archive suffix and Artworks/Archive hero headers render Art Archive + descriptions', () => {
    const thLocale = require('@/store/lang/th').default
    expect(thLocale.header.archive).toBe('คลังผลงาน')

    const localVue = createLocalVue()
    localVue.use(Router); localVue.use(Coreui); localVue.mixin(i18nMixin)
    const router = new Router({ mode: 'abstract', routes: [{ path: '/artworks', component: {} }, { path: '/archive', component: {} }] })

    const mountHero = (locale, archiveMode) => mount(Artworks, {
      localVue,
      router,
      propsData: { archiveMode },
      mocks: {
        $i18n: { locale },
        $route: { query: {} },
        $store: {
          getters: { 'artwork/artworks': [], 'cart/isInCart': () => false },
          dispatch: jest.fn().mockResolvedValue([])
        }
      },
      stubs: { CIcon: true, ArtworkCard: true, HeroGravityVisual: true }
    })

    const archiveEn = mountHero('en', true)
    expect(archiveEn.find('.hero-title').text().replace(/\s+/g, ' ').trim()).toBe('Art Archive')
    expect(archiveEn.find('.hero-description').text()).toContain('Cohort 1 to the present')
    archiveEn.destroy()

    const archiveTh = mountHero('th', true)
    expect(archiveTh.find('.hero-title').text()).toContain('คลังผลงาน')
    expect(archiveTh.find('.hero-title').text()).toContain('Art Archive')
    expect(archiveTh.find('.hero-description').text()).toContain('ตั้งแต่รุ่นที่ 1 ถึงรุ่นปัจจุบัน')
    archiveTh.destroy()

    const artworksTh = mountHero('th', false)
    expect(artworksTh.find('.hero-description').text()).toContain('60%')
    expect(artworksTh.find('.hero-description').text()).toContain('40%')
    artworksTh.destroy()
  })

  test('Cohort filter displays งานศิลปะ อิสระ / Independent Artwork instead of bare year 2569 for independent works', () => {
    const localVue = createLocalVue()
    localVue.use(Router); localVue.use(Coreui); localVue.mixin(i18nMixin)
    const router = new Router({ mode: 'abstract', routes: [{ path: '/artworks', component: {} }] })

    const independentArt = makeArt('ind-1', { courseLevel: '00', academicYear: '2569' })
    const cohortArt = makeArt('coh-1', { courseLevel: '09', academicYear: '2569' })
    const olderCohortArt = makeArt('coh-old', { courseLevel: '05', academicYear: '2568' })

    const mountFilter = (locale) => mount(Artworks, {
      localVue,
      router,
      mocks: {
        $i18n: { locale },
        $route: { query: {} },
        $store: {
          getters: { 'artwork/artworks': [independentArt, olderCohortArt, cohortArt], 'cart/isInCart': () => false },
          dispatch: jest.fn().mockResolvedValue([])
        }
      },
      stubs: { CIcon: true, SectionHeaderArtworks: true, ArtworkCard: true }
    })

    const thWrapper = mountFilter('th')
    const thLabels = thWrapper.vm.cohortOptions.map(c => thWrapper.vm.formatCohortLabel(c))
    expect(thLabels).toEqual(['รุ่น 09 · 2569', 'รุ่น 05 · 2568', 'งานศิลปะ อิสระ'])
    expect(thLabels).not.toContain('2569')
    thWrapper.destroy()

    const enWrapper = mountFilter('en')
    const enLabels = enWrapper.vm.cohortOptions.map(c => enWrapper.vm.formatCohortLabel(c))
    expect(enLabels).toEqual(['Cohort 09 · 2569', 'Cohort 05 · 2568', 'Independent Artwork'])
    expect(enLabels).not.toContain('2569')
    enWrapper.destroy()
  })

  test('ArtworkDetail hides price and purchase button for archived artworks', () => {
    const localVue = createLocalVue()
    localVue.use(Coreui); localVue.mixin(i18nMixin)
    const archived = makeArt('arch-detail', {
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const wrapper = shallowMount(ArtworkDetail, {
      localVue,
      data() {
        return {
          loading: false,
          loadError: false,
          artwork: archived
        }
      },
      created() {},
      methods: {
        fetchArtwork() {}
      },
      mocks: {
        $i18n: { locale: 'en' },
        $route: { params: { id: 'arch-detail' } },
        $router: { push: jest.fn() },
        $store: {
          getters: { 'artwork/artworks': [archived], 'cart/isInCart': () => false },
          dispatch: jest.fn()
        }
      },
      stubs: { CIcon: true, CModal: true, ArtworkCard: true }
    })
    // Override mounted fetchArtwork cleanly on instance; check computed & rendered DOM:
    expect(wrapper.vm.isArchivedArtwork).toBe(true)
    expect(wrapper.vm.isPurchasable).toBe(false)
    expect(wrapper.find('.valuation-block').exists()).toBe(false)
    expect(wrapper.find('.btn-purchase-premium').exists()).toBe(false)
    expect(wrapper.text()).toContain('Archive')
    wrapper.destroy()
  })

  test('SectionFeaturedHome excludes archived artworks from Homepage', () => {
    const localVue = createLocalVue()
    localVue.use(Coreui); localVue.mixin(i18nMixin)
    const active = makeArt('home-active', {
      postTermSale: { applicable: true, mode: 'initial_term', decision: 'pending', initialSaleEndsAt: new Date(now + 10 * DAY).toISOString() }
    })
    const archived = makeArt('home-arch', {
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })

    const wrapper = shallowMount(SectionFeaturedHome, {
      localVue,
      methods: { fetchArtworks() {} },
      mocks: {
        $i18n: { locale: 'th' },
        $store: { getters: { 'artwork/artworks': [active, archived] }, dispatch: jest.fn() }
      },
      stubs: { CIcon: true, CardArtworks: true }
    })
    expect(wrapper.vm.filteredArtworks.map(a => a._id)).toEqual(['home-active'])
    wrapper.destroy()
  })

  test('PostTermSaleNotice renders read-only Archive warning without artist choice buttons', () => {
    const localVue = createLocalVue()
    localVue.use(Coreui); localVue.mixin(i18nMixin)
    const dueSoon = makeArt('notice-soon', {
      postTermSale: { applicable: true, mode: 'initial_term', decision: 'pending', initialSaleEndsAt: new Date(now + 5 * DAY).toISOString() }
    })
    const wrapper = shallowMount(PostTermSaleNotice, {
      localVue,
      methods: { fetchItems() {} },
      data() {
        return { loading: false, items: [dueSoon] }
      },
      mocks: { $i18n: { locale: 'th' } },
      stubs: { CIcon: true }
    })
    expect(wrapper.findAll('button').length).toBe(0)
    expect(wrapper.findAll('.decision-select-card').length).toBe(0)
    expect(wrapper.text()).toContain('Archive')
    expect(wrapper.text()).not.toContain('วางขายต่อแบบปกติ')
    wrapper.destroy()
  })

  test('Viewing an archived artwork increments views once without affecting active sale artworks', async () => {
    const localVue = createLocalVue()
    localVue.use(Router); localVue.use(Coreui); localVue.mixin(i18nMixin)
    const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

    const archivedId = '6af69816141b625dacb70c36'
    const activeId = '6af69816141b625dacb70c99'
    const archived = makeArt(archivedId, {
      views: 4,
      status: { approval: status('Approved'), sale: status('Exhibition') },
      postTermSale: { applicable: true, mode: 'display_only', decision: 'pending', initialSaleEndsAt: new Date(now - DAY).toISOString() }
    })
    const active = makeArt(activeId, {
      views: 10,
      postTermSale: { applicable: true, mode: 'initial_term', decision: 'pending', initialSaleEndsAt: new Date(now + 10 * DAY).toISOString() }
    })

    const archivedDispatch = jest.fn((action) => {
      if (action === 'artwork/explore') return Promise.resolve({ ...archived })
      if (action === 'artwork/get') return Promise.resolve([archived])
      if (action === 'artwork/updateView') return Promise.resolve({ ...archived, views: 5 })
      return Promise.resolve()
    })

    const archivedRouter = new Router({ mode: 'abstract', routes: [{ path: '/artwork/:id', component: {} }] })
    await archivedRouter.push(`/artwork/${archivedId}`)
    const archivedWrapper = shallowMount(ArtworkDetail, {
      localVue,
      router: archivedRouter,
      mocks: {
        $i18n: { locale: 'th' },
        $store: {
          getters: { 'artwork/artworks': [archived], 'cart/isInCart': () => false },
          dispatch: archivedDispatch
        }
      },
      stubs: { CIcon: true, CModal: true, ArtworkCard: true }
    })

    await flushPromises()
    expect(archivedDispatch).toHaveBeenCalledWith('artwork/updateView', archivedId)
    expect(archivedWrapper.vm.artwork.views).toBe(5)

    // Subsequent silent polling must not double-count view
    await archivedWrapper.vm.fetchArtwork(true)
    await flushPromises()
    const viewCalls = archivedDispatch.mock.calls.filter(([action]) => action === 'artwork/updateView')
    expect(viewCalls).toHaveLength(1)
    archivedWrapper.destroy()

    const activeDispatch = jest.fn((action) => {
      if (action === 'artwork/explore') return Promise.resolve({ ...active })
      if (action === 'artwork/get') return Promise.resolve([active])
      if (action === 'artwork/updateView') return Promise.resolve({ ...active, views: 11 })
      return Promise.resolve()
    })

    const activeRouter = new Router({ mode: 'abstract', routes: [{ path: '/artwork/:id', component: {} }] })
    await activeRouter.push(`/artwork/${activeId}`)
    const activeWrapper = shallowMount(ArtworkDetail, {
      localVue,
      router: activeRouter,
      mocks: {
        $i18n: { locale: 'th' },
        $store: {
          getters: { 'artwork/artworks': [active], 'cart/isInCart': () => false },
          dispatch: activeDispatch
        }
      },
      stubs: { CIcon: true, CModal: true, ArtworkCard: true }
    })

    await flushPromises()
    expect(activeDispatch).not.toHaveBeenCalledWith('artwork/updateView', activeId)
    expect(activeWrapper.vm.artwork.views).toBe(10)
    activeWrapper.destroy()
  })
})
