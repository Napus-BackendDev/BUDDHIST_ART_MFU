import Vue from 'vue'
import {createLocalVue,mount} from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Profile from '@/views/User/index.vue'
import Editor from '@/views/User/components/modal/ProfileModal.vue'
const form=()=>({_id:'qa-customer',nameTh:'QA Buyer',nameEn:'QA Buyer',personalEmail:'qa@example.test',telephone:'',bill:'original QA billing',shipping:'',image:''})
afterEach(()=>jest.restoreAllMocks())
test('a failed profile save preserves the displayed profile and lets the same draft retry',async()=>{
 const dispatch=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({}),original=form(),draft={...original,bill:'QA TEST ONLY draft'}
 const vm={...Profile.data(),form:original,isEditing:true,$store:{dispatch},fetchProfile:jest.fn().mockResolvedValue()}
 jest.spyOn(console,'error').mockImplementation(()=>{})
 await Profile.methods.handleSave.call(vm,draft)
 expect(vm.form).toEqual(original);expect(vm.isEditing).toBe(true);expect(vm.profileSaveError).toBe(true);expect(vm.savingProfile).toBe(false)
 await Profile.methods.handleSave.call(vm,draft)
 expect(dispatch).toHaveBeenCalledTimes(2);expect(dispatch.mock.calls[1][1].address.bill).toBe(draft.bill);expect(vm.isEditing).toBe(false);expect(vm.profileSaveError).toBe(false)
})
test('repeated save clicks while a request is pending do not send duplicate profile writes',async()=>{
 const resolvers=[],dispatch=jest.fn(()=>new Promise(r=>resolvers.push(r))),vm={...Profile.data(),form:form(),$store:{dispatch},fetchProfile:jest.fn().mockResolvedValue()}
 const pending=Profile.methods.handleSave.call(vm,form()),duplicate=Profile.methods.handleSave.call(vm,form()),count=dispatch.mock.calls.length,busy=vm.savingProfile;resolvers.forEach(resolve=>resolve({}));await Promise.all([pending,duplicate]);expect(count).toBe(1);expect(busy).toBe(true);expect(vm.savingProfile).toBe(false)
})
test('the profile editor keeps its draft, localizes save failure, and blocks closing/saving while busy',async()=>{
 const localVue=createLocalVue();localVue.use(Coreui);const locale=Vue.observable({locale:'th'})
 const w=mount(Editor,{localVue,attachToDocument:true,propsData:{show:true,form:form(),saveError:false},mocks:{$i18n:locale},stubs:{CModal:{template:'<div><slot/><slot name="footer"/></div>'}}})
 try{await w.setProps({saveError:true});await w.vm.$nextTick();expect(document.activeElement).toBe(w.find('[role="alert"]').element);expect(w.find('[role="alert"]').text()).toContain('บันทึกโปรไฟล์ไม่สำเร็จ');await w.find('#buyer-profile-bill').setValue('QA retained draft');locale.locale='en';await w.vm.$nextTick();expect(w.find('[role="alert"]').text()).toContain('Could not save your profile');expect(w.vm.localForm.bill).toBe('QA retained draft');await w.setProps({saving:true});expect(w.findAll('button').wrappers.every(b=>b.attributes('disabled')!==undefined)).toBe(true);w.vm.handleSave();w.vm.handleCancel();w.vm.localShow=false;expect(w.emitted('save')).toBeUndefined();expect(w.emitted('cancel')).toBeUndefined();expect(w.emitted('update:show')).toBeUndefined()}finally{w.destroy()}
})

test('closing the profile editor through its header or Escape uses the same cancellation cleanup',()=>{
 const vm={saving:false,$emit:jest.fn()};Editor.computed.localShow.set.call(vm,false)
 expect(vm.$emit.mock.calls).toEqual([['update:show',false],['cancel']])
})
