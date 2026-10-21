import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import CoreuiVue from '@coreui/vue'
import Orders from '@/views/Admin/Orders.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(CoreuiVue)

describe('Orders.vue', () => {
  let getters
  let actions
  let store
  let mockOrders

  beforeEach(() => {
    mockOrders = [
      {
        _id: '1',
        orderNumber: 'ORD-2026-0001',
        createdAt: new Date(),
        contact: { name: 'Customer One', email: 'one@example.com' },
        status: {
          title: [
            { key: 'en', value: 'Pending' },
            { key: 'th', value: 'รอตรวจสอบ' }
          ]
        },
        artwork: [{ price: 1000 }]
      },
      {
        _id: '2',
        orderNumber: 'ORD-2026-0002',
        createdAt: new Date(),
        contact: { name: 'Customer Two', email: 'two@example.com' },
        status: {
          title: [
            { key: 'en', value: 'Reserved' },
            { key: 'th', value: 'รอชำระเงิน' }
          ]
        },
        artwork: [{ price: 2000 }]
      },
      {
        _id: '3',
        orderNumber: 'ORD-2026-0003',
        createdAt: new Date(),
        contact: { name: 'Customer Three', email: 'three@example.com' },
        status: {
          title: [
            { key: 'en', value: 'Approved' },
            { key: 'th', value: 'อนุมัติ' }
          ]
        },
        artwork: [{ price: 1500 }]
      }
    ]

    getters = {
      orders: () => mockOrders
    }

    actions = {
      get: jest.fn()
    }

    store = new Vuex.Store({
      modules: {
        order: {
          namespaced: true,
          getters,
          actions
        }
      }
    })
  })

  it('keeps Reserved orders visible so admin can upload their payment slip', () => {
    const wrapper = shallowMount(Orders, {
      store,
      localVue,
      mocks: {
        $i18n: { locale: 'th' }
      }
    })

    // Admin-created reservations must remain visible for payment follow-up.
    const componentOrders = wrapper.vm.orders
    expect(componentOrders).toHaveLength(3)
    
    // ORD-2026-0002 is Reserved and must remain manageable.
    const orderNumbers = componentOrders.map(o => o.orderNumber)
    expect(orderNumbers).toContain('ORD-2026-0001')
    expect(orderNumbers).toContain('ORD-2026-0003')
    expect(orderNumbers).toContain('ORD-2026-0002')
  })
})
