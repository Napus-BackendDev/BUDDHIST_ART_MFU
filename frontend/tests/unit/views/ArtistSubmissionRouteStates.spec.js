import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import List from '@/views/Artist/Submissions.vue'
import Detail from '@/views/Artist/SubmissionsDetail.vue'
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const mountPage = (component, dispatch, locale = Vue.observable({ locale: 'th' }), options = {}) => shallowMount(component, {
  mocks: { $i18n: locale, $route: { name: component === Detail ? 'ArtistSubmissionsDetail' : 'ArtistSubmissions', params: { id: 'qa-missing' } },
    $router: { push: jest.fn() }, $store: { dispatch, getters: { 'auth/userId': 'qa-artist', 'submission/submissions': [] } } },
  stubs: ['CIcon', 'CButton', 'SubmissionModal', 'ArtworkViewModal', 'SubmissionEditModal'], ...options
})

test('missing detail has a visible message and a back action instead of a blank page', async () => {
  const w = mountPage(Detail, jest.fn().mockResolvedValue([]))
  try {
    await flush()
    expect(w.text()).toContain('ไม่พบรายการส่งงาน')
    await w.find('button').trigger('click')
    expect(w.vm.$router.push).toHaveBeenCalledWith({ name: 'ArtistSubmissions' })
  } finally { w.destroy() }
})

test.each([List, Detail])('%s load failure is distinct from empty and can retry in the selected language', async component => {
  const locale = Vue.observable({ locale: 'th' })
  const dispatch = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([])
  const w = mountPage(component, dispatch, locale)
  try {
    await flush()
    expect(w.find('[role="alert"]').text()).toContain('โหลดรายการส่งงานไม่สำเร็จ')
    locale.locale = 'en'; await w.vm.$nextTick()
    expect(w.find('[role="alert"]').text()).toContain('Unable to load submissions')
    await w.find('[role="alert"] button').trigger('click'); await flush()
    expect(w.find('[role="alert"]').exists()).toBe(false)
    expect(dispatch).toHaveBeenCalledTimes(2)
  } finally { w.destroy() }
})


afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks() })

test.each([List, Detail])('%s respects the rate-limit cooldown instead of polling or retrying early', async component => {
  jest.useFakeTimers('modern')
  let now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)
  const dispatch = jest.fn().mockRejectedValueOnce({ response: { status: 429, headers: { 'retry-after': '30' } } }).mockResolvedValue([])
  const w = mountPage(component, dispatch, Vue.observable({ locale: 'en' }))
  try {
    await Promise.resolve(); await Promise.resolve(); await w.vm.$nextTick()
    expect(w.find('[role="alert"]').text()).toContain('Too many requests')
    const retry = component === List ? 'fetchSubmissions' : 'fetchSubmission'
    await w.vm[retry]()
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(w.find('[role="alert"] button').attributes('disabled')).toBeDefined()
    now += 30000; jest.advanceTimersByTime(30000); await w.vm.$nextTick()
    expect(w.find('[role="alert"] button').attributes('disabled')).toBeUndefined()
    await w.vm[retry](); await w.vm.$nextTick()
    expect(dispatch).toHaveBeenCalledTimes(2)
  } finally { w.destroy() }
})

test('a background detail refresh failure keeps the existing submission form mounted', async () => {
  const dispatch = jest.fn().mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('offline'))
  const portal = { _id: 'qa-missing', title: [{ key: 'en', value: 'QA Portal' }], assignments: [] }
  const w = mountPage(Detail, dispatch, Vue.observable({ locale: 'th' }), { computed: { submission: () => portal } })
  try {
    await flush()
    await w.setData({ showSubmissionModal: true })
    const form = w.find('submissionmodal-stub').element
    await w.vm.fetchSubmission(); await w.vm.$nextTick()
    expect(w.find('[role="alert"]').exists()).toBe(true)
    expect(w.find('submissionmodal-stub').element).toBe(form)
    expect(w.vm.showSubmissionModal).toBe(true)
  } finally { w.destroy() }
})

test.each(['th', 'en'])('an unenrolled artist can view a portal but cannot open or submit its form (%s)', async language => {
  const dispatch = jest.fn().mockResolvedValue([])
  const portal = { _id: 'qa-missing', artist: [{ _id: 'qa-other' }], title: [{ key: 'en', value: 'QA Portal' }], assignments: [{ _id: 'qa-round', title: [{ key: 'en', value: 'QA Round' }], create: { startAt: '2020-01-01', endAt: '2099-01-01' }, artworks: [] }] }
  const w = mountPage(Detail, dispatch, Vue.observable({ locale: language }), { computed: { submission: () => portal } })
  try {
    await flush()
    expect(w.text()).toContain(language === 'en' ? 'You are not registered for this submission.' : 'คุณยังไม่ได้ลงทะเบียนในรายการส่งงานนี้')
    expect(w.findAll('cbutton-stub').length).toBe(0)
    w.vm.handleOpenSubmission(portal.assignments[0])
    expect(w.vm.showSubmissionModal).toBe(false)
    await w.setData({ selectedAssignment: portal.assignments[0] })
    dispatch.mockClear()
    await w.vm.handleWorkSubmit({ title: [] })
    expect(dispatch).not.toHaveBeenCalled()
    expect(w.vm.submitting).toBe(false)
  } finally { w.destroy() }
})

test.each(['qa-artist', { _id: 'qa-artist' }])('a registered artist retains the submit action with participant %p', async participant => {
  const portal = { _id: 'qa-missing', artist: [participant], assignments: [] }
  const w = mountPage(Detail, jest.fn().mockResolvedValue([]), Vue.observable({ locale: 'en' }), { computed: { submission: () => portal } })
  try {
    await flush()
    w.vm.handleOpenSubmission({ _id: 'qa-round', isAssigned: true })
    expect(w.vm.showSubmissionModal).toBe(true)
    expect(w.text()).not.toContain('You are not registered')
  } finally { w.destroy() }
})

test.each(['th','en'])('portal enrollment does not expose submission controls for an unassigned round (%s)', async language => {
 const round = {_id:'qa-round',isAssigned:false,title:[{key:'en',value:'Restricted round'}],create:{startAt:'2020-01-01',endAt:'2099-01-01'},artworks:[]}
 const portal = {_id:'qa-missing',artist:['qa-artist'],assignments:[round]}
 const dispatch = jest.fn().mockResolvedValue([])
 const w = mountPage(Detail,dispatch,Vue.observable({locale:language}),{computed:{submission:()=>portal}})
 try {
  await flush()
  expect(w.findAll('cbutton-stub').length).toBe(0)
  expect(w.text()).toContain(language==='en'?'This assignment is not assigned to your account.':'ใบงานนี้ไม่ได้มอบหมายให้บัญชีของคุณ')
  w.vm.handleOpenSubmission(round)
  expect(w.vm.showSubmissionModal).toBe(false)
  w.vm.handleResubmit(round,{_id:'qa-work'})
  expect(w.vm.showEditModal).toBe(false)
  await w.setData({selectedAssignment:round});dispatch.mockClear()
  await w.vm.handleWorkSubmit({title:[]})
  expect(dispatch).not.toHaveBeenCalled()
 } finally {w.destroy()}
})
