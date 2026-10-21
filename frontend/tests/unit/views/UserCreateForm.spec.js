import { shallowMount } from '@vue/test-utils'
import Creator from '@/views/Admin/components/modal/user/UserCreateModal.vue'
import Choice from '@/views/Admin/components/modal/user/UserCreateChoiceModal.vue'
import Editor from '@/views/Admin/components/modal/user/UserEditModal.vue'

const mountForm=()=>shallowMount(Creator,{propsData:{show:true},mocks:{$i18n:{locale:'en'}},stubs:{CModal:{template:'<div><slot/><slot name="footer"/></div>'},CIcon:true}})
const customer={studentId:'QA-MANUAL-CUSTOMER',roleId:'qa-customer',roleNameEn:'Customer',nameTh:'ลูกค้าทดสอบ',nameEn:'',email:'',personalEmail:'qa-manual@example.test',telephone:'0800000099'}

test('customer validity uses only the visible name and personal email fields',async()=>{
 const w=mountForm();await w.setData({form:{...w.vm.form,...customer}})
 expect(Boolean(w.vm.isFormValid)).toBe(true)
 w.vm.handleSave();const payload=w.emitted('save')[0][0]
 expect(payload.name.find(n=>n.key==='en').value).toBe(customer.nameTh)
 expect(payload.contact.personalEmail).toBe(customer.personalEmail)
 expect(payload.contact.studentEmail).toBeUndefined()
 expect(payload.password).toBeUndefined()
 expect(w.find('input[type="password"]').exists()).toBe(false)
 w.destroy()
})
test('keeps the draft after emit so a failed request can retry; clears after closing',async()=>{
 const w=mountForm();await w.setData({form:{...w.vm.form,...customer,nameEn:'QA Customer',email:'qa-official@example.test'}})
 w.vm.handleSave()
 expect(w.vm.form.studentId).toBe(customer.studentId)
 expect(w.vm.form.personalEmail).toBe(customer.personalEmail)
 await w.setProps({show:false})
 expect(w.vm.form.studentId).toBe('');expect(w.vm.form.password).toBeUndefined()
 w.destroy()
})
test('artist still requires learner status and auto-generated official email',async()=>{
 const w=mountForm();await w.setData({form:{...w.vm.form,...customer,roleNameEn:'Artist',nameEn:'QA Artist'}})
 expect(Boolean(w.vm.isFormValid)).toBe(false)
 await w.setData({form:{...w.vm.form,statusId:'qa-new'}})
 expect(Boolean(w.vm.isFormValid)).toBe(true)
 expect(w.vm.officialEmail).toBe('qa-manual-customer@lamduan.mfu.ac.th')
 w.destroy()
})
test.each([['nameTh','   '],['personalEmail',''],['personalEmail','invalid-email']])('rejects missing or invalid visible customer %s',async(field,value)=>{
 const w=mountForm();await w.setData({form:{...w.vm.form,...customer,[field]:value}})
 expect(Boolean(w.vm.isFormValid)).toBe(false)
 w.destroy()
})
test('manual and import choices are native buttons and manual emits once',async()=>{
 const w=shallowMount(Choice,{mocks:{$i18n:{locale:'en'}},stubs:{CModal:{template:'<div><slot/></div>'},CIcon:true}})
 const buttons=w.findAll('button.choice-card')
 expect(buttons.length).toBe(2)
 expect(buttons.at(0).attributes('type')).toBe('button')
 await buttons.at(0).trigger('click')
 expect(w.emitted('manual')).toHaveLength(1)
 expect(buttons.at(1).find('input').exists()).toBe(false)
 w.destroy()
})
test('customer edit uses visible fields and remains open until the request succeeds',async()=>{
 const w=shallowMount(Editor,{propsData:{show:true},mocks:{$i18n:{locale:'en'}},stubs:{CModal:{template:'<div><slot/><slot name="footer"/></div>'},CIcon:true}})
 await w.setData({form:{...customer,_id:'qa-customer'}})
 expect(Boolean(w.vm.isFormValid)).toBe(true)
 w.vm.handleSave()
 expect(w.emitted('save')[0][0].contact.studentEmail).toBeUndefined()
 expect(w.emitted('update:show')).toBeUndefined()
 w.destroy()
})
