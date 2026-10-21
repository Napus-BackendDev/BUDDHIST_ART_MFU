import {shallowMount} from '@vue/test-utils'
import Profile from '@/views/User/index.vue'

const state=()=>({profileLoading:false,profileLoadError:false,fetchProfile:jest.fn().mockResolvedValue(true),$store:{dispatch:jest.fn().mockResolvedValue([])}})

test('missing profile and failed order reads are recoverable without rejecting the load handler',async()=>{
 const vm=state();vm.fetchProfile.mockResolvedValueOnce(false)
 await expect(Profile.methods.loadProfile.call(vm)).resolves.toBeUndefined()
 expect(vm.profileLoadError).toBe(true);expect(vm.profileLoading).toBe(false)
 vm.fetchProfile.mockResolvedValueOnce(true);vm.$store.dispatch.mockRejectedValueOnce(new Error('offline'))
 await expect(Profile.methods.loadProfile.call(vm)).resolves.toBeUndefined()
 expect(vm.profileLoadError).toBe(true)
 await Profile.methods.loadProfile.call(vm)
 expect(vm.profileLoadError).toBe(false);expect(vm.profileLoading).toBe(false)
})

test('pending profile retry ignores repeated requests',async()=>{
 const vm=state();let finish;vm.fetchProfile=jest.fn(()=>new Promise(r=>{finish=r}))
 const pending=Profile.methods.loadProfile.call(vm)
 await Profile.methods.loadProfile.call(vm)
 expect(vm.fetchProfile).toHaveBeenCalledTimes(1)
 finish(true);await pending;expect(vm.profileLoading).toBe(false)
})

test.each([['en','Unable to load your profile and orders. Please try again.','Try again'],['th','โหลดโปรไฟล์และคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่','ลองใหม่']])('failed initial %s load shows retry instead of fake empty user and order statistics',(locale,message,retry)=>{
 const w=shallowMount({...Profile,created(){}},{data:()=>({profileLoadError:true}),computed:{userId:()=> 'buyer',users:()=>[],allOrders:()=>[]},mocks:{$i18n:{locale},$store:{getters:{}}},stubs:{CContainer:{template:'<div><slot/></div>'},CIcon:true}})
 try{
  expect(w.find('[role="alert"]').text()).toContain(message)
  expect(w.find('[role="alert"] button').text()).toBe(retry)
  expect(w.text()).not.toContain('User Name')
  expect(w.find('.stat-card').exists()).toBe(false)
 }finally{w.destroy()}
})
