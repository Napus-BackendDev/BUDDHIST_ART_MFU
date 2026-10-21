import Table from '@/views/Admin/components/table/NewsTable.vue'
import i18nMixin from '@/mixins/i18nMixin'

test.each([
  ['start', new Date('2026-10-16T00:00:00'), null, ['start', 'late', 'legacy', 'after']],
  ['end', null, new Date('2026-10-16T00:00:00'), ['before', 'start', 'late', 'legacy']],
  ['whole day', new Date('2026-10-16T00:00:00'), new Date('2026-10-16T00:00:00'), ['start', 'late', 'legacy']]
])('news date filter uses stored publication time including %s boundary', (_, startDate, endDate, expected) => {
  const news = (id, date) => ({ _id: id, title: id, create: { datetime: date } })
  const items = [news('before', '2026-10-15T23:59:59'), news('start', '2026-10-16T00:00:00'), news('late', '2026-10-16T23:59:59.999'), news('after', '2026-10-17T00:00:00'), { _id: 'legacy', title: 'Legacy', createdAt: '2026-10-16T12:00:00' }, { _id: 'missing', title: 'Missing' }]
  const vm = { items, filters: { search: '', startDate, endDate }, getName: i18nMixin.methods.getName }
  expect(Table.computed.filteredItems.call(vm).map(x => x._id).sort()).toEqual(expected.sort())
})
