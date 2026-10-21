import { mount, createLocalVue } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import i18nMixin from '@/mixins/i18nMixin'
import Create from '@/views/Admin/components/modal/submission/SubmissionCreateModal.vue'
import Edit from '@/views/Admin/components/modal/submission/SubmissionEditModal.vue'
import Choice from '@/views/Admin/components/modal/submission/SubmissionCreateChoiceModal.vue'

const students=[{_id:'qa-student',studentId:'QA-ONE',name:[{key:'en',value:'QA Learner'}],role:{title:[{key:'en',value:'Artist'}]}}]
students.push({...students[0],_id:'qa-returning',studentId:'QA-TWO',status:{title:[{key:'en',value:'Old Student'}]}})
const portal={_id:'qa-portal',title:[{key:'en',value:'Saved portal'}],courseLevel:'5',artist:students,create:{startAt:'2026-10-16',endAt:'2026-10-21'},assignments:[{_id:'qa-task',id:'qa-task',title:[{key:'en',value:'Task'}],create:{startAt:'2026-10-17T09:00',endAt:'2026-10-18T09:00'}}]}
const mountForm=(component,locale='en')=>{
 const localVue=createLocalVue();localVue.use(Coreui);localVue.mixin(i18nMixin)
 return mount(component,{localVue,propsData:{show:false,...(component===Edit?{submissionData:portal}:{})},mocks:{$i18n:{locale},$store:{getters:{'user/user':students},dispatch:jest.fn()}},stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CIcon:true,LoadingButton:true}})
}

test.each([Create,Edit].flatMap(component=>['en','th'].map(locale=>[component,locale])))('%s %s fields are named and learner choices are native toggle buttons',async(component,locale)=>{
 const w=mountForm(component,locale);await w.setProps({show:true})
 const fields=w.findAll('input')
 expect(fields.length).toBeGreaterThanOrEqual(8)
 for(const field of fields.wrappers)expect(Boolean(field.element.labels.length || field.attributes('aria-label'))).toBe(true)
 expect(w.find('.close-btn').attributes('aria-label')).toBe(locale==='en'?'Close':'ปิด')
 const choice=w.find('button.student-item');expect(choice.exists()).toBe(true)
 for(const item of w.findAll('button.student-item').wrappers)expect(['true','false']).toContain(item.attributes('aria-pressed'))
 const before=choice.attributes('aria-pressed');await choice.trigger('click')
 expect(w.find('button.student-item').attributes('aria-pressed')).toBe(before==='true'?'false':'true')
 expect(w.find('button.select-all-toggle').exists()).toBe(true)
 w.destroy()
})

test('reopening the same edit portal discards unsaved fields and learner selection',async()=>{
 const w=mountForm(Edit);await w.setProps({show:true})
 await w.setData({form:{...w.vm.form,title:'Unsaved'},selectedStudents:[],studentSearch:'stale query'})
 await w.setProps({show:false});await w.setProps({show:true})
 expect(w.vm.form.title).toBe('Saved portal');expect(w.vm.selectedStudents).toEqual(['qa-student','qa-returning']);expect(w.vm.studentSearch).toBe('')
 w.destroy()
})

test('all three submission entry choices are native buttons with no nested file input',async()=>{
 const localVue=createLocalVue();localVue.use(Coreui)
 const w=mount(Choice,{localVue,mocks:{$i18n:{locale:'en'}},stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CIcon:true}})
 const buttons=w.findAll('button.choice-card');expect(buttons.length).toBe(3)
 expect(buttons.at(1).find('input').exists()).toBe(false)
 await buttons.at(0).trigger('click');expect(w.emitted('manual')).toHaveLength(1)
 await buttons.at(2).trigger('click');expect(w.emitted('artwork-import')).toHaveLength(1)
 expect(w.find('.close-btn').attributes('aria-label')).toBe('Close')
 w.destroy()
})
