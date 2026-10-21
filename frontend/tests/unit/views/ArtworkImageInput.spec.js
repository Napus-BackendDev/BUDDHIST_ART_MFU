import { shallowMount } from '@vue/test-utils'
import Edit from '@/views/Admin/components/modal/artwork/ArtworkEditModal.vue'

test('edit image label opens its own file input rather than the create form input',()=>{
 const wrapper=shallowMount(Edit,{mocks:{$i18n:{locale:'th'},$store:{getters:{'user/user':[]}}},methods:{fetchInitialData:jest.fn()},stubs:{CButton:true,CCol:true,CDropdown:true,CDropdownItem:true,CDropdownMenu:true,CIcon:true,CInput:true,CRow:true,CSpinner:true,CTextarea:true,CModal:{template:'<div><slot/><slot name="footer"/></div>'}}})
 const label=wrapper.find('label.file-upload-label')
 const input=wrapper.find('input[type="file"]')
 expect(label.element.htmlFor).toBe(input.element.id)
 wrapper.destroy()
})

import Create from '@/views/Admin/components/modal/artwork/ArtworkCreateModal.vue'

describe.each([['create',Create],['edit',Edit]])('%s image replacement',(_,Component)=>{
 beforeEach(()=>{URL.createObjectURL=jest.fn(()=> 'new-preview');URL.revokeObjectURL=jest.fn();global.alert=jest.fn()})
 const vm=()=>({imagePreview:'old-preview',imageError:'',isProcessingImage:false,form:{image:'old-file'},$i18n:{locale:'th'},compressImage:jest.fn()})
 test('failed decoding retains the previous valid image and shows an inline error',async()=>{
  const state=vm();state.compressImage.mockRejectedValue(new Error('Invalid image'))
  await Component.methods.handleFileUpload.call(state,{target:{files:[new File(['bad'],'bad.png',{type:'image/png'})],value:'fake'}})
  expect(state.imagePreview).toBe('old-preview');expect(state.form.image).toBe('old-file');expect(state.imageError).toBeTruthy();expect(state.isProcessingImage).toBe(false)
 })
 test('does not replace the preview until processing succeeds',async()=>{
  const state=vm();let finish;state.compressImage.mockReturnValue(new Promise(resolve=>{finish=resolve}))
  const work=Component.methods.handleFileUpload.call(state,{target:{files:[new File(['image'],'valid.png',{type:'image/png'})],value:'fake'}})
  expect(state.isProcessingImage).toBe(true);expect(state.imagePreview).toBe('old-preview')
  const file=new File(['decoded'],'valid.jpg',{type:'image/jpeg'});finish(file);await work
  expect(state.form.image).toBe(file);expect(state.imagePreview).toBe('new-preview');expect(state.isProcessingImage).toBe(false)
 })
 test.each([['image/png',5*1024*1024+1],['image/svg+xml',20]])('rejects unsupported type or oversize before processing',async(type,size)=>{
  const state=vm();const event={target:{files:[new File([new Uint8Array(size)],'invalid.png',{type})],value:'fake'}}
  await Component.methods.handleFileUpload.call(state,event)
  expect(state.compressImage).not.toHaveBeenCalled();expect(state.imageError).toBeTruthy();expect(state.imagePreview).toBe('old-preview');expect(event.target.value).toBe('')
 })
})
