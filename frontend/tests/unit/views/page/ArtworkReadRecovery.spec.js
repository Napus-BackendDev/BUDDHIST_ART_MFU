import {shallowMount} from '@vue/test-utils'
import Detail from '@/views/page/ArtworkDetail.vue'

const id='6ad20f9871c478273a1e57b7'
const state=()=>({...Detail.data(),loading:false,allArtworks:[],$route:{params:{id}},$store:{dispatch:jest.fn().mockResolvedValue(null)},$refs:{},$nextTick:fn=>fn(),getName:()=>''})

test('failed initial read is distinct from missing and can retry the same artwork',async()=>{
 const vm=state();vm.$store.dispatch.mockImplementation(type=>type==='artwork/explore'?Promise.reject(new Error('offline')):Promise.resolve([]))
 await Detail.methods.fetchArtwork.call(vm)
 expect(vm.loadError).toBe(true);expect(vm.loading).toBe(false)
 vm.$store.dispatch.mockImplementation(type=>Promise.resolve(type==='artwork/explore'?{_id:id}:[]))
 await Detail.methods.fetchArtwork.call(vm)
 expect(vm.artwork._id).toBe(id);expect(vm.loadError).toBe(false)
})

test('refresh failures retain last loaded artwork, while a confirmed 404 clears it',async()=>{
 const vm=state();vm.artwork={_id:id}
 vm.$store.dispatch.mockRejectedValue(new Error('offline'))
 await Detail.methods.fetchArtwork.call(vm,true)
 expect(vm.artwork._id).toBe(id);expect(vm.loadError).toBe(true)
 vm.$store.dispatch.mockRejectedValue({response:{status:404}})
 await Detail.methods.fetchArtwork.call(vm,true)
 expect(vm.artwork).toBeNull();expect(vm.loadError).toBe(false)
})

test('catalogue read failure preserves the primary artwork and remains visible until the catalogue retry succeeds',async()=>{
 const vm=state()
 vm.$store.dispatch.mockImplementation(type=>type==='artwork/get'?Promise.reject({response:{status:404}}):Promise.resolve({_id:id}))
 await Detail.methods.fetchArtwork.call(vm)
 expect(vm.artwork._id).toBe(id);expect(vm.loadError).toBe(true)
 await Detail.methods.fetchArtwork.call(vm,true)
 expect(vm.loadError).toBe(true)
 vm.$store.dispatch.mockResolvedValue({_id:id})
 await Detail.methods.fetchArtwork.call(vm)
 expect(vm.loadError).toBe(false)
})

test('late requests cannot overwrite a new route, and duplicate polling is ignored',async()=>{
 const vm=state();let finish
 vm.$store.dispatch.mockImplementation(type=>type==='artwork/explore'?new Promise(r=>{finish=r}):Promise.resolve([]))
 const old=Detail.methods.fetchArtwork.call(vm,true)
 await Detail.methods.fetchArtwork.call(vm,true)
 expect(vm.$store.dispatch).toHaveBeenCalledTimes(1)
 vm.$route.params.id='6ad20f9871c478273a1e57b8'
 vm.$store.dispatch.mockImplementation(type=>Promise.resolve(type==='artwork/explore'?{_id:vm.$route.params.id}:[]))
 await Detail.methods.fetchArtwork.call(vm)
 finish({_id:id});await old
 expect(vm.artwork._id).toBe(vm.$route.params.id)
})

test.each([null,'{invalid-json'])('missing or malformed preview does not leave an endless spinner (%p)',async value=>{
 const vm=state();vm.$route.params.id='preview';vm.loading=true
 if(value===null)sessionStorage.removeItem('artwork_preview');else sessionStorage.setItem('artwork_preview',value)
 try{
  await expect(Detail.methods.fetchArtwork.call(vm)).resolves.toBeUndefined()
  expect(vm.loading).toBe(false);expect(vm.artwork).toBeNull()
  expect(vm.loadError).toBe(value!==null)
  expect(vm.$store.dispatch).not.toHaveBeenCalled()
 }finally{sessionStorage.removeItem('artwork_preview')}
})

test.each(['th','en'])('read-error view provides localized Retry without declaring missing (%s)',locale=>{
 const w=shallowMount({...Detail,mounted(){}},{data:()=>({loading:false,loadError:true,artwork:null}),mocks:{$i18n:{locale},$store:{getters:{'artwork/artworks':[],'cart/isInCart':()=>false}}},stubs:{CContainer:{template:'<main><slot/></main>'},CIcon:true,CModal:true}})
 try{
  expect(w.find('[role="alert"] button').text()).toBe(locale==='en'?'Try again':'ลองใหม่')
  expect(w.find('.not-found-premium').exists()).toBe(false)
 }finally{w.destroy()}
})
