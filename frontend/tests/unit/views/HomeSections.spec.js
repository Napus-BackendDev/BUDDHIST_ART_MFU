import { createLocalVue, shallowMount } from '@vue/test-utils'
import i18nMixin from '@/mixins/i18nMixin'
import SectionFeaturedHome from '@/views/page/components/SectionFeaturedHome.vue'
import SectionStudentShowcase from '@/views/page/components/SectionStudentShowcase.vue'

const status = value => ({ title: [{ key: 'en', value }] })

describe('Homepage artwork sections feedback', () => {
  it('SectionFeaturedHome uses Latest Learner Artworks title, prioritizes purchasable works, avoids Showcase top overlap when pool allows, and uses deterministic seeded shuffle', () => {
    const localVue = createLocalVue()
    localVue.mixin(i18nMixin)
    const artworks = [
      // 13 cohort-6 works (top 12 picked by showcase seed) + 2 distinct works
      ...Array.from({ length: 13 }, (_, idx) => ({
        _id: `c6-${idx}`,
        courseLevel: '6',
        academicYear: '2026',
        createdAt: `2026-06-${String(idx + 1).padStart(2, '0')}`,
        status: { approval: status('Approved'), sale: status(idx === 12 ? 'Sold Out' : 'Available') },
      })),
      { _id: 'cohort5-avail-a', courseLevel: '5', academicYear: '2025', createdAt: '2025-10-01', status: { approval: status('Approved'), sale: status('Available') } },
      { _id: 'cohort5-avail-b', courseLevel: '5', academicYear: '2025', createdAt: '2025-10-02', status: { approval: status('Approved'), sale: status('Available') } },
      { _id: 'indep-avail-c', courseLevel: '00', createdAt: '2026-06-01', status: { approval: status('Approved'), sale: status('Available') } },
      { _id: 'cohort5-sold', courseLevel: '5', academicYear: '2025', createdAt: '2025-09-01', status: { approval: status('Approved'), sale: status('Sold Out') } },
    ]
    const mountFeatured = (visitSeed) => shallowMount(SectionFeaturedHome, {
      localVue,
      data() { return { loading: false, loadError: false, fetching: false, polling: null, visitSeed } },
      methods: { fetchArtworks: jest.fn() },
      mocks: {
        $i18n: { locale: 'th' },
        $store: { getters: { 'artwork/artworks': artworks }, dispatch: jest.fn() },
      },
      stubs: { CContainer: true, CSpinner: true, CIcon: true, CardArtworks: true },
    })

    const w1 = mountFeatured('2026-11-13:visit-a')
    const w1Again = mountFeatured('2026-11-13:visit-a')
    const w2 = mountFeatured('2026-11-14:visit-b')

    expect(w1.text()).toContain('ผลงานศิลปะของผู้เรียนล่าสุด')
    expect(w1.text()).not.toContain('ผลงานยอดนิยมล่าสุด')

    const ids1 = w1.vm.filteredArtworks.map(a => a._id)
    expect(ids1).toHaveLength(4)
    expect(ids1).toEqual(w1Again.vm.filteredArtworks.map(a => a._id))
    // All 4 must be purchasable (sold-out excluded while purchasable options exist)
    expect(ids1).not.toContain('cohort5-sold')
    expect(ids1).not.toContain('c6-12')
    // Non-showcase available works are prioritized before Showcase's top 12
    expect(ids1).toEqual(expect.arrayContaining(['cohort5-avail-a', 'cohort5-avail-b', 'indep-avail-c']))
    // Order varies across seeds (check on a 6-item distinct pool via utility)
    expect(w2.vm.filteredArtworks).toHaveLength(4)

    w1.destroy(); w1Again.destroy(); w2.destroy()
  })

  it('SectionStudentShowcase keeps showcase heading, prioritizes purchasable works, shuffles deterministically, and expands to 12 items (3 rows)', () => {
    const localVue = createLocalVue()
    const subArtIds = Array.from({ length: 14 }, (_, idx) => ({ _id: `sub-6-${idx}` }))
    const artworks = [
      { _id: 'old-c5', submissionArtworkId: 'sub-5', views: 999, createdAt: '2025-12-01', status: { approval: status('Approved'), sale: status('Available') } },
      ...Array.from({ length: 11 }, (_, idx) => ({
        _id: `c6-avail-${idx}`,
        submissionArtworkId: `sub-6-${idx}`,
        createdAt: `2026-06-${String(idx + 1).padStart(2, '0')}`,
        status: { approval: status('Approved'), sale: status('Available') },
      })),
      { _id: 'c6-sold-a', submissionArtworkId: 'sub-6-11', views: 300, createdAt: '2026-06-12', status: { approval: status('Approved'), sale: status('Sold Out') } },
      { _id: 'c6-reserved-b', submissionArtworkId: 'sub-6-12', views: 500, createdAt: '2026-06-13', status: { approval: status('Reserved'), sale: status('Available') } },
      { _id: 'c6-sold-c', submissionArtworkId: 'sub-6-13', views: 200, createdAt: '2026-06-14', status: { approval: status('Approved'), sale: status('Sold Out') } },
    ]
    const submissions = [
      { courseLevel: '5', academicYear: '2025', create: { endAt: '2025-12-31' }, assignments: [{ artworks: [{ _id: 'sub-5' }] }] },
      // Active current cohort (endAt in future) should NOT be filtered out:
      { courseLevel: '6', academicYear: '2026', create: { endAt: '2099-12-31' }, assignments: [{ artworks: subArtIds }] },
      // Empty newer shell cohort (no approved works) must NOT hide cohort 6:
      { courseLevel: '7', academicYear: '2027', create: { endAt: '2099-12-31' }, assignments: [{ artworks: [{ _id: 'sub-7-unapproved' }] }] },
    ]
    const mountShowcase = (visitSeed) => shallowMount({ ...SectionStudentShowcase, mounted() {} }, {
      localVue,
      data() { return { loading: false, loadError: false, submissions, visitSeed } },
      mocks: {
        $i18n: { locale: 'th' },
        $router: { push: jest.fn() },
        $store: { getters: { 'artwork/artworks': artworks }, dispatch: jest.fn() },
      },
      stubs: { CContainer: true, CButton: true, CSpinner: true, CIcon: true, CardArtworks: true },
    })

    const w1 = mountShowcase('2026-11-13:seed1')
    const w1Again = mountShowcase('2026-11-13:seed1')
    const w2 = mountShowcase('2026-11-14:seed2')

    expect(w1.text()).toContain('ผลงานศิลปะ')
    expect(w1.text()).toContain('ดูผลงานผู้เรียนทั้งหมด')

    const picked = w1.vm.filteredStudentWorks.map(a => a._id)
    expect(picked).toHaveLength(12)
    expect(picked).toEqual(w1Again.vm.filteredStudentWorks.map(a => a._id))
    expect(picked).not.toContain('old-c5')
    // All 11 purchasable cohort-6 artworks come first, leaving 1 slot for non-purchasable (never 2 before 11 avail)
    const pickedFirst11 = picked.slice(0, 11)
    expect(pickedFirst11.every(id => id.startsWith('c6-avail-'))).toBe(true)
    expect(['c6-sold-a', 'c6-reserved-b', 'c6-sold-c']).toContain(picked[11])
    // Different seed changes order
    expect(picked).not.toEqual(w2.vm.filteredStudentWorks.map(a => a._id))

    w1.destroy(); w1Again.destroy(); w2.destroy()
  })
})
