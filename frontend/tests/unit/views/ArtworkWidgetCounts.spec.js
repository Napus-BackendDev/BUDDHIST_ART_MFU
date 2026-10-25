import Widget from '@/views/Admin/components/widget/ArtworkWidget.vue'

const item = value => ({ status: { approval: { title: [{ key: 'en', value }] } } })

test('reserved artworks count as approved, not as awaiting review', () => {
  const vm = { items: [item('Approved'), item('Reserved'), item('Pending'), item('Rejected')], getStatusLabel: Widget.methods.getStatusLabel }
  const counts = Widget.computed.counts.call(vm)
  expect(counts).toEqual({ total: 4, approved: 2, pending: 1, rejected: 1 })
})
