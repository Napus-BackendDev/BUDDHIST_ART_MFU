import Payment from '@/views/page/Payment.vue';

const form = {
  name: 'Buyer',
  telephone: '0000000000',
  email: 'buyer@example.com',
  shipping: 'Address',
  bill: 'Address',
};

const makeVm = (dispatch) => ({
  submittingOrder: false,
  submittingPayment: false,
  loading: false,
  createdOrder: null,
  currentStep: 2,
  cartItems: [{ _id: 'art-1', price: 500 }],
  cartTotal: 500,
  shippingCost: 25,
  total: 525,
  subtotal: 500,
  $i18n: { locale: 'en' },
  $router: { push: jest.fn() },
  $store: {
    getters: { 'auth/userId': 'user-1' },
    dispatch,
    commit: jest.fn(),
  },
  getName: jest.fn(() => 'Approved'),
  checkExistingPendingOrder: jest.fn().mockResolvedValue(undefined),
});

describe('Payment checkout guards', () => {
  beforeEach(() => {
    global.alert = jest.fn();
  });

  afterEach(() => {
    delete global.alert;
  });

  it('ignores a second create-order click while the first request is pending', async () => {
    let resolveCreate;
    const createPromise = new Promise(resolve => { resolveCreate = resolve; });
    const dispatch = jest.fn((type) => {
      if (type === 'artwork/explore') return Promise.resolve({ status: { approval: 'Approved' } });
      if (type === 'order/create') return createPromise;
      return Promise.resolve();
    });
    const vm = makeVm(dispatch);

    const first = Payment.methods.handleCreateOrder.call(vm, form);
    const second = Payment.methods.handleCreateOrder.call(vm, form);
    await second;
    resolveCreate({ data: { data: { _id: 'order-1' } } });
    await first;

    expect(dispatch.mock.calls.filter(([type]) => type === 'order/create')).toHaveLength(1);
    expect(vm.currentStep).toBe(2);
  });

  it('keeps the payment step and cart when slip upload fails', async () => {
    const dispatch = jest.fn((type) => {
      if (type === 'order/upload') return Promise.reject(new Error('UPLOAD_FAILED'));
      return Promise.resolve();
    });
    const vm = makeVm(dispatch);
    vm.createdOrder = { _id: 'order-1' };

    await Payment.methods.handleSubmitPayment.call(vm, {
      paymentMethod: 'transfer',
      paymentProofFile: new Blob(['slip'], { type: 'image/jpeg' }),
    });

    expect(vm.currentStep).toBe(2);
    expect(dispatch).not.toHaveBeenCalledWith('cart/clearCart');
    expect(global.alert).toHaveBeenCalled();
  });
});
