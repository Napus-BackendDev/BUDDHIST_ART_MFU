import { statusBadgeMixin } from '@/mixins/statusBadgeMixin'
import Widget from '@/views/Admin/components/widget/OrderWidget.vue'
import Analytics from '@/views/Admin/Analytics.vue'

test('cohort sold count excludes rejected, cancelled and pending orders', () => {
  const work = id => ({ _id: id })
  const orders = ['Approved', 'Rejected', 'Cancelled', 'Pending'].map((status, index) => ({
    status: { title: [{ key: 'en', value: status }] }, artwork: [work(String(index))]
  }))
  const vm = { filteredArtworks: ['0', '1', '2', '3', 'sold'].map(work), filteredOrders: orders,
    idOf: art => art._id, isSoldArtwork: art => art._id === 'sold',
    isApprovedOrder: Analytics.methods.isApprovedOrder }
  expect([...Analytics.computed.soldArtworkIds.call(vm)].sort()).toEqual(['0', 'sold'])
})
import View from '@/views/Admin/components/modal/order/OrderViewModal.vue'

const status = (en, th) => ({ title: [{ key: 'en', value: en }, { key: 'th', value: th }] })
const rejected = status('Rejected', 'ไม่อนุมัติ')
const approved = status('Approved', 'อนุมัติ')

test.each([rejected, 'ไม่อนุมัติ', 'ไม่ผ่าน', status('Cancelled', 'ยกเลิก')])('negative statuses never count as completed: %j', value => {
  expect(statusBadgeMixin.methods.getOrderStatusGroup(value)).toBe('Cancelled')
})

test('order totals and sold counts exclude rejected bilingual orders', () => {
  const vm = { orders: [{ status: rejected, artwork: [{}, {}] }, { status: approved, artwork: [{}] }],
    getOrderStatusGroup: statusBadgeMixin.methods.getOrderStatusGroup }
  vm.getStatusLabel = Widget.methods.getStatusLabel.bind(vm)
  expect(Widget.computed.counts.call(vm)).toMatchObject({ total: 2, completed: 1, artworksSold: 1 })
})

test('analytics excludes rejected orders from approved totals', () => {
  const vm = { $i18n: { locale: 'th' }, translatedName: Analytics.methods.translatedName }
  expect(Analytics.methods.isApprovedOrder.call(vm, { status: rejected })).toBe(false)
  expect(Analytics.methods.isApprovedOrder.call(vm, { status: approved })).toBe(true)
})

test('admin certificate eligibility matches approved-only backend policy', () => {
  expect(View.computed.isCertificateAvailable.call({ order: { status: rejected } })).toBe(false)
  expect(View.computed.isCertificateAvailable.call({ order: { status: status('Pending', 'รอตรวจสอบ') } })).toBe(false)
  expect(View.computed.isCertificateAvailable.call({ order: { status: approved } })).toBe(true)
})
