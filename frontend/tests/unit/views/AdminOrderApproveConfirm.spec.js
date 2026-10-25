import Orders from '@/views/Admin/Orders.vue'

describe('Admin order approval needs confirmation', () => {
  const vm = () => ({ selectedOrder: null, showApproveModal: false, loading: false, updateStatus: jest.fn().mockResolvedValue() })

  it('opens a confirmation instead of approving immediately', () => {
    const v = vm(); const order = { _id: 'o1' }
    Orders.methods.handleApproveOrder.call(v, order)
    expect(v.showApproveModal).toBe(true)
    expect(v.selectedOrder).toBe(order)
    expect(v.updateStatus).not.toHaveBeenCalled()
  })

  it('approves once confirmed and closes the dialog', async () => {
    const v = vm(); v.selectedOrder = { _id: 'o1' }; v.showApproveModal = true
    await Orders.methods.confirmApprove.call(v)
    expect(v.updateStatus).toHaveBeenCalledWith({ _id: 'o1' }, 'Approved')
    expect(v.showApproveModal).toBe(false)
  })

  it('ignores a confirm click while a request is in flight', async () => {
    const v = vm(); v.selectedOrder = { _id: 'o1' }; v.loading = true
    await Orders.methods.confirmApprove.call(v)
    expect(v.updateStatus).not.toHaveBeenCalled()
  })
})
