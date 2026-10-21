import Submissions from '@/views/Admin/Submissions.vue'

test.each(['handleSave','handleUpdate'].flatMap(method=>['en','th'].map(locale=>[method,locale])))('%s %s reports errors inside the open form and clears on successful retry',async(method,locale)=>{
 const dispatch=jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({})
 const vm={saving:false,saveError:'',showCreateModal:true,showEditModal:true,$i18n:{locale},$store:{dispatch,commit:jest.fn()},fetchSubmissions:jest.fn()}
 const payload={_id:'qa-portal',title:[]}
 const log=jest.spyOn(console,'error').mockImplementation(()=>{})
 await Submissions.methods[method].call(vm,payload)
 expect(vm.saveError).toContain(locale==='en'?'preserved':'ยังอยู่')
 expect(vm[method==='handleSave'?'showCreateModal':'showEditModal']).toBe(true)
 await Submissions.methods[method].call(vm,payload)
 expect(vm.saveError).toBe('');expect(vm[method==='handleSave'?'showCreateModal':'showEditModal']).toBe(false)
 expect(dispatch.mock.calls[1][1]).toBe(payload)
 log.mockRestore()
})
