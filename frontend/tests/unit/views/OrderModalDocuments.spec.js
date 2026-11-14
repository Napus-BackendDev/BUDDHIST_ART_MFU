import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
jest.doMock('@/service/api', () => ({ __esModule:true, default:{order:jest.fn()} }))
const Service = require('@/service/api').default
const OrderModal = require('@/views/User/components/modal/OrderModal.vue').default

const mountModal = locale => shallowMount(OrderModal, {
  propsData: { show:true, order:{_id:'qa-order',orderNumber:'ORD-QA',createdAt:new Date().toISOString(),artwork:[],contact:{},address:{},status:{title:[{key:'en',value:'Approved'}]}} },
  mocks: {$i18n:locale},
  stubs: {CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CIcon:true}
})

test.each([['APPROVED',true],['RESERVED',false],['PENDING',false],['REJECTED',false],['CANCELLED',false]])('modal certificate follows canonical %s despite an edited title', async (code, approved) => {
 const w=mountModal({locale:'en'})
 await w.setProps({order:{_id:'qa-order',orderNumber:'ORD-QA',createdAt:new Date().toISOString(),artwork:[],contact:{},address:{},status:{code,title:[{key:'en',value:approved?'QA renamed status':'Approved'}]}}})
 expect(w.vm.isApproved).toBe(approved)
 expect(w.vm.getStatusTextColor(w.vm.order.status)).toBe(approved?'text-success':['REJECTED','CANCELLED'].includes(code)?'text-danger':'text-warning')
 expect(w.vm.orderStatusBadge.class).toBe(approved?'badge-completed':['REJECTED','CANCELLED'].includes(code)?'badge-cancelled':code==='RESERVED'?'badge-info':'badge-pending')
 const certificate=w.findAll('button.doc-pill-btn').wrappers.find(button=>button.text().includes('Certificate'))
 expect(certificate.element.disabled).toBe(!approved)
 w.destroy()
})

test('modal countdown follows RESERVED code instead of an editable status label', () => {
 const now=Date.now(),vm={now,$i18n:{locale:'en'},getName:OrderModal.methods.getName,order:{createdAt:new Date(now-1000).toISOString(),image:'',status:{code:'RESERVED',title:[{key:'en',value:'QA renamed status'}]}}}
 expect(OrderModal.computed.timeLeftDisplay.call(vm)).toBe('23h 59m 59s')
 vm.order.status={code:'APPROVED',title:[{key:'en',value:'Pending'}]}
 expect(OrderModal.computed.timeLeftDisplay.call(vm)).toBeNull()
 vm.order.status={code:'PENDING',title:[{key:'en',value:'Pending'}]}
 expect(OrderModal.computed.timeLeftDisplay.call(vm)).toBeNull()
})

beforeEach(()=>{jest.clearAllMocks();jest.spyOn(console,'error').mockImplementation(()=>{})})
afterEach(()=>{jest.restoreAllMocks()})

test.each(['invoice','certificate'])('%s failure is visible, localized and clears on a successful retry', async kind=>{
  const locale=Vue.observable({locale:'en'}),w=mountModal(locale)
  const download=kind==='invoice'?'downloadInvoice':'downloadCertificate'
  w.vm.downloadFile=jest.fn()
  Service.order.mockRejectedValueOnce(new Error('OFFLINE'))
  await w.vm[download]();await w.vm.$nextTick()
  expect(w.find('[role="alert"]').text()).toContain(kind==='invoice'?'Could not download invoice':'Could not download certificate')
  locale.locale='th';await w.vm.$nextTick()
  expect(w.find('[role="alert"]').text()).toContain(kind==='invoice'?'ไม่สามารถดาวน์โหลดใบยืนยันการจอง':'ไม่สามารถดาวน์โหลดใบรับรอง')
  Service.order.mockResolvedValueOnce({data:'qa-pdf'})
  await w.vm[download]();await w.vm.$nextTick()
  expect(w.find('[role="alert"]').exists()).toBe(false)
  expect(w.vm.downloadFile).toHaveBeenCalledTimes(1)
  w.destroy()
})

test('pending download disables both document buttons and ignores repeated requests',async()=>{
  let finish
  Service.order.mockReturnValueOnce(new Promise(resolve=>{finish=resolve}))
  const w=mountModal({locale:'en'});w.vm.downloadFile=jest.fn()
  const first=w.vm.downloadInvoice();await w.vm.$nextTick()
  expect(w.find('button[title="Download Invoice PDF"]').element.disabled).toBe(true)
  expect(w.find('button[title="Download Certificate"]').element.disabled).toBe(true)
  await w.vm.downloadInvoice();await w.vm.downloadCertificate()
  expect(Service.order).toHaveBeenCalledTimes(1)
  finish({data:'qa-pdf'});await first;await w.vm.$nextTick()
  expect(w.find('button[title="Download Invoice PDF"]').element.disabled).toBe(false)
  w.destroy()
})

test.each([['en','Close'],['th','ปิด']])('%s modal header close has a localized name', (locale,name)=>{
  const w=mountModal({locale})
  expect(w.find('.close-btn').attributes('aria-label')).toBe(name)
  w.destroy()
})
