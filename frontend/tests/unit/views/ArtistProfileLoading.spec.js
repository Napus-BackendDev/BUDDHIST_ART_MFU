import {shallowMount} from '@vue/test-utils'
import Profile from '@/views/Artist/Profile.vue'

const state=()=>({profileUserId:'artist',profileRequest:0,profileLoading:false,profileLoadError:false,profileNotFound:false,form:null,
 $route:{params:{id:'artist'}},$store:{dispatch:jest.fn().mockResolvedValue(null)},$nextTick:fn=>fn(),$refs:{}})

test('missing and failed profiles clear stale content and allow retry',async()=>{
 const vm=state();vm.form={_id:'previous'}
 await Profile.methods.fetchProfile.call(vm)
 expect(vm.form).toBeNull();expect(vm.profileNotFound).toBe(true)
 vm.$store.dispatch.mockRejectedValueOnce(new Error('offline'))
 await expect(Profile.methods.fetchProfile.call(vm)).resolves.toBeUndefined()
 expect(vm.profileLoadError).toBe(true);expect(vm.profileNotFound).toBe(false)
 vm.$store.dispatch.mockResolvedValue({_id:'artist',name:[]})
 await Profile.methods.fetchProfile.call(vm)
 expect(vm.profileLoadError).toBe(false);expect(vm.profileLoading).toBe(false);expect(vm.form._id).toBe('artist')
})

test('a late response from the previous route cannot replace the current profile',async()=>{
 const vm=state();let finish
 vm.$store.dispatch.mockImplementationOnce(()=>new Promise(r=>{finish=r}))
 const old=Profile.methods.fetchProfile.call(vm)
 vm.profileUserId='next';vm.$store.dispatch.mockResolvedValue({_id:'next',name:[]})
 await Profile.methods.fetchProfile.call(vm)
 finish({_id:'artist',name:[]});await old
 expect(vm.form._id).toBe('next');expect(vm.profileUser._id).toBe('next');expect(vm.profileLoading).toBe(false)
})

test.each(['th','en'])('profile failure and missing states have visible localized recovery (%s)',async locale=>{
 const w=shallowMount({...Profile,created(){},watch:{}},{data:()=>({profileLoadError:true}),computed:{profileUserId:()=> 'missing',userId:()=>null,users:()=>[],allArtworks:()=>[],allOrders:()=>[]},mocks:{$i18n:{locale},$store:{getters:{}}},stubs:{CContainer:{template:'<div><slot/></div>'},RouterLink:true}})
 try{
  expect(w.find('[role="alert"]').text()).toContain(locale==='en'?'Unable to load':'โหลดโปรไฟล์ไม่สำเร็จ')
  expect(w.find('[role="alert"] button').text()).toBe(locale==='en'?'Try again':'ลองใหม่')
  w.setData({profileLoadError:false,profileNotFound:true});await w.vm.$nextTick()
  expect(w.text()).toContain(locale==='en'?'Artist profile not found':'ไม่พบโปรไฟล์ศิลปิน')
  w.setData({profileNotFound:false,profileLoading:true});await w.vm.$nextTick()
  expect(w.find('[role="status"]').text()).toContain(locale==='en'?'Loading':'กำลังโหลด')
 }finally{w.destroy()}
})
