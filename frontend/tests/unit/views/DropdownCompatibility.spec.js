import { createLocalVue, mount } from '@vue/test-utils'
import CoreuiVue from '@coreui/vue-pro'
import OrderFilter from '@/views/Admin/components/filter/OrderFilter.vue'
import SubmissionDetailFilter from '@/views/Admin/components/submission_detail/SubmissionDetailFilter.vue'

let consoleError
beforeEach(() => { consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}) })
afterEach(() => { consoleError.mockRestore() })

test.each(['th', 'en'])('order status dropdown renders and closes after selection (%s)', async locale => {
  const localVue = createLocalVue()
  localVue.use(CoreuiVue)
  const wrapper = mount(OrderFilter, {
    localVue,
    propsData: { value: { search: '', status: 'All Status', quickRange: 'All Time' } },
    mocks: { $i18n: { locale } },
    stubs: { CIcon: true }
  })
  await wrapper.find('.filter-select-btn').trigger('click')
  expect(wrapper.find('.dropdown-menu').classes()).toContain('show')
  await wrapper.findAll('.dropdown-item').at(1).trigger('click')
  expect(wrapper.emitted('input')[0][0].status).toBe('Pending')
  expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show')
  expect(consoleError.mock.calls.filter(args => String(args[0]).includes('Unknown custom element'))).toEqual([])
  wrapper.destroy()
})

test.each(['th', 'en'])('assignment status retains internal values and translates selection (%s)', async locale => {
  const localVue = createLocalVue()
  localVue.use(CoreuiVue)
  const wrapper = mount(SubmissionDetailFilter, {
    localVue,
    propsData: { value: { search: '', status: 'All Status', quickRange: 'All Time' } },
    mocks: { $i18n: { locale } }, stubs: { CIcon: true }
  })
  const labels = locale === 'en' ? ['All Status', 'Not Open Yet', 'In Progress', 'Closed'] : ['สถานะทั้งหมด', 'ระบบยังไม่เปิด', 'กำลังดำเนินการ', 'ปิดแล้ว']
  for (const [index, status] of ['All Status', 'Not Open Yet', 'In Progress', 'Closed'].entries()) {
    await wrapper.setProps({ value: { status } })
    expect(wrapper.find('.dropdown-trigger-btn-small').text()).toBe(labels[index])
    await wrapper.find('.dropdown-trigger-btn-small').trigger('click')
    await wrapper.findAll('.dropdown-item').at(index).trigger('click')
    expect(wrapper.emitted('input').slice(-1)[0][0].status).toBe(status)
    expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show')
  }
  wrapper.destroy()
})
