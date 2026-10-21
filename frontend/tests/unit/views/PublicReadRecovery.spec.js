import {shallowMount} from '@vue/test-utils'
import News from '@/views/page/News.vue'
import HomeNews from '@/views/page/components/SectionNews.vue'
import Featured from '@/views/page/components/SectionFeaturedHome.vue'
import Showcase from '@/views/page/components/SectionStudentShowcase.vue'

const pages=[['news',News,'fetchNews'],['home news',HomeNews,'loadNews'],['featured',Featured,'fetchArtworks'],['showcase',Showcase,'fetchArtworks']]

test.each(pages)('%s catches failed reads and retries without reporting a successful empty result',async(name,page,method)=>{
 const read=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([])
 const vm={...page.data(),$store:{dispatch:read},fetchNews:read}
 await expect(page.methods[method].call(vm)).resolves.toBeUndefined()
 expect(vm.loadError).toBe(true);expect(vm.loading).toBe(false)
 await page.methods[method].call(vm)
 expect(vm.loadError).toBe(false);expect(vm.loading).toBe(false)
})

for(const [name,page] of pages)test.each(['th','en'])('%s failed-read state exposes localized Retry and hides unverified cards',async locale=>{
 const w=shallowMount({...page,created(){},mounted(){}},{data:()=>({loading:false,loadError:true}),mocks:{$i18n:{locale},$store:{getters:{}}},
  stubs:{CContainer:{template:'<main><slot/></main>'},CRow:{template:'<div><slot/></div>'},CCol:{template:'<div><slot/></div>'},CIcon:true,CButton:true}})
 try{
  expect(w.find('[role="alert"]').exists()).toBe(true)
  expect(w.find('[role="alert"] button').text()).toBe(locale==='en'?'Try again':'ลองใหม่')
  expect(w.find('cardnew-stub').exists()).toBe(false);expect(w.find('cardartworks-stub').exists()).toBe(false)
 }finally{w.destroy()}
})

test('featured polling failure is caught, concurrent polling ignored, and later success clears its warning',async()=>{
 let finish;const read=jest.fn(()=>new Promise(r=>{finish=r}))
 const vm={...Featured.data(),$store:{dispatch:read},loading:false}
 const pending=Featured.methods.fetchArtworks.call(vm,true)
 await Featured.methods.fetchArtworks.call(vm,true)
 expect(read).toHaveBeenCalledTimes(1);finish([]);await pending
 read.mockRejectedValueOnce(new Error('offline'))
 await expect(Featured.methods.fetchArtworks.call(vm,true)).resolves.toBeUndefined()
 expect(vm.loadError).toBe(true)
 read.mockResolvedValueOnce([]);await Featured.methods.fetchArtworks.call(vm,true)
 expect(vm.loadError).toBe(false)
})
