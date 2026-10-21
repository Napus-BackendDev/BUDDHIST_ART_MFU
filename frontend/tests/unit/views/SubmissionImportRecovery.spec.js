import { shallowMount } from '@vue/test-utils'
import * as XLSX from 'xlsx'
import i18nMixin from '@/mixins/i18nMixin'
import Choice from '@/views/Admin/components/modal/submission/SubmissionCreateChoiceModal.vue'
jest.doMock('vue-multiselect/dist/vue-multiselect.min.css',()=>({}))
const Page=require('@/views/Admin/Submissions.vue').default

test('file choice stays open to review data and exposes inline errors and confirmation',()=>{
 const w=shallowMount(Choice,{propsData:{show:true,error:'offline',importSummary:'1 portal, 4 rows'},mocks:{$i18n:{locale:'en'}},stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CRow:{template:'<div><slot/></div>'},CCol:{template:'<div><slot/></div>'},CIcon:true}})
 w.vm.handleFileChange({target:{files:[{name:'qa.xlsx'}],value:'qa.xlsx'}})
 expect(w.emitted('update:show')).toBeUndefined()
 expect(w.find('[role="alert"]').text()).toBe('offline')
 expect(w.find('[data-testid="confirm-import"]').text()).toContain('Confirm Import')
 w.destroy()
})

test.each(['en','th'].flatMap(locale=>['csv','xlsx'].map(extension=>[locale,extension])))('import failure keeps payload for retry and guards duplicate saves (%s, %s)',async(locale,extension)=>{
 let rejectRequest
 const dispatch=jest.fn().mockImplementationOnce(()=>new Promise((resolve,reject)=>{rejectRequest=reject})).mockResolvedValueOnce({})
 const pendingImport={file:new File(['qa'],'qa.'+extension),submissions:[{title:[]}],skippedMessage:''}
 const vm={pendingImport,importing:false,importError:'',importFeedback:'',showChoiceModal:true,$i18n:{locale},$store:{dispatch},fetchSubmissions:jest.fn()}
 const request=Page.methods.confirmSubmissionImport.call(vm)
 await Page.methods.confirmSubmissionImport.call(vm)
 expect(dispatch).toHaveBeenCalledTimes(1)
 rejectRequest(new Error('offline'));await request
 expect(vm.pendingImport).toBe(pendingImport);expect(vm.showChoiceModal).toBe(true);expect(vm.importError).toBeTruthy();expect(vm.importing).toBe(false)
 await Page.methods.confirmSubmissionImport.call(vm)
 if(extension==='xlsx')expect(dispatch.mock.calls[1][1].get('workbook')).toBe(pendingImport.file)
 else expect(dispatch.mock.calls[1][1]).toBe(pendingImport.submissions)
 expect(vm.pendingImport).toBeNull();expect(vm.showChoiceModal).toBe(false);expect(vm.importFeedback).toBeTruthy();expect(vm.importError).toBe('')
})

test('busy modal rejects escape without preventing ordinary key presses from staying open',()=>{
 expect(Choice.methods.handleModalKey.call({importing:true},'',27)).toBe(false)
 expect(Choice.methods.handleModalKey.call({importing:false},'',13)).toBe(false)
 expect(Choice.methods.handleModalKey.call({importing:false},'',27)).toBe(true)
})

test.each([true,false])('read workbook prepares review without native dialogs or writes (valid %s)',async valid=>{
 const original=global.FileReader
 let reader
 global.FileReader=class {constructor(){reader=this}readAsArrayBuffer(){}}
 try{
  const workbook=XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook,XLSX.utils.json_to_sheet(valid?[{SubmissionTitleEng:'QA review',ArtistStudentID:'QA-A',AssignmentTitleEng:'Task A'}]:[]),'Submissions')
  const dispatch=jest.fn()
  const vm={...Page.methods,getName:i18nMixin.methods.getName,referenceReady:true,$i18n:{locale:'en'},$store:{getters:{'user/user':[{_id:'a',studentId:'QA-A'}],'setting/status/item':[]},dispatch},categories:[],showChoiceModal:true,importing:false,importReading:false}
  vm.handleChoiceImport({name:'qa.xlsx'})
  await reader.onload({target:{result:XLSX.write(workbook,{type:'array',bookType:'xlsx'})}})
  expect(dispatch).not.toHaveBeenCalled()
  expect(vm.importReading).toBe(false)
  if(valid){expect(vm.pendingImport.submissions[0].assignments[0].artist).toEqual(['a']);expect(vm.importSummary).toContain('1');expect(vm.showChoiceModal).toBe(true)}
  else{expect(vm.importError).toContain('empty');expect(vm.pendingImport).toBeNull()}
 }finally{global.FileReader=original}
})
