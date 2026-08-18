import { shallowMount, createLocalVue } from '@vue/test-utils'
import CoreuiVue from '@coreui/vue'
import OrderTable from '@/views/Admin/components/table/OrderTable.vue'

const localVue = createLocalVue()
localVue.use(CoreuiVue)

const status = value => ({
  title: [
    { key: 'en', value },
    { key: 'th', value }
  ]
})

const orders = [
  {
    _id: 'order-id-1',
    orderNumber: 'ORD-2026-0001',
    createdAt: '2026-08-15T12:00:00.000Z',
    contact: { name: 'Customer One', email: 'one@example.com' },
    status: status('Pending'),
    artwork: []
  },
  {
    _id: 'order-id-2',
    orderNumber: 'ORD-2026-0002',
    createdAt: '2026-08-10T12:00:00.000Z',
    contact: {},
    status: status('Approved'),
    artwork: []
  },
  {
    _id: 'order-id-3',
    orderNumber: 'ORD-2026-0003',
    createdAt: '2026-07-10T12:00:00.000Z',
    contact: { name: 'Customer Three' },
    status: 'Rejected',
    artwork: []
  }
]

const mountTable = filters => shallowMount(OrderTable, {
  localVue,
  propsData: {
    items: orders,
    filters: {
      search: '',
      status: 'All Status',
      startDate: null,
      endDate: null,
      quickRange: 'All Time',
      ...filters
    }
  },
  mocks: {
    $i18n: { locale: 'en' },
    $store: { state: {} }
  }
})

describe('Admin order filters', () => {
  it('searches the displayed order number and tolerates missing customer fields', () => {
    const wrapper = mountTable({ search: 'ORD-2026-0002' })

    expect(wrapper.vm.filteredItems.map(item => item.orderNumber)).toEqual(['ORD-2026-0002'])
  })

  it('filters with only a start date or only an end date', () => {
    const fromWrapper = mountTable({ startDate: new Date('2026-08-12T00:00:00') })
    const untilWrapper = mountTable({ endDate: new Date('2026-08-12T00:00:00') })

    expect(fromWrapper.vm.filteredItems.map(item => item.orderNumber)).toEqual(['ORD-2026-0001'])
    expect(untilWrapper.vm.filteredItems.map(item => item.orderNumber)).toEqual([
      'ORD-2026-0002',
      'ORD-2026-0003'
    ])
  })

  it('groups status values case-insensitively for the status filter', () => {
    const wrapper = mountTable({ status: 'Completed' })

    expect(wrapper.vm.filteredItems.map(item => item.orderNumber)).toEqual(['ORD-2026-0002'])
  })
})
