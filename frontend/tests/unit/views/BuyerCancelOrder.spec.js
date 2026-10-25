jest.doMock('@/service/api', () => ({ __esModule: true, default: { order: jest.fn() } }))
jest.doMock('@/store/store', () => ({}))
const Service = require('@/service/api').default
const OrderModule = require('@/store/modules/Order').default
const mixin = require('@/mixins/cancelOwnOrder').default

const makeVm = (dispatch, locale = 'en') => ({ ...mixin.data(), $i18n: { locale }, $store: { dispatch, commit: jest.fn() } })

describe('buyer cancels own unpaid order', () => {
  afterEach(() => { delete global.confirm })

  test('declined confirm does nothing', async () => {
    global.confirm = jest.fn(() => false)
    const vm = makeVm(jest.fn())
    await mixin.methods.cancelOwnOrder.call(vm, { _id: 'o1' })
    expect(vm.$store.dispatch).not.toHaveBeenCalled()
  })

  test('confirmed cancel dispatches, toasts success and refreshes', async () => {
    global.confirm = jest.fn(() => true)
    const vm = makeVm(jest.fn().mockResolvedValue({}))
    const refresh = jest.fn().mockResolvedValue()
    await mixin.methods.cancelOwnOrder.call(vm, { _id: 'o1' }, refresh)
    expect(vm.$store.dispatch).toHaveBeenCalledWith('order/cancel', 'o1')
    expect(vm.$store.commit).toHaveBeenCalledWith('dialog/showToast', expect.objectContaining({ variant: 'success' }))
    expect(refresh).toHaveBeenCalled()
    expect(vm.cancellingOrder).toBe(false)
  })

  test('a second click while cancelling is ignored; failure shows an error and refreshes', async () => {
    global.confirm = jest.fn(() => true)
    const vm = makeVm(jest.fn().mockRejectedValue(new Error('409')))
    const refresh = jest.fn().mockResolvedValue()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await mixin.methods.cancelOwnOrder.call(vm, { _id: 'o1' }, refresh)
    expect(vm.$store.commit).toHaveBeenCalledWith('dialog/showToast', expect.objectContaining({ variant: 'danger' }))
    expect(refresh).toHaveBeenCalled()
    vm.cancellingOrder = true
    await mixin.methods.cancelOwnOrder.call(vm, { _id: 'o2' })
    expect(vm.$store.dispatch).toHaveBeenCalledTimes(1)
    console.error.mockRestore()
  })

  test('store action sends the CANCELLED status id', async () => {
    const dispatch = jest.fn().mockResolvedValue()
    const rootGetters = { 'setting/status/item': [{ _id: 'a', code: 'APPROVED' }, { _id: 'c', code: 'CANCELLED' }] }
    Service.order.mockResolvedValue({})
    await OrderModule.actions.cancel({ dispatch, rootGetters }, 'o1')
    expect(Service.order).toHaveBeenCalledWith('put', { _id: 'o1', status: 'c' }, {})
    await expect(OrderModule.actions.cancel({ dispatch, rootGetters: { 'setting/status/item': [] } }, 'o1')).rejects.toThrow('CANCELLED_STATUS_MISSING')
  })
})
