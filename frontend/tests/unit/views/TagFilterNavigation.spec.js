import { createLocalVue, shallowMount } from '@vue/test-utils'
import Router from 'vue-router'
import Coreui from '@coreui/vue-pro'
import i18nMixin from '@/mixins/i18nMixin'
import Artworks from '@/views/page/Artworks.vue'
import ArtworkDetail from '@/views/page/ArtworkDetail.vue'

const status = value => ({ title: [{ key: 'en', value }] })
const categoryPainting = { _id: 'cat-paint', title: [{ key: 'th', value: 'จิตรกรรม' }, { key: 'en', value: 'Painting' }] }
const categorySculpture = { _id: 'cat-sculpt', title: [{ key: 'th', value: 'ประติมากรรม' }, { key: 'en', value: 'Sculpture' }] }

describe('Tag filter navigation across Artworks and ArtworkDetail', () => {
  it('Artworks reads ?cohort query, shows active filter bar with cohort count, and clears filter cleanly', async () => {
    const localVue = createLocalVue()
    localVue.use(Router)
    localVue.use(Coreui)
    localVue.mixin(i18nMixin)
    const router = new Router({
      mode: 'abstract',
      routes: [
        { path: '/artworks', name: 'Artworks', component: Artworks },
        { path: '/archive', name: 'Archive', component: Artworks },
      ],
    })
    await router.push({ path: '/artworks', query: { cohort: '2569|05' } })

    const artworks = [
      { _id: 'a1', courseLevel: '05', academicYear: '2569', price: 10000, category: categoryPainting, status: { approval: status('Approved'), sale: status('Available') } },
      { _id: 'a2', courseLevel: '05', academicYear: '2569', price: 12000, category: categorySculpture, status: { approval: status('Approved'), sale: status('Available') } },
      { _id: 'a3', courseLevel: '06', academicYear: '2569', price: 15000, category: categoryPainting, status: { approval: status('Approved'), sale: status('Available') } },
    ]

    const dispatch = jest.fn((action) => {
      if (action === 'artwork/category') return Promise.resolve([categoryPainting, categorySculpture])
      if (action === 'submission/get') return Promise.resolve([])
      return Promise.resolve([])
    })

    const wrapper = shallowMount(Artworks, {
      localVue,
      router,
      mocks: {
        $i18n: { locale: 'th' },
        $store: { getters: { 'artwork/artworks': artworks }, dispatch },
      },
      stubs: { CContainer: true, CIcon: true, CSpinner: true, SectionHeaderArtworks: true, ArtworkCard: true },
    })
    await new Promise(resolve => setImmediate(resolve))

    const bar = wrapper.find('.active-filter-bar')
    expect(bar.exists()).toBe(true)
    expect(bar.text()).toContain('ผู้เรียนรุ่นที่ 05 · 2 ผลงาน')
    expect(wrapper.vm.filteredArtworks.map(a => a._id)).toEqual(['a1', 'a2'])

    await wrapper.find('.active-filter-remove').trigger('click')
    expect(wrapper.vm.filters.cohort).toBe('all')
    expect(wrapper.vm.filteredArtworks).toHaveLength(3)
    wrapper.destroy()
  })

  it('ArtworkDetail renders clickable cohort and category tags and navigates with query params', async () => {
    const localVue = createLocalVue()
    localVue.use(Router)
    localVue.use(Coreui)
    localVue.mixin(i18nMixin)
    const router = new Router({
      mode: 'abstract',
      routes: [
        { path: '/artwork/:id', name: 'ArtworkDetail', component: ArtworkDetail },
        { path: '/artworks', name: 'Artworks', component: {} },
        { path: '/archive', name: 'Archive', component: {} },
      ],
    })
    await router.push('/artwork/art-detail-1')
    const push = jest.spyOn(router, 'push').mockResolvedValue()

    const wrapper = shallowMount({ ...ArtworkDetail, watch: {}, mounted() {} }, {
      localVue,
      router,
      data() {
        return {
          loading: false,
          loadError: false,
          artwork: {
            _id: 'art-detail-1',
            title: [{ key: 'th', value: 'พลังความเชื่อ 2' }],
            courseLevel: '05',
            academicYear: '2569',
            category: categoryPainting,
            price: 15000,
            status: { approval: status('Approved'), sale: status('Available') },
          },
        }
      },
      mocks: {
        $i18n: { locale: 'th' },
        $store: { getters: { 'cart/isInCart': () => false, 'artwork/artworks': [] }, dispatch: jest.fn() },
      },
      stubs: { CContainer: true, CRow: true, CCol: true, CIcon: true, CSpinner: true, CLink: true, CButton: true, CModal: true, ArtworkCard: true },
    })

    const cohortBtn = wrapper.find('.detail-meta-tags .badge-cohort-tag')
    const catBtn = wrapper.find('.detail-meta-tags .badge-category-tag')
    expect(cohortBtn.text()).toBe('ผู้เรียนรุ่นที่ 05')
    expect(catBtn.text()).toBe('จิตรกรรม')

    await cohortBtn.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/artworks', query: { cohort: '2569|05' } })

    push.mockClear()
    await catBtn.trigger('click')
    expect(push).toHaveBeenCalledWith({ path: '/artworks', query: { category: 'จิตรกรรม' } })
    wrapper.destroy()
  })
})
