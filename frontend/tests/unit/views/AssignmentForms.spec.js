import {createLocalVue,mount} from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Create from '@/views/Admin/components/modal/submission/AssignmentCreateModal.vue'
import Edit from '@/views/Admin/components/modal/submission/AssignmentEditModal.vue'
import Detail from '@/views/Admin/SubmissionsDetail.vue'

const students=[{_id:'qa-student',studentId:'QA-STUDENT-ONLY',name:[{key:'en',value:'QA Learner'}]}]
const task={_id:'qa-task',title:[{key:'en',value:'Saved task'}],artist:['qa-student'],create:{startAt:'2026-10-17T09:00',endAt:'2026-10-18T09:00'}}
const mountForm=(component,locale)=>{
 const localVue=createLocalVue();localVue.use(Coreui)
 return mount(component,{localVue,propsData:{show:false,enrolledStudents:students,...(component===Edit?{assignmentData:task}:{})},mocks:{$i18n:{locale}},stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CIcon:true,LoadingButton:true}})
}
test.each([Create,Edit].flatMap(component=>['en','th'].map(locale=>[component,locale])))('%s %s exposes named fields and resets cancelled edits',async(component,locale)=>{
 const w=mountForm(component,locale);await w.setProps({show:true})
 for(const field of w.findAll('input').wrappers)expect(Boolean(field.element.labels.length||field.attributes('aria-label'))).toBe(true)
 expect(w.find('.close-btn').attributes('aria-label')).toBe(locale==='en'?'Close':'ปิด')
 await w.setData({form:{...w.vm.form,title:'Unsaved'},studentSearch:'stale'})
 await w.setProps({show:false});await w.setProps({show:true})
 expect(w.vm.form.title).toBe(component===Edit?'Saved task':'');expect(w.vm.studentSearch).toBe('')
 w.destroy()
})
test('create searches displayed studentId and toggles learners with native state',async()=>{
 const w=mountForm(Create,'en');await w.setProps({show:true});await w.setData({studentSearch:'QA-STUDENT-ONLY'})
 expect(w.vm.filteredStudents).toHaveLength(1)
 const choice=w.find('button.student-item');expect(choice.attributes('aria-pressed')).toBe('true')
 await choice.trigger('click');expect(choice.attributes('aria-pressed')).toBe('false')
 expect(w.find('button.select-all-toggle').exists()).toBe(true)
 w.destroy()
})
test.each(['handleAssignmentSave','handleAssignmentUpdate'])('%s preserves error/draft then retries and reports success',async method=>{
 const dispatch=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({})
 const vm={saving:false,saveError:'',saveFeedback:'',submission:{_id:'qa-portal',assignments:[task]},showAssignmentModal:true,showEditAssignmentModal:true,$i18n:{locale:'en'},$store:{dispatch},fetchSubmission:jest.fn()}
 const data={_id:'qa-task',title:task.title,selectedStudents:['qa-student'],create:task.create}
 await Detail.methods[method].call(vm,data)
 expect(vm.saveError).toContain('retry');expect(vm[method==='handleAssignmentSave'?'showAssignmentModal':'showEditAssignmentModal']).toBe(true)
 await Detail.methods[method].call(vm,data)
 expect(vm.saveError).toBe('');expect(vm.saveFeedback).toBeTruthy();expect(vm[method==='handleAssignmentSave'?'showAssignmentModal':'showEditAssignmentModal']).toBe(false)
})
