import Overview from '@/views/Admin/Overview.vue'
import {createLocalVue, mount} from '@vue/test-utils'
import CoreuiVue from '@coreui/vue'

const context = dispatch => ({
  ...Overview.methods, loading: false, loadingItems: [], statusError: '', showRejectModal: true,
  rejectRemark: 'QA rejection reason', selectedOrder: {_id: 'qa-order'},
  $i18n: {locale: 'en'}, fetchOrders: jest.fn(() => Promise.resolve()),
  $store: {dispatch, commit: jest.fn(), getters: {'setting/status/item': [
    {_id: 'right', code: 'REJECTED', title: [{key: 'en', value: 'Renamed rejected status'}]},
    {_id: 'wrong', code: 'CUSTOM', title: [{key: 'en', value: 'Rejected'}]}
  ]}}
})

test('order rejection uses the status code even after a display name changes', async () => {
  const vm = context(jest.fn(() => Promise.resolve()))
  await vm.confirmReject()
  expect(vm.$store.dispatch).toHaveBeenCalledWith('order/update', {_id: 'qa-order', status: 'right', remark: 'QA rejection reason'})
  expect(vm.showRejectModal).toBe(false)
})

test('failed order rejection preserves the open dialog and reason for retry', async () => {
  const dispatch = jest.fn(type => type === 'order/update' ? Promise.reject(new Error('Network Error')) : Promise.resolve())
  const vm = context(dispatch)
  const silence = jest.spyOn(console, 'error').mockImplementation(() => {})
  try {
    await vm.confirmReject()
    expect(vm.showRejectModal).toBe(true)
    expect(vm.rejectRemark).toBe('QA rejection reason')
    expect(vm.statusError).toBeTruthy()
    expect(vm.loading).toBe(false)
    expect(vm.loadingItems).toEqual([])
    dispatch.mockImplementation(() => Promise.resolve())
    await vm.confirmReject()
    expect(vm.showRejectModal).toBe(false)
    expect(vm.statusError).toBe('')
  } finally {silence.mockRestore()}
})

test('shows the localized server error instead of rendering its message array', async () => {
  const vm = context(jest.fn(type => type === 'order/update' ? Promise.reject({response: {data: {message: [
    {key: 'th', value: 'คำขอล้มเหลว'}, {key: 'en', value: 'Request failed'}
  ]}}}) : Promise.resolve()))
  vm.$i18n.locale = 'th'
  const silence = jest.spyOn(console, 'error').mockImplementation(() => {})
  try {
    await vm.confirmReject()
    expect(vm.statusError).toBe('คำขอล้มเหลว')
    expect(vm.showRejectModal).toBe(true)
  } finally {silence.mockRestore()}
})

test.each(['th', 'en'])('rejection reason has a connected translated label in %s', async locale => {
  const localVue = createLocalVue()
  localVue.use(CoreuiVue)
  const wrapper = mount(Overview, {localVue, mocks: {$i18n: {locale}, $store: {dispatch: jest.fn(() => Promise.resolve()), getters: {'order/orders': []}}},
    stubs: {HeaderHero: true, WidgetsDashboard: true, LineCharts: true, PendingApproval: true, OrderTable: true,
      OrderViewModal: true, OrderEditModal: true, CModal: {template: '<div><slot/><slot name="footer"/></div>'}}})
  await wrapper.setData({showRejectModal: true})
  expect(wrapper.find('textarea').element.labels[0].textContent.trim()).toBe(locale === 'en' ? 'Rejection reason' : 'เหตุผลที่ปฏิเสธ')
  wrapper.destroy()
})
