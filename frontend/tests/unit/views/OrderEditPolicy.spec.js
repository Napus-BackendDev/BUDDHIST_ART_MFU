import { mount, createLocalVue } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Editor from '@/views/Admin/components/modal/order/OrderEditModal.vue'

test.each(['en','th'].flatMap(locale => [
  ['APPROVED','qa-slip.png',false], ['PENDING','qa-slip.png',false], ['REJECTED','',false], ['RESERVED','',true]
].map(([code,image,upload]) => [locale,code,image,upload])))('%s %s saved artwork selection is fixed; slip upload=%s',async(locale,code,image,upload)=>{
  const localVue=createLocalVue();localVue.use(Coreui)
  const order={_id:'qa-order',contact:{name:'QA Buyer'},address:{},artwork:[{_id:'qa-art',price:1000,title:[{key:'en',value:'QA Artwork'}]}],
    status:{code,title:[{key:'en',value:code[0]+code.slice(1).toLowerCase()}]},image,createdAt:new Date().toISOString()}
  const wrapper=mount(Editor,{localVue,propsData:{show:false,order},mocks:{$i18n:{locale},$store:{getters:{},dispatch:jest.fn().mockResolvedValue([])}},
    stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CIcon:true,LoadingButton:true}})
  await wrapper.setProps({show:true})
  const fields = wrapper.findAll('input:not([type="file"]), select, textarea')
  expect(fields.length).toBe(7)
  for (const field of fields.wrappers) expect(field.element.labels.length).toBeGreaterThan(0)
  expect(wrapper.find('.close-btn').attributes('aria-label')).toBe(locale === 'en' ? 'Close' : 'ปิด')
  expect(wrapper.find('.search-box-container').exists()).toBe(false)
  expect(wrapper.find('.btn-remove').exists()).toBe(false)
  expect(wrapper.find('input[type="file"]').exists()).toBe(upload)
  expect(wrapper.find('.preview-overlay').exists()).toBe(false)
  wrapper.vm.handleSave()
  expect(wrapper.emitted('save')[0][0].artwork).toBeUndefined()
  wrapper.destroy()
})

test('an expired unpaid reservation cannot attach a slip from the admin editor',()=>{
  const vm={order:{_id:'qa',status:{code:'RESERVED'},image:'',createdAt:new Date(Date.now()-25*3600000).toISOString()},getName:()=> 'Reserved'}
  expect(Editor.computed.canUploadImage.call(vm)).toBe(false)
})
