import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import Orders from '@/views/User/order.vue'
import Modal from '@/views/User/components/modal/OrderModal.vue'
import { paymentSlipIssue, canUploadPaymentSlip } from '@/utils/paymentSlip'

const order=()=>({_id:'qa-order',user:'qa-user',createdAt:new Date().toISOString(),image:'',artwork:[],contact:{},address:{},status:{code:'RESERVED',title:[{key:'en',value:'Reserved'}]}})
function view(kind,locale={locale:'en'},dispatch=jest.fn().mockResolvedValue([])) {
  const item=order()
  const w=shallowMount(kind==='modal'?Modal:{...Orders,created(){}},{
    propsData:kind==='modal'?{show:true,order:item}:{},
    computed:kind==='row'?{allOrders:()=>[],userId:()=> 'qa-user'}:{},
    mocks:{$i18n:locale,$store:{getters:{},commit:jest.fn(),dispatch}},
    directives:{'c-tooltip':()=>{}},
    stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CContainer:{template:'<div><slot/></div>'},CIcon:true}
  })
  if(kind==='row')w.vm.selectedOrder=item
  return w
}
const choose=(w,kind,event)=>w.vm[kind==='modal'?'handleFileUpload':'handleOrderSlipUpload'](event)
beforeEach(()=>{jest.spyOn(window,'alert').mockImplementation(()=>{});jest.spyOn(console,'error').mockImplementation(()=>{})})
afterEach(()=>jest.restoreAllMocks())

test.each(['row','modal'].flatMap(kind=>['en','th'].flatMap(locale=>['size','type'].map(issue=>[kind,locale,issue]))))('%s %s %s invalid slip is rejected inline and clears the input',async(kind,locale,issue)=>{
  const w=view(kind,{locale}),event={target:{files:[issue==='size'?{name:'qa.png',type:'image/png',size:10*1024*1024+1}:{name:'qa.txt',type:'text/plain',size:10}],value:'qa-file'}}
  await choose(w,kind,event);await w.vm.$nextTick()
  expect(w.vm.$store.dispatch).not.toHaveBeenCalled()
  expect(window.alert).not.toHaveBeenCalled()
  expect(w.find('[role="alert"]').text()).toContain(issue==='size'?'10MB':(locale==='en'?'JPG':'รูปภาพ'))
  expect(event.target.value).toBe('')
  w.destroy()
})

test('a slip selected after modal reservation expiry never uploads',async()=>{
  const w=view('modal');await w.setProps({order:{...order(),createdAt:new Date(Date.now()-25*3600000).toISOString()}})
  await choose(w,'modal',{target:{files:[{name:'qa.png',type:'image/png',size:10}],value:'qa.png'}})
  expect(w.vm.$store.dispatch).not.toHaveBeenCalled()
  expect(w.vm.slipError).toBe('expired')
  w.destroy()
})

test.each(['row','modal'])('%s upload failure stays inline and follows locale changes',async kind=>{
  const locale=Vue.observable({locale:'en'}),w=view(kind,locale,jest.fn().mockRejectedValue(new Error('OFFLINE')))
  await choose(w,kind,{target:{files:[{name:'qa.png',type:'image/png',size:10}],value:'qa.png'}});await w.vm.$nextTick()
  expect(window.alert).not.toHaveBeenCalled()
  expect(w.find('[role="alert"]').text()).toContain('Upload failed')
  locale.locale='th';await w.vm.$nextTick()
  expect(w.find('[role="alert"]').text()).toContain('อัปโหลด')
  w.destroy()
})

test.each(['row','modal'])('%s ignores an empty selection and a second pending upload',async kind=>{
  let finish
  const dispatch=jest.fn(()=>new Promise(resolve=>{finish=resolve})),w=view(kind,{locale:'en'},dispatch)
  await choose(w,kind,{target:{files:[],value:''}})
  expect(dispatch).not.toHaveBeenCalled()
  const first=choose(w,kind,{target:{files:[{name:'qa.png',type:'image/png',size:10}],value:'qa.png'}})
  await choose(w,kind,{target:{files:[{name:'qa.png',type:'image/png',size:10}],value:'qa.png'}})
  expect(dispatch).toHaveBeenCalledTimes(1)
  // End the upload with a rejected request, avoiding any order-refresh dependency.
  finish(Promise.reject(new Error('OFFLINE')));await first
  w.destroy()
})

test('size boundary and renamed status follow the backend upload policy',()=>{
  expect(paymentSlipIssue({name:'qa.PNG',type:'image/png',size:10*1024*1024})).toBe('')
  expect(paymentSlipIssue({name:'qa.txt',type:'image/png',size:10})).toBe('type')
  const item=order();item.status.title=[{key:'en',value:'Renamed'}]
  expect(canUploadPaymentSlip(item,()=> 'Renamed')).toBe(true)
  expect(canUploadPaymentSlip({...item,status:{code:'APPROVED'}},()=> 'Reserved')).toBe(false)
})
