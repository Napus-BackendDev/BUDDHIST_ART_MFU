import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Coreui from '@coreui/vue-pro'
import ArtistSubmissions from '@/views/Artist/Submissions.vue'
import ArtistSubmissionsDetail from '@/views/Artist/SubmissionsDetail.vue'
import UserOrder from '@/views/User/order.vue'
import PaymentPage from '@/views/page/Payment.vue'
import BillPage from '@/views/page/Bill.vue'

const portal = {
  _id: 'sub-1',
  title: [
    { key: 'en', value: 'Buddhist Art Creative Works, Cohort 9 (2026)' },
    { key: 'th', value: 'ผลงานสร้างสรรค์พุทธศิลป์ รุ่นที่ 9 (2569)' }
  ],
  artist: ['artist-1'],
  create: { startAt: '2026-01-01', endAt: '2099-05-31' },
  assignments: [
    {
      _id: 'assign-1',
      isAssigned: true,
      title: [{ key: 'en', value: 'Cohort 9 Final Exhibition' }, { key: 'th', value: 'นิทรรศการจบหลักสูตร รุ่นที่ 9' }],
      create: { startAt: '2026-09-01', endAt: '2099-05-31' },
      artist: ['artist-1'],
      artworks: [
        { _id: 'art-1', owner: 'artist-1', approved: true, title: [{ key: 'en', value: 'Work 1' }, { key: 'th', value: 'งาน 1' }] }
      ]
    }
  ]
}

const createBaseVue = () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(Coreui)
  localVue.directive('c-tooltip', () => {})
  return localVue
}

test('Artist Submissions removes rigid 250px min-width and wraps actions cleanly for mobile', () => {
  const localVue = createBaseVue()
  const wrapper = mount({ ...ArtistSubmissions, created() {} }, {
    localVue,
    mocks: {
      $i18n: { locale: 'en' },
      $store: { getters: { 'submission/submissions': [portal], 'auth/userId': 'artist-1' } }
    },
    stubs: { CIcon: true }
  })

  const main = wrapper.find('.submission-main')
  expect(main.exists()).toBe(true)
  expect(main.attributes('style') || '').not.toContain('min-width: 250px')
  const title = wrapper.find('.submission-title-text')
  expect(title.exists()).toBe(true)
  expect(title.classes()).not.toContain('text-truncate')
  expect(wrapper.find('.submission-meta-actions').exists()).toBe(true)
  wrapper.destroy()
})

test('Artist SubmissionsDetail wraps assignment bars and action buttons cleanly on narrow mobile', () => {
  const localVue = createBaseVue()
  const wrapper = mount({ ...ArtistSubmissionsDetail, created() {} }, {
    localVue,
    computed: { submission: () => portal },
    mocks: {
      $i18n: { locale: 'en' },
      $store: { getters: { 'auth/userId': 'artist-1' } }
    },
    stubs: { CIcon: true, SubmissionModal: true, ArtworkViewModal: true, SubmissionEditModal: true }
  })

  const bar = wrapper.find('.assignment-bar-content')
  expect(bar.classes()).toContain('flex-wrap')
  const title = wrapper.find('.assignment-title-text')
  expect(title.exists()).toBe(true)
  expect(title.classes()).not.toContain('text-truncate')
  expect(wrapper.find('.assignment-actions-col').classes()).toContain('flex-wrap')
  expect(wrapper.find('.action-btn-minimal').classes()).toContain('flex-wrap')
  expect(wrapper.findAll('.assignment-action-btn').length).toBe(2)
  wrapper.destroy()
})

test('User order search box removes rigid 300px inline min-width and wraps table in .table-responsive', () => {
  const localVue = createBaseVue()
  const wrapper = mount({ ...UserOrder, created() {} }, {
    localVue,
    mocks: {
      $i18n: { locale: 'en' },
      $store: { getters: { 'auth/userId': 'buyer-1', 'order/orders': [] }, dispatch: jest.fn() },
      $router: { push: jest.fn() }
    },
    stubs: { CIcon: true, OrderModal: true, CDataTable: true, CPagination: true }
  })

  const searchBox = wrapper.find('.search-box')
  expect(searchBox.exists()).toBe(true)
  expect(searchBox.attributes('style') || '').not.toContain('min-width: 300px')
  expect(wrapper.find('.table-responsive').exists()).toBe(true)
  expect(wrapper.find('.pagination-footer').classes()).toContain('flex-wrap')
  wrapper.destroy()
})

test('Payment confirmation step and Bill actions wrap cleanly on small viewports', () => {
  const localVue = createBaseVue()
  const paymentWrapper = mount({ ...PaymentPage, created() {} }, {
    localVue,
    data() {
      return {
        currentStep: 3,
        order: { _id: 'ord-1', orderNumber: 'ORD-001', items: [], total: 1000, shippingCost: 0, image: 'slip.png', paymentMethod: 'qrcode' },
        isDownloading: false
      }
    },
    mocks: {
      $i18n: { locale: 'en' },
      $store: { getters: { 'cart/cart': [], 'auth/userId': 'buyer-1', 'order/lastOrder': null } },
      $router: { push: jest.fn() }
    },
    stubs: { CIcon: true, CSpinner: true, CardShipping: true, RouterLink: true }
  })

  const stepRow = paymentWrapper.find('.step-actions-row')
  expect(stepRow.exists()).toBe(true)
  expect(stepRow.classes()).toContain('flex-wrap')
  expect(paymentWrapper.findAll('.step-action-btn').length).toBe(2)
  paymentWrapper.destroy()

  const store = new Vuex.Store({
    modules: {
      cart: {
        namespaced: true,
        getters: {
          lastOrder: () => ({
            _id: 'ord-1',
            orderNumber: 'ORD-001',
            items: [],
            total: 1000,
            date: '2026-11-14',
            paymentMethod: 'qrcode'
          })
        }
      }
    }
  })

  const billWrapper = mount({ ...BillPage, created() {} }, {
    localVue,
    store,
    mocks: {
      $i18n: { locale: 'en' },
      $router: { push: jest.fn() }
    },
    stubs: { CIcon: true, RouterLink: true }
  })

  const billRow = billWrapper.find('.bill-actions-row')
  expect(billRow.exists()).toBe(true)
  expect(billRow.classes()).toContain('flex-wrap')
  expect(billWrapper.findAll('.bill-action-btn').length).toBe(2)
  billWrapper.destroy()
})
