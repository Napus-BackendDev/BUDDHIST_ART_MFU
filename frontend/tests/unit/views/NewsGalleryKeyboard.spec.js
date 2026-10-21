import {createLocalVue,shallowMount} from '@vue/test-utils'
import News from '@/views/page/NewsDetail.vue'
import i18nMixin from '@/mixins/i18nMixin'

const mountGallery=(locale='en',images=['one.png','two.png'])=>{
 const localVue=createLocalVue();localVue.mixin(i18nMixin)
 return shallowMount({...News,created(){},watch:{}},{localVue,attachToDocument:true,
  data:()=>({loading:false,currentNews:{title:[{key:'en',value:'QA Gallery'},{key:'th',value:'ภาพข่าว QA'}],description:[],images}}),
  mocks:{$i18n:{locale},$store:{getters:{}}},stubs:{CContainer:{template:'<main><slot/></main>'},CRow:{template:'<div><slot/></div>'},CCol:{template:'<div><slot/></div>'},CIcon:true,CButton:true}})
}

test.each(['th','en'])('gallery opens from named native button, traps focus, navigates and restores opener (%s)',async locale=>{
 const w=mountGallery(locale)
 try{
  const opener=w.find('button.gallery-open');expect(opener.exists()).toBe(true)
  expect(opener.attributes('aria-label')).toContain(locale==='en'?'View image 1':'ดูภาพที่ 1')
  opener.element.focus();await opener.trigger('click');await w.vm.$nextTick()
  const dialog=w.find('[role="dialog"]'),close=dialog.find('.lightbox-close'),next=dialog.find('.lightbox-next')
  expect(document.activeElement).toBe(close.element);expect(document.body.style.overflow).toBe('hidden')
  await close.trigger('keydown',{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(next.element)
  await next.trigger('keydown',{key:'Tab'});expect(document.activeElement).toBe(close.element)
  await close.trigger('keydown',{key:'ArrowRight'});expect(w.vm.selectedIndex).toBe(1)
  await close.trigger('keydown',{key:'ArrowRight'});expect(w.vm.selectedIndex).toBe(0)
  await close.trigger('keydown',{key:'ArrowLeft'});expect(w.vm.selectedIndex).toBe(1)
  await close.trigger('keydown',{key:'Escape'});await w.vm.$nextTick()
  expect(w.find('[role="dialog"]').exists()).toBe(false);expect(document.activeElement).toBe(opener.element)
  expect(document.body.style.overflow).toBe('')
 }finally{w.destroy();document.body.style.overflow=''}
})

test('single image retains focus on its only close control and preserves previous scroll lock',async()=>{
 const w=mountGallery('en',['one.png']);document.body.style.overflow='auto'
 try{
  await w.find('button.gallery-open').trigger('click');await w.vm.$nextTick()
  const close=w.find('.lightbox-close');expect(w.find('.lightbox-nav').exists()).toBe(false)
  await close.trigger('keydown',{key:'Tab'});expect(document.activeElement).toBe(close.element)
  await close.trigger('click');expect(document.body.style.overflow).toBe('auto')
 }finally{w.destroy();document.body.style.overflow=''}
})
