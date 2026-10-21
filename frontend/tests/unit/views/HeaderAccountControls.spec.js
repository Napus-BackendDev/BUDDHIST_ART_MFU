import { createLocalVue, mount } from '@vue/test-utils'
import CoreuiVue from '@coreui/vue-pro'
import Header from '@/containers/page/TheHeader.vue'

test.each([['en','Account menu'],['th','เมนูบัญชี']])('account menu is named and restores focus on Escape in %s',async(locale,label)=>{
 const localVue=createLocalVue();localVue.use(CoreuiVue)
 const wrapper=mount({...Header,created(){},data(){return {...Header.data(),isLoggedIn:true,userRole:'customer'}}},{
  localVue,attachToDocument:true,
  computed:{cartItems:()=>[],cartCount:()=>0,cartTotal:()=>0,isCartOpen:()=>false,userId:()=> 'qa-customer'},
  mocks:{$i18n:{locale},$t:key=>key,$route:{path:'/user/order'},$router:{push:jest.fn()},$store:{getters:{},dispatch:jest.fn()}},
  stubs:{CIcon:true,'router-link':true}
 })
 try {
  const trigger=wrapper.find(`button[aria-label="${label}"]`)
  expect(trigger.exists()).toBe(true)
  expect(trigger.attributes('type')).toBe('button')
  expect(trigger.attributes('aria-haspopup')).toBe('true')
  expect(trigger.attributes('aria-expanded')).toBe('false')
  await trigger.trigger('click')
  expect(trigger.attributes('aria-expanded')).toBe('true')
  const item=wrapper.find('.dropdown-item')
  item.element.focus()
  await item.trigger('keydown',{key:'Escape'})
  await wrapper.vm.$nextTick()
  expect(trigger.attributes('aria-expanded')).toBe('false')
  expect(wrapper.find('.dropdown-menu').classes()).not.toContain('show')
  expect(document.activeElement).toBe(trigger.element)
 }finally{wrapper.destroy()}
})

test.each([new Error('offline'), {response:{status:429}}])('a failed avatar read does not present a valid session as logged out: %p',async error=>{
 const storage=jest.spyOn(Storage.prototype,'getItem').mockReturnValue(JSON.stringify({xAccessToken:'unit-only-session',accounts:'qa-customer',role:'Customer'}))
 const vm={isLoggedIn:false,userRole:'',userImage:'', $store:{dispatch:jest.fn().mockRejectedValue(error)}}
 try{await Header.methods.checkLoginStatus.call(vm);expect(vm.isLoggedIn).toBe(true);expect(vm.userRole).toBe('customer')}finally{storage.mockRestore()}
})
test.each([null,'invalid JSON'])('missing or invalid session still shows sign in: %p',async saved=>{
 const storage=jest.spyOn(Storage.prototype,'getItem').mockReturnValue(saved)
 const vm={isLoggedIn:true,userRole:'admin',userImage:'old-avatar',$store:{dispatch:jest.fn()}}
 try{await Header.methods.checkLoginStatus.call(vm);expect(vm.isLoggedIn).toBe(false);expect(vm.userRole).toBe('');expect(vm.userImage).toBe('');expect(vm.$store.dispatch).not.toHaveBeenCalled()}finally{storage.mockRestore()}
})
