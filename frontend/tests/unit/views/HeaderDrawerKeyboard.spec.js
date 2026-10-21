import {createLocalVue,mount} from '@vue/test-utils'
import Vuex from 'vuex'
import CoreuiVue from '@coreui/vue-pro'
import Header from '@/containers/page/TheHeader.vue'
import i18nMixin from '@/mixins/i18nMixin'

const mountHeader=(items=[])=>{
 const localVue=createLocalVue();localVue.use(Vuex);localVue.use(CoreuiVue);localVue.mixin(i18nMixin)
 const store=new Vuex.Store({modules:{cart:{
  namespaced:true,state:{open:false,items},
  getters:{isCartOpen:s=>s.open,cartItems:s=>s.items,cartCount:s=>s.items.length,cartTotal:()=>0},
  mutations:{open(s,v){s.open=v},remove(s,id){s.items=s.items.filter(i=>i._id!==id)}},
  actions:{setShowCart({commit},v){commit('open',v)},removeFromCart({commit},id){commit('remove',id)}}
 }}})
 const w=mount({...Header,created(){}},{localVue,store,attachToDocument:true,computed:{userId:()=> 'qa-customer'},methods:{refreshCartStatuses:jest.fn()},mocks:{$i18n:{locale:'en'},$t:k=>k,$route:{path:'/user/profile'},$router:{push:jest.fn()}},stubs:{CIcon:true,'router-link':true}})
 return {w,store}
}
beforeEach(()=>jest.useFakeTimers())
afterEach(()=>{jest.clearAllTimers();jest.useRealTimers()})

test.each([['cart','Open cart','Close cart','#shopping-cart-panel'],['navigation','Open navigation menu','Close navigation menu','.mobile-menu-content']])('%s panel receives focus, traps both Tab edges and closes on Escape',async(kind,openName,closeName,selector)=>{
 const {w,store}=mountHeader()
 try{
  const opener=w.find(`button[aria-label="${openName}"]`);opener.element.focus();await opener.trigger('click');await w.vm.$nextTick()
  const panel=w.find(selector)
  expect(panel.attributes('role')).toBe('dialog');expect(panel.attributes('aria-modal')).toBe('true');expect(document.activeElement).toBe(panel.element)
  await panel.trigger('keydown',{key:'Tab'})
  const controls=panel.findAll('button,a[href]').wrappers.filter(x=>!x.element.disabled),first=controls[0],last=controls[controls.length-1]
  expect(document.activeElement).toBe(first.element)
  first.element.focus();await first.trigger('keydown',{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(last.element)
  await last.trigger('keydown',{key:'Tab'});expect(document.activeElement).toBe(first.element)
  await panel.find(`button[aria-label="${closeName}"]`).trigger('keydown',{key:'Escape'});await w.vm.$nextTick()
  expect(kind==='cart'?store.getters['cart/isCartOpen']:w.vm.mobileMenu).toBe(false)
  expect(document.activeElement).toBe(opener.element)
 }finally{w.destroy()}
})

test('opening a drawer closes the other drawer and account menu',async()=>{
 const {w,store}=mountHeader()
 try{
  await w.setData({mobileMenu:true,accountMenu:true});await store.dispatch('cart/setShowCart',true);await w.vm.$nextTick()
  expect(w.vm.mobileMenu).toBe(false);expect(w.vm.accountMenu).toBe(false)
  await w.setData({mobileMenu:true});await w.vm.$nextTick()
  expect(store.getters['cart/isCartOpen']).toBe(false)
  expect(document.activeElement).toBe(w.find('.mobile-menu-content').element)
 }finally{w.destroy()}
})

test('removing the focused last item keeps keyboard focus inside the open cart',async()=>{
 const {w,store}=mountHeader([{_id:'qa-item',title:[{key:'en',value:'QA item'}],price:1004}])
 try{
  await w.find('button[aria-label="Open cart"]').trigger('click');await w.vm.$nextTick()
  const remove=w.find('button[aria-label="Remove from cart: QA item"]');remove.element.focus();await remove.trigger('click');await w.vm.$nextTick()
  expect(store.getters['cart/cartCount']).toBe(0)
  expect(document.activeElement).toBe(w.find('#shopping-cart-panel').element)
 }finally{w.destroy()}
})
