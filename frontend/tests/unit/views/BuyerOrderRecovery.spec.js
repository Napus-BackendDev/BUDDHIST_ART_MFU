import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import Orders from '@/views/User/order.vue'
import Service from '@/service/api'
const flush=()=>new Promise(resolve=>setTimeout(resolve,0))
const mountPage=(dispatch,locale=Vue.observable({locale:'th'}))=>shallowMount({...Orders,created(){}},{
 mocks:{$i18n:locale,$store:{dispatch,getters:{'order/orders':[],'auth/userId':'qa-buyer'},commit:jest.fn()}},
 stubs:{CContainer:{template:'<div><slot/></div>'},CCard:{template:'<div><slot/></div>'},CCardBody:{template:'<div><slot/></div>'},CIcon:true,OrderModal:true}
})
afterEach(()=>jest.restoreAllMocks())
test('load failure keeps orders available, follows locale and retries once without duplicate requests',async()=>{
 const locale=Vue.observable({locale:'th'}),dispatch=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]),w=mountPage(dispatch,locale)
 try{await w.vm.fetchOrders();expect(w.find('[role="alert"]').text()).toContain('โหลดคำสั่งซื้อไม่สำเร็จ');locale.locale='en';await w.vm.$nextTick();expect(w.find('[role="alert"]').text()).toContain('Unable to load orders');await w.find('[role="alert"] button').trigger('click');await flush();expect(dispatch).toHaveBeenCalledTimes(2);expect(w.vm.loadError).toBe('');let resolve;dispatch.mockImplementation(()=>new Promise(r=>resolve=r));const pending=w.vm.fetchOrders();await w.vm.fetchOrders();expect(dispatch).toHaveBeenCalledTimes(3);resolve([]);await pending}finally{w.destroy()}
})
test('429 respects Retry-After before allowing a manual retry',async()=>{
 let now=Date.now();jest.spyOn(Date,'now').mockImplementation(()=>now)
 const dispatch=jest.fn().mockRejectedValueOnce({response:{status:429,headers:{'retry-after':'30'}}}).mockResolvedValue([]),w=mountPage(dispatch)
 try{await w.vm.fetchOrders();expect(w.vm.loadError).toBe('rate');await w.vm.fetchOrders();expect(dispatch).toHaveBeenCalledTimes(1);now+=30000;await w.vm.fetchOrders();expect(dispatch).toHaveBeenCalledTimes(2);expect(w.vm.loadError).toBe('')}finally{w.destroy()}
})
test.each(['invoice','certificate'])('%s failure is inline, localized and retry releases the blob URL',async kind=>{
 const locale=Vue.observable({locale:'en'}),dispatch=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({data:'pdf'}),w=mountPage(dispatch,locale)
 const service=jest.spyOn(Service,'order').mockRejectedValueOnce(new Error('offline')).mockResolvedValue({data:'pdf'})
 const alert=jest.spyOn(window,'alert').mockImplementation(()=>{});window.URL.createObjectURL=jest.fn(()=> 'blob:qa-document');window.URL.revokeObjectURL=jest.fn();jest.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{})
 const method=kind==='invoice'?'downloadInvoice':'downloadCertificate',item={_id:'qa-order',orderId:'ORD-QA-RECOVERY',status:{title:[{key:'en',value:'Approved'}]}}
 try{await w.vm[method](item);expect(alert).not.toHaveBeenCalled();expect(w.find('[role="alert"]').text()).toContain('Unable to download');locale.locale='th';await w.vm.$nextTick();expect(w.find('[role="alert"]').text()).toContain('ดาวน์โหลด');await w.vm[method](item);expect(w.vm.documentError).toBe('');expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:qa-document');expect(w.vm.downloading).toBe('');expect(kind==='invoice'?dispatch:service).toHaveBeenCalledTimes(2)}finally{w.destroy()}
})
