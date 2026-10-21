import { shallowMount } from '@vue/test-utils'
import News from '@/views/page/News.vue'

test('an unmatched search keeps its controls visible and can be cleared', async () => {
  const wrapper = shallowMount(News, {
    methods: { fetchNews: jest.fn(), getName: (lang, field) => field.find(item => item.key === lang)?.value || '' },
    mocks: { $i18n: { locale: 'th' }, $store: { getters: { 'news/news': [
      { _id: 'qa-news', title: [{ key: 'th', value: 'QA ข่าวทดสอบ' }], description: [] }
    ] } } },
    stubs: ['CContainer', 'CRow', 'CCol', 'CSpinner', 'CIcon', 'SectionHeaderNews', 'CardNew']
  })
  await wrapper.setData({ searchQuery: 'no match' })
  expect(wrapper.text()).toContain('ไม่พบข้อมูลข่าวสาร')
  expect(wrapper.find('.sidebar-search-input').exists()).toBe(true)
  await wrapper.find('.btn-clear-search-box').trigger('click')
  expect(wrapper.vm.searchQuery).toBe('')
  expect(wrapper.find('cardnew-stub').exists()).toBe(true)
  wrapper.destroy()
})


test('news toolbar controls have accessible names that follow the selected language', async () => {
  const Vue = require('vue')
  const locale = Vue.observable({ locale: 'th' })
  const wrapper = shallowMount(News, {
    methods: { fetchNews: jest.fn() },
    mocks: { $i18n: locale, $store: { getters: { 'news/news': [] } } },
    stubs: ['CContainer', 'CRow', 'CCol', 'CSpinner', 'CIcon', 'SectionHeaderNews', 'CardNew']
  })
  try {
    await wrapper.setData({ searchQuery: 'QA' })
    for (const [lang, names] of [
      ['th', ['ค้นหาข่าวสาร', 'ล้างคำค้นหา', 'ค้นหา', 'จำนวนข่าวต่อหน้า', 'เรียงลำดับข่าว']],
      ['en', ['Search news', 'Clear search', 'Search', 'News per page', 'Sort news']]
    ]) {
      locale.locale = lang
      await wrapper.vm.$nextTick()
      const controls = wrapper.findAll('.news-toolbar input, .news-toolbar button, .news-toolbar select')
      expect(controls.wrappers.map(control => control.attributes('aria-label'))).toEqual(names)
      expect(wrapper.find('.btn-clear-search-box').attributes('title')).toBe(names[1])
      expect(wrapper.find('.sidebar-search-btn').attributes('title')).toBe(names[2])
    }
    await wrapper.find('.btn-clear-search-box').trigger('click')
    expect(wrapper.vm.searchQuery).toBe('')
  } finally { wrapper.destroy() }
})


test('news cards use the selected calendar language while retaining the home date format', () => {
  const CardNew = require('@/components/CardNew.vue').default
  const news = { createdAt: '2026-10-16T09:00:00+07:00' }
  const vm = { isHome: false, $i18n: { locale: 'en' } }
  expect(CardNew.methods.getNewsDate.call(vm, news)).toBe('16 Oct 2026')
  vm.$i18n.locale = 'th'
  expect(CardNew.methods.getNewsDate.call(vm, news)).toContain('2569')
  vm.isHome = true
  expect(CardNew.methods.getNewsDate.call(vm, news)).toBe('16/10/2026')
})
