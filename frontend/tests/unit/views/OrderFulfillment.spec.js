jest.doMock('@/service/api', () => ({ __esModule: true, default: {} }))
const Editor = require('@/views/Admin/components/modal/order/OrderEditModal.vue').default

test('saving fulfillment emits the order identity and fields expected by order/update', () => {
  const emit = jest.fn()
  Editor.methods.handleSave.call({
    form: { _id: 'qa-order', contact: { name: 'QA Buyer' }, address: { shipping: 'QA address' },
      artworks: [{ _id: 'qa-art' }], carrier: 'Thailand Post', trackingId: 'QA-TEST-TRACKING', deliveryDate: '' },
    imageFile: null, $emit: emit
  })
  expect(emit).toHaveBeenCalledWith('save', expect.objectContaining({
    _id: 'qa-order', carrier: 'Thailand Post', trackingId: 'QA-TEST-TRACKING'
  }))
  expect(emit.mock.calls[0][1].status).toBeUndefined()
})
