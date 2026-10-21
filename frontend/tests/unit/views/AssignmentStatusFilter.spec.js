import { shallowMount } from '@vue/test-utils'
import Table from '@/views/Admin/components/table/SubmissionDetailTable.vue'

test.each([
  [{ startDate: new Date('2026-10-17T00:00:00') }, ['later']],
  [{ endDate: new Date('2026-10-16T00:00:00') }, ['earlier']],
  [{ startDate: new Date('2026-10-16T00:00:00'), endDate: new Date('2026-10-17T00:00:00') }, ['later', 'earlier']]
])('filters assignment start dates with independent bounds %o', (dates, expected) => {
  const items = [
    { _id: 'earlier', create: { startAt: '2026-10-16T09:00:00', endAt: '2026-10-21T18:00:00' } },
    { _id: 'later', create: { startAt: '2026-10-17T09:00:00', endAt: '2026-10-21T18:00:00' } },
    { _id: 'missing' }, { _id: 'invalid', create: { startAt: 'invalid' } }
  ]
  const wrapper = shallowMount(Table, { propsData: { items, filters: { status: 'All Status', ...dates } }, mocks: { $i18n: { locale: 'th' } }, stubs: { CCard: true, CDataTable: true, TablePaginationFooter: true } })
  expect(wrapper.vm.filteredItems.map(item => item._id)).toEqual(expected)
  wrapper.destroy()
})

test('assignment filter matches displayed temporal status including future and unscheduled work', async () => {
  const now = Date.now()
  const item = (id, start, end) => ({ _id: id, title: [{ key: 'en', value: id }], create: { startAt: new Date(now + start).toISOString(), endAt: new Date(now + end).toISOString() } })
  const items = [item('open', -60000, 60000), item('future', 60000, 120000), item('closed', -120000, -60000), { _id: 'unscheduled' }]
  const wrapper = shallowMount(Table, { propsData: { items, filters: { status: 'All Status' } }, mocks: { $i18n: { locale: 'th' } }, stubs: { CCard: true, CDataTable: true, TablePaginationFooter: true } })
  for (const [status, expected] of [['In Progress', ['open']], ['Not Open Yet', ['future']], ['Closed', ['closed']], ['All Status', items.map(x => x._id)]]) {
    await wrapper.setProps({ filters: { status } })
    expect(wrapper.vm.filteredItems.map(x => x._id).sort()).toEqual(expected.sort())
  }
  wrapper.destroy()
})
