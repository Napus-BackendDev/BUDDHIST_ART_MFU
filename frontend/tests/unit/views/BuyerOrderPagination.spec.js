import { mount, createLocalVue } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Orders from '@/views/User/order.vue'

test('all seven orders are reachable and searching from page two resets to page one', async () => {
  const localVue = createLocalVue(); localVue.use(Coreui)
  const orders = Array.from({ length: 7 }, (_, i) => ({ _id: 'qa-order-' + i, orderNumber: 'ORD-QA-PAGE-' + (i + 1),
    user: 'qa-buyer', artwork: [], image: '', createdAt: `2026-10-0${i + 1}T00:00:00Z`,
    status: { code: 'CANCELLED', title: [{ key: 'en', value: 'Cancelled' }] } }))
  const wrapper = mount({ ...Orders, created() {} }, { localVue,
    computed: { allOrders: () => orders, userId: () => 'qa-buyer' },
    mocks: { $i18n: { locale: 'en' }, $store: { getters: {} } }, stubs: { CIcon: true, OrderModal: true } })
  expect(wrapper.findAll('tbody tr').length).toBe(5)
  expect(wrapper.find('.pagination-footer').text()).toContain('Showing 1 to 5 of 7 orders')
  const pageTwo = wrapper.findAll('.pagination a').wrappers.find(a => a.text() === '2')
  expect(pageTwo).toBeTruthy()
  await pageTwo.trigger('click')
  expect(wrapper.findAll('tbody tr').length).toBe(2)
  expect(wrapper.find('tbody').text()).toContain('ORD-QA-PAGE-1')
  expect(wrapper.find('.pagination-footer').text()).toContain('Showing 6 to 7 of 7 orders')
  await wrapper.find('input[type="text"]').setValue('ORD-QA-PAGE-7')
  expect(wrapper.vm.activePage).toBe(1)
  expect(wrapper.findAll('tbody tr').length).toBe(1)
  expect(wrapper.find('tbody').text()).toContain('ORD-QA-PAGE-7')
  await wrapper.find('input[type="text"]').setValue('NO-MATCH-QA')
  expect(wrapper.find('.pagination-footer').text()).toContain('Showing 0 orders')
  wrapper.destroy()
})

test.each(['th', 'en'])('empty order history uses the selected language (%s)', locale => {
  const localVue = createLocalVue(); localVue.use(Coreui)
  const wrapper = mount({ ...Orders, created() {} }, { localVue,
    computed: { allOrders: () => [], userId: () => 'qa-buyer' },
    mocks: { $i18n: { locale }, $store: { getters: {} } }, stubs: { CIcon: true, OrderModal: true } })
  try {
    expect(wrapper.find('tbody').text()).toContain(locale === 'en' ? 'No orders found' : 'ไม่พบคำสั่งซื้อ')
    expect(wrapper.find('tbody').text()).not.toContain('No items')
  } finally { wrapper.destroy() }
})
