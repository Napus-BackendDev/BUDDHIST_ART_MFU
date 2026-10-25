import {createLocalVue, shallowMount} from '@vue/test-utils'
import NewsDetail from '@/views/page/NewsDetail.vue'
import i18nMixin from '@/mixins/i18nMixin'

const localVue = createLocalVue()
localVue.mixin(i18nMixin)

const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const article = {_id: 'qa-news', title: [{key: 'en', value: 'QA News'}, {key: 'th', value: 'ข่าว QA'}], description: [], images: []}
const mountPage = (dispatch, locale = 'en', route = {params: {id: 'qa-news'}, query: {}}) => shallowMount(NewsDetail, {
  localVue,
  mocks: {$i18n: {locale}, $store: {dispatch, getters: {}, commit: jest.fn()}, $route: route, $router: {push: jest.fn()}},
  stubs: {CContainer: {template: '<main><slot/></main>'}, CRow: {template: '<div><slot/></div>'}, CCol: {template: '<div><slot/></div>'},
    CButton: {template: '<button @click="$emit(\'click\')"><slot/></button>'}, CSpinner: true, CIcon: true}
})

test.each(['th', 'en'])('missing/deleted news has a recovery link in %s', async locale => {
  const dispatch = jest.fn(() => Promise.resolve([]))
  const w = mountPage(dispatch, locale)
  await flush()
  expect(w.find('h1').text()).toBe(locale === 'en' ? 'News not found' : 'ไม่พบข่าวสาร')
  expect(dispatch).not.toHaveBeenCalledWith('news/updateView', 'qa-news')
  await w.find('button').trigger('click')
  expect(w.vm.$router.push).toHaveBeenCalledWith('/news')
  w.destroy()
})

test.each(['th', 'en'])('load error can retry without leaving the page in %s', async locale => {
  let failed = true
  const dispatch = jest.fn(type => type === 'news/get' ? (failed ? Promise.reject(new Error('offline')) : Promise.resolve([article])) : Promise.resolve())
  const silence = jest.spyOn(console, 'error').mockImplementation(() => {})
  const w = mountPage(dispatch, locale)
  try {
    await flush()
    expect(w.find('[role="alert"]').exists()).toBe(true)
    failed = false
    await w.find('[role="alert"] button').trigger('click')
    await flush()
    expect(w.find('h1').text()).toBe(locale === 'en' ? 'QA News' : 'ข่าว QA')
    expect(w.find('[role="alert"]').exists()).toBe(false)
  } finally {w.destroy(); silence.mockRestore()}
})

test('view counter failure does not hide a successfully loaded article', async () => {
  const dispatch = jest.fn(type => type === 'news/get' ? Promise.resolve([article]) : Promise.reject(new Error('view counter unavailable')))
  const silence = jest.spyOn(console, 'error').mockImplementation(() => {})
  const w = mountPage(dispatch)
  try {await flush(); expect(w.find('h1').text()).toBe('QA News')}
  finally {w.destroy(); silence.mockRestore()}
})

test('an older request cannot overwrite the current article after route navigation', async () => {
  let resolveOld
  let calls = 0
  const dispatch = jest.fn(type => type !== 'news/get' ? Promise.resolve() : ++calls === 1 ? new Promise(resolve => {resolveOld = resolve}) : Promise.resolve([article]))
  const route = {params: {id: 'old-news'}, query: {}}
  const w = mountPage(dispatch, 'en', route)
  route.params.id = 'qa-news'
  await w.vm.fetchNewsDetail()
  resolveOld([{...article, _id: 'old-news', title: [{key: 'en', value: 'Old news'}]}])
  await flush()
  expect(w.vm.currentNews._id).toBe('qa-news')
  w.destroy()
})

test('invalid cached preview data leaves a recoverable error instead of a permanent spinner', async () => {
  localStorage.setItem('news_preview_data', '{invalid-json')
  const w = mountPage(jest.fn(), 'en', {params: {id: 'preview'}, query: {preview: 'true'}})
  try {
    await flush()
    expect(w.vm.loading).toBe(false)
    expect(w.find('[role="alert"]').exists()).toBe(true)
  } finally {w.destroy(); localStorage.removeItem('news_preview_data')}
})

test('shows the incremented view count returned by the view request', async () => {
  const dispatch = jest.fn(type => type === 'news/get' ? Promise.resolve([{...article, views: 4}]) : Promise.resolve({data: {data: {...article, views: 5}}}))
  const w = mountPage(dispatch)
  await flush(); await flush()
  expect(w.text()).toContain('5 Views')
  w.destroy()
})
