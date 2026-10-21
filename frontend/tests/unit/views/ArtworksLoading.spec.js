import { shallowMount } from '@vue/test-utils'
import Artworks from '@/views/page/Artworks.vue'

function context(dispatch) {
  const vm = { ...Artworks.data(), $i18n: { locale: 'th' }, $store: { dispatch }, $route: { query: {} } }
  vm.handleLoadError = Artworks.methods.handleLoadError.bind(vm)
  return vm
}
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks() })

test('API rejection shows an error rather than the empty-gallery state', async () => {
  const vm = context(jest.fn().mockRejectedValue({ response: { status: 403 } }))
  await Artworks.methods.fetchInitialData.call(vm)
  expect(vm.loading).toBe(false)
  expect(vm.loadError).toBeTruthy()
  const wrapper = shallowMount(Artworks, {
    methods: { fetchInitialData: jest.fn(), checkMobileCollapse: jest.fn() },
    mocks: { $i18n: { locale: 'th' }, $route: { query: {} }, $store: { getters: {}, dispatch: jest.fn() } },
    stubs: ['CContainer', 'SectionHeaderArtworks', 'CIcon', 'ArtworkCard']
  })
  await wrapper.setData({ loadError: vm.loadError })
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  expect(wrapper.find('.no-results-box').exists()).toBe(false)
  wrapper.destroy()
})
test('429 pauses polling and manual retry until Retry-After has expired', async () => {
  jest.useFakeTimers('modern')
  let now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)
  const dispatch = jest.fn().mockRejectedValue({ response: { status: 429, headers: { 'retry-after': '30' } } })
  const vm = context(dispatch)
  await Artworks.methods.fetchInitialData.call(vm)
  await Artworks.methods.refreshArtworks.call(vm)
  await Artworks.methods.fetchInitialData.call(vm)
  expect(dispatch).toHaveBeenCalledTimes(1)
  now += 30000
  jest.advanceTimersByTime(30000)
  dispatch.mockResolvedValue([])
  await Artworks.methods.fetchInitialData.call(vm)
  expect(vm.loadError).toBe('')
  expect(dispatch).toHaveBeenCalledTimes(4)
})
test('successful empty results remain an ordinary empty gallery', async () => {
  const vm = context(jest.fn().mockResolvedValue([]))
  await Artworks.methods.fetchInitialData.call(vm)
  expect(vm.loadError).toBe('')
  expect(vm.categories).toEqual([])
})

test.each([500,429])('existing %s error follows locale changes without another API call',status=>{
 const vm=context(jest.fn())
 Artworks.methods.handleLoadError.call(vm,{response:{status,headers:{'retry-after':'1'}}})
 try{
  vm.$i18n.locale='en'
  expect(Artworks.computed.loadErrorMessage.call(vm)).toContain(status===429?'Too many requests':'The server could not load')
  vm.$i18n.locale='th'
  expect(Artworks.computed.loadErrorMessage.call(vm)).toContain(status===429?'มีคำขอถี่เกินกำหนด':'ระบบไม่สามารถโหลดข้อมูล')
  expect(vm.$store.dispatch).not.toHaveBeenCalled()
 }finally{clearTimeout(vm.retryTimer)}
})

test.each(['th','en'])('gallery sort has a localized accessible name (%s)',locale=>{
 const w=shallowMount(Artworks,{methods:{fetchInitialData:jest.fn(),checkMobileCollapse:jest.fn()},mocks:{$i18n:{locale},$route:{query:{}},$store:{getters:{},dispatch:jest.fn()}},stubs:['CContainer','SectionHeaderArtworks','CIcon','ArtworkCard']})
 try{expect(w.find('select.custom-sort-select').attributes('aria-label')).toBe(locale==='en'?'Sort artworks':'เรียงลำดับผลงาน')}
 finally{w.destroy()}
})
