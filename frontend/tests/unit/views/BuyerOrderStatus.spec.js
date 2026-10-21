import { shallowMount } from '@vue/test-utils'
import Orders from '@/views/User/order.vue'
import OrderModal from '@/views/User/components/modal/OrderModal.vue'
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin'

const makeOrder = code => ({ _id: 'qa-order', orderNumber: 'ORD-QA-CANCEL', user: 'qa-buyer', artwork: [], image: '',
  createdAt: new Date().toISOString(), status: { code, title: [{ key: 'en', value: code[0] + code.slice(1).toLowerCase() }] } })
const Row = { props: ['items'], render(h) { return h('table', [h('tbody', [h('tr', this.$scopedSlots.action({ item: this.items[0] }))])]) } }

test('stable cancellation code wins over a renamed display title', () => {
  const order = makeOrder('CANCELLED'); order.status.title = [{ key: 'en', value: 'Previously reserved' }]
  const vm = { allOrders: [order], userId: 'qa-buyer', $i18n: { locale: 'en' },
    getName: statusBadgeMixin.methods.getName, calculateTimeLeft: () => '-' }
  expect(Orders.computed.processedOrders.call(vm)[0].statusName).toBe('Cancelled')
})

test.each([['en', 'CANCELLED', 'Cancelled'], ['th', 'CANCELLED', 'ยกเลิก'],
  ['en', 'REJECTED', 'Rejected'], ['th', 'REJECTED', 'ปฏิเสธ']])('buyer label %s %s is %s', (locale, code, label) => {
  const vm = { allOrders: [makeOrder(code)], userId: 'qa-buyer', $i18n: { locale },
    getName: statusBadgeMixin.methods.getName, calculateTimeLeft: () => '-' }
  expect(Orders.computed.processedOrders.call(vm)[0].statusName).toBe(label)
})

test.each([['en', 'Order cancelled'], ['th', 'คำสั่งซื้อถูกยกเลิก']])('cancelled detail includes the reason and correct %s heading', (locale, heading) => {
  const order = { ...makeOrder('CANCELLED'), remark: 'QA timeout reason', contact: {}, address: {} }
  const wrapper = shallowMount(OrderModal, { propsData: { show: true, order }, mocks: { $i18n: { locale } },
    stubs: { CModal: { template: '<div><slot/></div>' }, CIcon: true } })
  expect(wrapper.find('[role="status"]').text()).toContain(heading)
  expect(wrapper.find('[role="status"]').text()).toContain('QA timeout reason')
  expect(wrapper.vm.isRejected).toBe(false)
  expect(wrapper.vm.isApproved).toBe(false)
  wrapper.destroy()
})

test.each(['en', 'th'].flatMap(locale => ['PENDING', 'APPROVED'].map(code => [locale, code])))('%s %s retains named document controls and certificate eligibility', (locale, code) => {
  const order = { ...makeOrder(code), image: 'qa-slip.png' }
  const wrapper = shallowMount({ ...Orders, created() {} }, {
    computed: { allOrders: () => [order], userId: () => 'qa-buyer' },
    mocks: { $i18n: { locale }, $store: { getters: {} } }, directives: { 'c-tooltip': () => {} },
    stubs: { CDataTable: Row, CCard: { template: '<div><slot/></div>' }, CCardBody: { template: '<div><slot/></div>' }, CIcon: true, OrderModal: true }
  })
  expect(wrapper.findAll('button.action-btn-doc').length).toBe(3)
  for (const button of wrapper.findAll('button.action-btn-doc').wrappers) expect(button.attributes('aria-label')).toBeTruthy()
  expect(wrapper.find('.icon-cert').element.disabled).toBe(code !== 'APPROVED')
  wrapper.destroy()
})

test.each(['en', 'th'].flatMap(locale => ['CANCELLED', 'REJECTED'].map(code => [locale, code])))('%s %s exposes only the named detail action', (locale, code) => {
  const wrapper = shallowMount({ ...Orders, created() {} }, {
    computed: { allOrders: () => [makeOrder(code)], userId: () => 'qa-buyer' },
    mocks: { $i18n: { locale }, $store: { getters: {} } }, directives: { 'c-tooltip': () => {} },
    stubs: { CDataTable: Row, CCard: { template: '<div><slot/></div>' }, CCardBody: { template: '<div><slot/></div>' }, CIcon: true, OrderModal: true }
  })
  expect(wrapper.findAll('button.action-btn').length).toBe(1)
  expect(wrapper.find('.icon-view').attributes('aria-label')).toBe(locale === 'en' ? 'View Details' : 'ดูรายละเอียด')
  expect(wrapper.find('.btn-quick-pay').exists()).toBe(false)
  expect(wrapper.find('.action-btn-doc').exists()).toBe(false)
  wrapper.destroy()
})

test.each([['en', 25, false], ['th', 25, false], ['en', 23, true]])('%s unpaid reservation aged %sh payment action is %s', (locale, hours, allowed) => {
  const order = { ...makeOrder('RESERVED'), createdAt: new Date(Date.now() - hours * 3600000).toISOString() }
  const wrapper = shallowMount({ ...Orders, created() {} }, {
    computed: { allOrders: () => [order], userId: () => 'qa-buyer' },
    mocks: { $i18n: { locale }, $store: { getters: {} } }, directives: { 'c-tooltip': () => {} },
    stubs: { CDataTable: Row, CCard: { template: '<div><slot/></div>' }, CCardBody: { template: '<div><slot/></div>' }, CIcon: true, OrderModal: true }
  })
  expect(wrapper.find('.btn-quick-pay').exists()).toBe(allowed)
  expect(wrapper.find('.action-btn-doc').exists()).toBe(false)
  wrapper.destroy()
})

test.each(['en', 'th'])('%s file selected after the deadline is cleared before upload', async locale => {
  const vm = { selectedOrder: { ...makeOrder('RESERVED'), createdAt: new Date(Date.now() - 25 * 3600000).toISOString() },
    $i18n: { locale }, $store: { commit: jest.fn(), dispatch: jest.fn() }, getName: statusBadgeMixin.methods.getName }
  vm.canUploadSlip = order => Orders.methods.canUploadSlip.call(vm, order)
  const event = { target: { files: [new Blob(['QA slip'], { type: 'image/png' })], value: 'qa-slip.png' } }
  await Orders.methods.handleOrderSlipUpload.call(vm, event)
  expect(vm.$store.dispatch).not.toHaveBeenCalled()
  expect(vm.$store.commit).toHaveBeenCalledWith('dialog/showToast', expect.objectContaining({ variant: 'warning' }))
  expect(event.target.value).toBe('')
  expect(vm.selectedOrder).toBeNull()
})
