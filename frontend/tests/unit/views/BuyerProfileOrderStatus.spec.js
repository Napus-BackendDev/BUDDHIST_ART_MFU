import Profile from '@/views/User/index.vue'
import Orders from '@/views/User/order.vue'
import Container from '@/containers/page/TheContainer.vue'
import OrderModal from '@/views/User/components/modal/OrderModal.vue'
import ArtistProfile from '@/views/Artist/Profile.vue'
import {statusBadgeMixin} from '@/mixins/statusBadgeMixin'
import { mount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const context=(code,locale)=>({userId:'buyer',allOrders:[{_id:'123456789012345678901234',user:'buyer',createdAt:new Date().toISOString(),status:{code,title:[{key:'en',value:'Renamed status'}]},artwork:[],image:''}],$i18n:{locale},getName:statusBadgeMixin.methods.getName,calculateTimeLeft:()=>'-'})

test.each(['APPROVED','RESERVED','PENDING','REJECTED','CANCELLED'])('buyer and artist history certificate gates follow canonical %s', code => {
 const vm=context(code,'en'),order=vm.allOrders[0]
 order.status.title[0].value=code==='APPROVED'?'QA confirmed collection':'Approved'
 expect(Orders.methods.isApprovedOrder.call(vm,order)).toBe(code==='APPROVED')
 expect(ArtistProfile.methods.isApprovedOrder.call(vm,order)).toBe(code==='APPROVED')
})

test.each(['APPROVED', 'REJECTED', 'CANCELLED'])('global payment reminder excludes terminal code %s after its title changes', code => {
 const vm = context(code, 'en')
 expect(Container.methods.isPendingPaymentOrder.call(vm, vm.allOrders[0])).toBe(false)
})

test('global payment reminder follows RESERVED code even if its edited label says Completed', () => {
 const vm = context('RESERVED', 'en')
 vm.allOrders[0].status.title[0].value = 'Completed label'
 expect(Container.methods.isPendingPaymentOrder.call(vm, vm.allOrders[0])).toBe(true)
 expect(Container.methods.isPendingPaymentOrder.call(vm, {...vm.allOrders[0], image: 'qa-slip.png'})).toBe(false)
})

test.each([
 ['RESERVED', new Date(Date.now() - 25 * 3600000).toISOString()],
 ['RESERVED', 'invalid'],
 ['PENDING', new Date().toISOString()]
])('global reminder does not offer payment for %s at %s', (code, createdAt) => {
 const vm = context(code, 'en')
 vm.allOrders[0].createdAt = createdAt
 expect(Container.methods.isPendingPaymentOrder.call(vm, vm.allOrders[0])).toBe(false)
})

test('payment reminder disappears at its deadline without a route change or reload', async () => {
 jest.useFakeTimers()
 jest.clearAllTimers()
 let now = Date.now()
 const clock = jest.spyOn(Date, 'now').mockImplementation(() => now)
 const order = context('RESERVED', 'en').allOrders[0]
 order.createdAt = new Date(now - 24 * 3600000 + 1000).toISOString()
 const localVue = createLocalVue(); localVue.use(VueRouter)
 const router = new VueRouter({mode:'abstract',routes:[{path:'/contact',component:{render:h=>h('div')}}]}); router.push('/contact')
 const wrapper = mount({...Container, methods: {...Container.methods, getName: statusBadgeMixin.methods.getName}}, {
  localVue,router,
  mocks: {$i18n: {locale:'en'}, $store: {state:{darkMode:false}, getters: {'auth/userId':'buyer','order/orders':[order]}, dispatch:jest.fn().mockResolvedValue({})}},
  stubs: {CWrapper:{template:'<div><slot/></div>'},CIcon:true,TheHeaderUser:true,TheFooterUser:true,CenterLoading:true,SignIn:true,TwoFA:true,'router-view':true}
 })
 try {
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  now += 2000
  jest.advanceTimersByTime(2000)
  await wrapper.vm.$nextTick()
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
 } finally {wrapper.destroy(); clock.mockRestore(); jest.useRealTimers()}
})

test('opening order details refreshes its clock immediately and releases the timer on destruction', () => {
 jest.useFakeTimers()
 jest.clearAllTimers()
 const current = Date.now(), clock = jest.spyOn(Date, 'now').mockReturnValue(current)
 const vm = {now:current - 60000,timer:null,stopTimer:OrderModal.methods.stopTimer}
 try {
  OrderModal.methods.startTimer.call(vm)
  expect(vm.now).toBe(current)
  OrderModal.beforeDestroy.call(vm)
  expect(jest.getTimerCount()).toBe(0)
 } finally {OrderModal.methods.stopTimer.call(vm);clock.mockRestore();jest.useRealTimers()}
})

test.each([['APPROVED','th','อนุมัติ'],['APPROVED','en','Approved'],['REJECTED','th','ปฏิเสธ'],['REJECTED','en','Rejected'],['CANCELLED','th','ยกเลิก'],['CANCELLED','en','Cancelled']])('buyer profile and history preserve %s in %s despite a renamed title',(code,locale,label)=>{
 const vm=context(code,locale)
 expect(Profile.computed.orders.call(vm)[0].statusName).toBe(label)
 expect(Orders.computed.processedOrders.call(vm)[0].statusName).toBe(label)
})

test.each(['APPROVED','REJECTED','CANCELLED'])('terminal %s does not reappear as a pending-payment card when its title changes',code=>{
 const vm=context(code,'th');vm.orders=Profile.computed.orders.call(vm);vm.now=Date.now()
 expect(Profile.computed.pendingPaymentOrders.call(vm)).toEqual([])
})

test.each(['อนุมัติ','อนุมัติแล้ว'])('Thai approved badge %s uses the completed style',label=>{
 expect(statusBadgeMixin.methods.getStatusBadge.call({$i18n:{locale:'th'}},label)).toMatchObject({class:'badge-completed',icon:'cil-check-circle'})
})
