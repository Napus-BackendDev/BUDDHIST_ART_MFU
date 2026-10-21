import {mount,createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import Coreui from '@coreui/vue-pro'
import Shipping from '@/views/page/components/card/CardShipping.vue'
const localVue=createLocalVue();localVue.use(Vuex);localVue.use(Coreui)

test.each(['en','th'])('%s no-slip checkout can cancel before explicitly finishing, without a native dialog', async locale=>{
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>0}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}})
 const nativeConfirm=jest.spyOn(window,'confirm').mockReturnValue(true)
 const w=mount(Shipping,{localVue,store,propsData:{currentStep:2},mocks:{$i18n:{locale}},stubs:['CIcon']})
 const finish=()=>w.findAll('button').wrappers.find(button=>button.text()===(locale==='en'?'Finish without slip':'เสร็จสิ้นโดยไม่แนบสลิป'))
 await w.find('button.btn-main').trigger('click')
 expect(nativeConfirm).not.toHaveBeenCalled()
 expect(w.emitted('submit-payment')).toBeUndefined()
 expect(finish()).toBeDefined()
 expect(w.text()).toContain(locale==='en'?'Your order will remain awaiting payment.':'คำสั่งซื้อยังคงรอชำระเงิน')
 await w.findAll('button').wrappers.find(button=>button.text()===(locale==='en'?'Cancel':'ยกเลิก')).trigger('click')
 expect(w.emitted('submit-payment')).toBeUndefined()
 await w.find('button.btn-main').trigger('click')
 await finish().trigger('click')
 expect(w.emitted('submit-payment')).toEqual([[{paymentMethod:'bank',paymentProofFile:null}]])
 w.vm.finishWithoutSlip()
 expect(w.emitted('submit-payment')).toHaveLength(1)
 nativeConfirm.mockRestore();w.destroy()
})

test.each([{loading:true},{hasReservedItems:true}])('an open no-slip confirmation cannot finish after checkout becomes unavailable: %j', async props=>{
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>0}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}})
 const w=mount(Shipping,{localVue,store,propsData:{currentStep:2},mocks:{$i18n:{locale:'en'}},stubs:['CIcon']})
 await w.find('button.btn-main').trigger('click')
 await w.setProps(props)
 w.vm.finishWithoutSlip()
 w.vm.onConfirmPayment()
 expect(w.emitted('submit-payment')).toBeUndefined()
 w.destroy()
})
test.each(['en','th'])('%s checkout with unavailable items disables confirm and never emits create',async locale=>{
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>850}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}})
 const w=mount(Shipping,{localVue,store,propsData:{hasReservedItems:true},mocks:{$i18n:{locale}},stubs:['CIcon']})
 await w.setData({form:{name:'QA Buyer',email:'buyer@example.test',telephone:'0800000000',bill:'QA Bill',shipping:'QA Shipping'}})
 expect(w.find('button.btn-main').element.disabled).toBe(true)
 w.vm.handleProceedToPayment()
 expect(w.emitted('create-order')).toBeUndefined()
 w.destroy()
})
test('typed shipping fields are submitted through the real CoreUI controls',async()=>{
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>1025}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}})
 global.alert=jest.fn()
 const w=mount(Shipping,{localVue,store,mocks:{$i18n:{locale:'th'}},stubs:['CIcon']})
 await w.vm.$nextTick()
 const inputs=w.findAll('input');await inputs.at(0).setValue('QA Buyer');await inputs.at(1).setValue('buyer@example.test');await inputs.at(2).setValue('0800000000')
 await w.findAll('textarea').at(0).setValue('QA bill address');await w.findAll('textarea').at(1).setValue('QA shipping address')
 await w.find('button').trigger('click')
 expect(global.alert).not.toHaveBeenCalled()
 expect(w.emitted('create-order')[0][0]).toMatchObject({name:'QA Buyer',email:'buyer@example.test',shipping:'QA shipping address'})
 w.destroy()
})

test('missing shipping information shows an inline accessible error without a blocking alert',async()=>{
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>1025}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}})
 global.alert=jest.fn()
 const w=mount(Shipping,{localVue,store,mocks:{$i18n:{locale:'th'}},stubs:['CIcon']})
 await w.find('button').trigger('click')
 expect(w.find('[role="alert"]').text()).toBe('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน')
 expect(w.emitted('create-order')).toBeUndefined()
 expect(global.alert).not.toHaveBeenCalled()
 w.destroy()
})

test.each(['qa-invalid-email','bad @example.test','a'.repeat(250)+'@example.test'])('invalid checkout email is blocked before create/update: %s', email=>{
 const vm={formError:'',form:{name:'QA Buyer',email,shipping:'QA address'},$i18n:{locale:'th'},
  $store:{getters:{'auth/userId':'qa'}},$emit:jest.fn()}
 Shipping.methods.handleProceedToPayment.call(vm)
 expect(vm.$emit).not.toHaveBeenCalled()
 expect(Shipping.computed.formErrorMessage.call(vm)).toBe('กรุณาระบุอีเมลให้ถูกต้อง')
})

test.each([
 [{name:'',email:'buyer@example.test',shipping:'QA address'},'กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน'],
 [{name:'QA Buyer',email:'invalid',shipping:'QA address'},'กรุณาระบุอีเมลให้ถูกต้อง']
])('visible validation follows a language change without resubmitting',async(form,thaiMessage)=>{
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>0}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}})
 const locale=localVue.observable({locale:'en'})
 const w=mount(Shipping,{localVue,store,mocks:{$i18n:locale},stubs:['CIcon']})
 await w.setData({form})
 await w.find('button').trigger('click')
 expect(w.find('[role="alert"]').text()).toMatch(/^Please/)
 locale.locale='th';await w.vm.$nextTick()
 expect(w.find('[role="alert"]').text()).toBe(thaiMessage)
 expect(w.emitted('create-order')).toBeUndefined()
 w.destroy()
})
