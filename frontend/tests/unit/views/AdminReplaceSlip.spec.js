jest.doMock('@/service/api', () => ({ __esModule: true, default: { order: jest.fn() } }))
jest.doMock('@/store/store', () => ({}))
const Service = require('@/service/api').default
const OrderModule = require('@/store/modules/Order').default
const Edit = require('@/views/Admin/components/modal/order/OrderEditModal.vue').default

const vm = order => ({ order, getName: () => '' })

describe('admin replace payment slip', () => {
  test('only a pending order that already has a slip can be replaced', () => {
    const can = order => Edit.computed.canReplaceImage.call(vm(order))
    expect(can({ _id: '1', image: 'x', status: { code: 'PENDING' } })).toBe(true)
    expect(can({ _id: '1', image: 'x', status: { code: 'APPROVED' } })).toBe(false)
    expect(can({ _id: '1', image: '', status: { code: 'PENDING' } })).toBe(false)
    expect(can(null)).toBe(false)
  })

  test('store action posts the file as multipart to replace-slip', async () => {
    Service.order.mockResolvedValue({})
    await OrderModule.actions.replaceSlip({ commit: jest.fn() }, { _id: 'o1', image: new Blob(['x']) })
    const [type, body] = Service.order.mock.calls[0]
    expect(type).toBe('replace-slip')
    expect(body.get('_id')).toBe('o1')
    expect(body.get('image')).toBeTruthy()
  })
})
