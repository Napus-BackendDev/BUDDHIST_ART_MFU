import {mount,createLocalVue} from '@vue/test-utils'
import Vuex from 'vuex'
import Coreui from '@coreui/vue-pro'
import Summary from '@/views/page/components/card/CardOrderSummary.vue'
const localVue=createLocalVue();localVue.use(Vuex);localVue.use(Coreui)

test.each([null,{_id:'order',createdAt:'2026-10-17T11:00:00.000Z'}])('checkout shows a reservation timer only from the saved order creation time (%j)',async createdOrder=>{
 const clock=jest.spyOn(Date,'now').mockReturnValue(Date.parse('2026-10-17T12:00:00.000Z'))
 const items=[{_id:'art',title:[{key:'en',value:'QA Artwork'}],price:0,addedAt:Date.parse('2026-10-17T01:00:00.000Z')}]
 const store=new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartItems:()=>items,cartTotal:()=>0,cartShippingCost:()=>0,cartFinalTotal:()=>0}}}})
 const w=mount(Summary,{localVue,store,propsData:{createdOrder},mocks:{$i18n:{locale:'en'}},stubs:['CIcon']})
 try{
  const timer=w.find('.cart-item-timer')
  if(createdOrder)expect(timer.text()).toBe('23:00:00')
  else expect(timer.exists()).toBe(false)
 }finally{w.destroy();clock.mockRestore()}
})

test.each(['th','en'])('checkout removal identifies the artwork and does not submit the enclosing form (%s)', async locale => {
 const titles = [
  [{key:'th',value:'ผลงาน ก'},{key:'en',value:'Artwork A'}],
  [{key:'th',value:'ผลงาน ข'},{key:'en',value:'Artwork B'}]
 ]
 const remove = jest.fn()
 const items = titles.map((title,index)=>({_id:`art-${index}`,title,price:100,image:'/qa.png'}))
 const store = new Vuex.Store({modules:{cart:{namespaced:true,actions:{removeFromCart:remove},getters:{cartItems:()=>items,cartTotal:()=>200,cartShippingCost:()=>0,cartFinalTotal:()=>200}}}})
 const w = mount(Summary,{localVue,store,mocks:{$i18n:{locale}},stubs:['CIcon']})
 try {
  const title = locale === 'en' ? 'Artwork B' : 'ผลงาน ข'
  const label = locale === 'en' ? `Remove from cart: ${title}` : `ลบออกจากตะกร้า: ${title}`
  const button = w.find(`button[aria-label="${label}"]`)
  expect(button.exists()).toBe(true)
  expect(button.attributes('type')).toBe('button')
  expect(w.findAll('img').at(1).attributes('alt')).toBe(title)
  await button.trigger('click')
  expect(remove).toHaveBeenCalledTimes(1)
  expect(remove.mock.calls[0][1]).toBe('art-1')
 } finally { w.destroy() }
})
