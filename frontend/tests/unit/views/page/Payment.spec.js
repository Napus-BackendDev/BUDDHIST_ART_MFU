import Payment from '@/views/page/Payment.vue';
import { shallowMount } from '@vue/test-utils';

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
  shippingCost: 0,
  total: 500,
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
  it('invoice failure is inline and follows the selected language', async () => {
    const vm={isDownloading:false,paymentError:'',order:{_id:'qa-order'},$i18n:{locale:'en'},$store:{dispatch:jest.fn().mockRejectedValue(new Error('OFFLINE'))}};
    await Payment.methods.downloadBilling.call(vm);
    expect(global.alert).not.toHaveBeenCalled();
    expect(vm.paymentError).toBe('invoice');
    expect(Payment.computed.paymentErrorMessage.call(vm)).toContain('Could not download invoice');
    vm.$i18n.locale='th';
    expect(Payment.computed.paymentErrorMessage.call(vm)).toContain('ไม่สามารถดาวน์โหลดใบแจ้งหนี้');
    expect(vm.isDownloading).toBe(false);
  });

  it('invoice retry ignores duplicate clicks and releases its download URL', async () => {
    let finish;
    const vm={isDownloading:false,paymentError:'invoice',order:{_id:'qa-order'},$store:{dispatch:jest.fn(()=>new Promise(resolve=>{finish=resolve}))}};
    const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL;
    URL.createObjectURL=jest.fn(()=> 'blob:qa-invoice');URL.revokeObjectURL=jest.fn();
    const click=jest.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
    try {
      const first=Payment.methods.downloadBilling.call(vm);
      await Payment.methods.downloadBilling.call(vm);
      expect(vm.$store.dispatch).toHaveBeenCalledTimes(1);
      finish({data:'qa-pdf'});await first;
      expect(vm.paymentError).toBe('');
      expect(click).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:qa-invoice');
    } finally {click.mockRestore();URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke;}
  });

  it.each(['en','th'])('%s empty checkout directs the buyer to order history instead of an empty order form', locale => {
    const wrapper=shallowMount({...Payment,created(){},mounted(){}},{
      computed:{cartItems:()=>[],lastOrder:()=>null,reservationEnded:()=>false,hasReservedItems:()=>false},
      mocks:{$i18n:{locale},$store:{getters:{}}},
      stubs:{CContainer:{template:'<div><slot/></div>'},CIcon:true}
    });
    expect(wrapper.find({name:'CardShipping'}).exists()).toBe(false);
    expect(wrapper.text()).toContain(locale==='en'?'Your cart is empty':'ตะกร้าสินค้าว่างเปล่า');
    expect(wrapper.text()).toContain(locale==='en'?'View orders':'ดูคำสั่งซื้อ');
    wrapper.destroy();
  });

  it('returns to the completed receipt after navigating back with an empty cart', () => {
    const vm={...makeVm(jest.fn()),lastOrder:{_id:'order-1'},cartItems:[],currentStep:1,$route:{query:{}},fetchInitialData:jest.fn()};
    Payment.created.call(vm);
    expect(vm.currentStep).toBe(3);
  });

  it('keeps receipt artwork metadata separate from saved amount line items', () => {
    const artwork = { _id:'art-1', title:[{key:'en',value:'QA artwork'}], image:'/qa.png', price:500 };
    const order = Payment.computed.order.call({lastOrder:{items:[artwork],amounts:{subtotal:500,items:[{artwork:'art-1',price:500}]}},createdOrder:null});
    expect(order.items).toEqual([artwork]);
    expect(order.total).toBe(500);
  });

  it.each(['en','th'])('%s receipt uses the original order date and does not claim an unpaid total was paid', locale => {
    const lastOrder = {createdAt:'2026-10-17T15:32:15.685Z',date:'10/18/2026',items:[],amounts:{subtotal:0},status:{code:'RESERVED'}};
    const wrapper = shallowMount({...Payment,created(){},mounted(){}},{
      data:()=>({currentStep:3}),
      computed:{lastOrder:()=>lastOrder,cartItems:()=>[],reservationEnded:()=>false,hasReservedItems:()=>false},
      mocks:{$i18n:{locale},$store:{getters:{}}},
      stubs:{CContainer:{template:'<div><slot/></div>'},CCard:{template:'<div><slot/></div>'},CCardHeader:{template:'<div><slot/></div>'},CCardBody:{template:'<div><slot/></div>'},CIcon:true}
    });
    expect(wrapper.text()).toContain(locale==='en'?'17 Oct 2026':'17 ต.ค. 2569');
    expect(wrapper.text()).not.toContain('Total Paid');
    wrapper.destroy();
  });

  it.each([['', true], ['https://drive/slip.png', false]])('receipt reminds buyer to upload a missing slip (image=%p)', (image, shown) => {
    const lastOrder = {createdAt:'2026-10-17T15:32:15.685Z',items:[],amounts:{subtotal:0},status:{code:'RESERVED'},image};
    const wrapper = shallowMount({...Payment,created(){},mounted(){}},{
      data:()=>({currentStep:3}),
      computed:{lastOrder:()=>lastOrder,cartItems:()=>[],reservationEnded:()=>false,hasReservedItems:()=>false},
      mocks:{$i18n:{locale:'th'},$store:{getters:{}}},
      stubs:{CContainer:{template:'<div><slot/></div>'},CCard:{template:'<div><slot/></div>'},CCardHeader:{template:'<div><slot/></div>'},CCardBody:{template:'<div><slot/></div>'},CIcon:true,CLink:{template:'<a><slot/></a>'}}
    });
    expect(wrapper.text().includes('ยังไม่ได้แนบหลักฐานการชำระเงิน')).toBe(shown);
    wrapper.destroy();
  });

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
      if (type === 'order/get') return Promise.resolve([{ _id: 'order-1', status: { code: 'RESERVED' } }]);
      return Promise.resolve();
    });
    const vm = makeVm(dispatch);
    vm.createdOrder = { _id: 'order-1' };
    vm.refreshCheckoutOrder = () => Payment.methods.refreshCheckoutOrder.call(vm);
    Object.defineProperty(vm, 'reservationEnded', { get: () => Payment.computed.reservationEnded.call(vm) });

    await Payment.methods.handleSubmitPayment.call(vm, {
      paymentMethod: 'transfer',
      paymentProofFile: new Blob(['slip'], { type: 'image/jpeg' }),
    });

    expect(vm.currentStep).toBe(2);
    expect(dispatch).not.toHaveBeenCalledWith('cart/clearCart');
    expect(global.alert).not.toHaveBeenCalled();
    expect(vm.paymentError).toBe('submit');
    expect(dispatch).toHaveBeenCalledWith('order/upload', expect.objectContaining({ _id: 'order-1' }));
  });

  it('does not finish an order cancelled while checkout was open', async () => {
    const dispatch = jest.fn(type => type === 'order/get'
      ? Promise.resolve([{ _id: 'order-1', status: { code: 'CANCELLED' } }]) : Promise.resolve());
    const vm = makeVm(dispatch);
    vm.createdOrder = { _id: 'order-1', status: { code: 'RESERVED' } };
    vm.refreshCheckoutOrder = () => Payment.methods.refreshCheckoutOrder.call(vm);
    Object.defineProperty(vm, 'reservationEnded', { get: () => Payment.computed.reservationEnded.call(vm) });
    await Payment.methods.handleSubmitPayment.call(vm, { paymentMethod: 'transfer', paymentProofFile: null });
    expect(vm.createdOrder.status.code).toBe('CANCELLED');
    expect(vm.currentStep).toBe(2);
    expect(dispatch).not.toHaveBeenCalledWith('cart/clearCart');
  });

  it('keeps the cart when the latest order status cannot be verified', async () => {
    const vm = makeVm(jest.fn(() => Promise.reject(new Error('OFFLINE'))));
    vm.createdOrder = { _id: 'order-1' };
    vm.refreshCheckoutOrder = () => Payment.methods.refreshCheckoutOrder.call(vm);
    await Payment.methods.handleSubmitPayment.call(vm, { paymentProofFile: null });
    expect(vm.currentStep).toBe(2);
    expect(vm.$store.dispatch).not.toHaveBeenCalledWith('cart/clearCart');
  });

  it.each(['CANCELLED', 'REJECTED', 'APPROVED'])('blocks terminal order status %s', code => {
    const vm = makeVm(jest.fn()); vm.createdOrder = { status: { code } };
    expect(Payment.computed.reservationEnded.call(vm)).toBe(true);
  });

  it('does not warn about our own reserved item while the pending order is still being looked up', async () => {
    const vm = makeVm(jest.fn()); vm.cartItems = [{ _id: 'art-1', status: { approval: 'reserved' } }];
    vm.getName = jest.fn(() => 'Reserved'); vm.checkingPendingOrder = true;
    expect(Payment.computed.hasReservedItems.call(vm)).toBe(false);
    vm.refreshStatuses = jest.fn().mockResolvedValue(); await Payment.methods.fetchInitialData.call(vm);
    expect(vm.checkingPendingOrder).toBe(false);
    expect(Payment.computed.hasReservedItems.call(vm)).toBe(true);
  });

  it('blocks an unpaid reservation past its deadline before the cron runs', () => {
    const vm = makeVm(jest.fn()); vm.createdOrder = { status: { code: 'RESERVED' }, createdAt: new Date(Date.now() - 25 * 3600000).toISOString() };
    expect(Payment.computed.reservationEnded.call(vm)).toBe(true);
  });

  it('finishes a current unpaid reservation without a slip when explicitly confirmed', async () => {
    const vm = makeVm(jest.fn(type => type === 'order/get'
      ? Promise.resolve([{ _id: 'order-1', status: { code: 'RESERVED' }, createdAt: new Date().toISOString() }]) : Promise.resolve()));
    vm.createdOrder = { _id: 'order-1' };
    vm.refreshCheckoutOrder = () => Payment.methods.refreshCheckoutOrder.call(vm);
    Object.defineProperty(vm, 'reservationEnded', { get: () => Payment.computed.reservationEnded.call(vm) });
    await Payment.methods.handleSubmitPayment.call(vm, { paymentMethod: 'transfer', paymentProofFile: null });
    expect(vm.currentStep).toBe(3);
    expect(vm.$store.dispatch).toHaveBeenCalledWith('cart/clearCart');
  });

  it('reloads the order after the slip upload so the receipt shows the saved slip', async () => {
    const saved = { _id: 'order-1', image: 'https://drive/slip.png', status: { code: 'PENDING' }, createdAt: new Date().toISOString() };
    let uploaded = false;
    const vm = makeVm(jest.fn(type => {
      if (type === 'order/upload') { uploaded = true; return Promise.resolve(); }
      if (type === 'order/get') return Promise.resolve([uploaded ? saved : { _id: 'order-1', status: { code: 'RESERVED' }, createdAt: saved.createdAt }]);
      return Promise.resolve();
    }));
    vm.createdOrder = { _id: 'order-1', status: { code: 'RESERVED' }, createdAt: saved.createdAt };
    vm.refreshCheckoutOrder = () => Payment.methods.refreshCheckoutOrder.call(vm);
    Object.defineProperty(vm, 'reservationEnded', { get: () => Payment.computed.reservationEnded.call(vm) });
    await Payment.methods.handleSubmitPayment.call(vm, { paymentMethod: 'transfer', paymentProofFile: new Blob(['slip'], { type: 'image/jpeg' }) });
    expect(vm.currentStep).toBe(3);
    expect(vm.$store.dispatch).toHaveBeenCalledWith('cart/setLastOrder', expect.objectContaining({ image: saved.image }));
  });

  it('never renders the success receipt or bank form for an ended reservation', () => {
    const wrapper = shallowMount({ ...Payment, created() {}, mounted() {} }, {
      data: () => ({ currentStep: 2 }),
      computed: { reservationEnded: () => true, hasReservedItems: () => true },
      mocks: { $i18n: { locale: 'en' }, $store: { getters: {} } },
      stubs: { CContainer: { template: '<div><slot/></div>' }, CLink: { template: '<a><slot/></a>' }, CIcon: true }
    });
    expect(wrapper.text()).toContain('Reservation Ended');
    expect(wrapper.text()).not.toContain('Order Confirmed!');
    expect(wrapper.find({ name: 'CardShipping' }).exists()).toBe(false);
    wrapper.destroy();
  });
});
