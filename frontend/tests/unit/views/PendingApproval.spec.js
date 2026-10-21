import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import CoreuiVue from '@coreui/vue'
import PendingApproval from '@/views/Admin/components/PendingApproval.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(CoreuiVue)

test.each(['th', 'en'])('pending artwork actions have translated accessible names in %s', async locale => {
  const store = new Vuex.Store({modules: {dashboard: {namespaced: true, state: {stats: {pendingArtworks: [
    {_id: 'qa-artwork', title: [{key: 'th', value: 'งานทดสอบ'}, {key: 'en', value: 'Test Artwork'}]}
  ]}}}}})
  const router = {push: jest.fn()}
  const wrapper = shallowMount(PendingApproval, {localVue, store, mocks: {$i18n: {locale}, $router: router},
    directives: {'c-tooltip': () => {}},
    stubs: {CCard: {template: '<section><slot/></section>'}, CCardBody: {template: '<div><slot/></div>'},
      CCardHeader: {template: '<div><slot/></div>'}, CButton: {template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot/></button>'},
      'router-link': true}})
  const names = wrapper.findAll('button').wrappers.map(button => button.attributes('aria-label'))
  expect(names).toEqual(locale === 'en'
    ? ['View artwork: Test Artwork', 'Approve artwork: Test Artwork', 'Reject artwork: Test Artwork']
    : ['ดูผลงาน: งานทดสอบ', 'อนุมัติผลงาน: งานทดสอบ', 'ปฏิเสธผลงาน: งานทดสอบ'])
  wrapper.find('button').trigger('click')
  expect(router.push).toHaveBeenCalledWith({path: '/admin/artworks', query: {search: 'Test Artwork'}})
  await wrapper.setData({actionError: 'QA failure'})
  expect(wrapper.find('[role="alert"]').text()).toContain('QA failure')
  await wrapper.find('[role="alert"] button').trigger('click')
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  wrapper.destroy()
})


describe('pending status actions', () => {
  let confirmSpy
  let consoleSpy
  beforeEach(() => {
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {confirmSpy.mockRestore(); consoleSpy.mockRestore()})
  const artwork = {_id: 'qa-art', title: [{key: 'en', value: 'QA Artwork'}], status: {approval: 'pending', sale: 'available'}}
  const vmFor = (statuses, dispatch = jest.fn(() => Promise.resolve())) => ({
    ...PendingApproval.methods, actionError: '', $i18n: {locale: 'en'},
    $store: {getters: {'setting/status/item': statuses}, dispatch, commit: jest.fn()}
  })
  test.each([['handleApprove', 'APPROVED'], ['handleReject', 'REJECTED']])('%s uses immutable code after status rename', async (method, code) => {
    const vm = vmFor([{_id: 'right-status', code, title: [{key: 'en', value: 'Renamed workflow status'}]},
      {_id: 'wrong-status', code: 'CUSTOM', title: [{key: 'en', value: code === 'APPROVED' ? 'Approved' : 'Rejected'}]}])
    await vm[method](artwork)
    expect(vm.$store.dispatch).toHaveBeenCalledWith('artwork/update', {_id: 'qa-art', status: {approval: 'right-status', sale: 'available'}})
  })
  test.each([['handleApprove', 'Approved', 'approve'], ['handleReject', 'Rejected', 'reject']])('%s reports a visible retryable error', async (method, title, verb) => {
    const dispatch = jest.fn(() => Promise.reject(new Error('Network Error')))
    const vm = vmFor([{_id: 'status', title: [{key: 'en', value: title}]}], dispatch)
    await vm[method](artwork)
    expect(vm.actionError).toBe('Unable to ' + verb + ' artwork. Please try again.')
    expect(vm.$store.commit).toHaveBeenLastCalledWith('dialog/loading', false)
    expect(vm.$store.dispatch).not.toHaveBeenCalledWith('dashboard/getStats')
  })
  test.each(['handleApprove', 'handleReject'])('%s cancellation sends no request', async method => {
    confirmSpy.mockReturnValue(false)
    const vm = vmFor([])
    await vm[method](artwork)
    expect(vm.$store.dispatch).not.toHaveBeenCalled()
  })
})
