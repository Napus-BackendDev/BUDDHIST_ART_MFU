import { shallowMount } from '@vue/test-utils'
import Artworks from '@/views/Admin/Artworks.vue'
import Choice from '@/views/Admin/components/modal/artwork/ArtworkCreateChoiceModal.vue'

test('artwork choices support native keyboard activation without nesting the file input', async () => {
 const w=shallowMount(Choice,{mocks:{$i18n:{locale:'en'}},stubs:{CModal:{template:'<div><slot name="header"/><slot/><slot name="footer"/></div>'},CIcon:true}})
 const buttons=w.findAll('button.choice-card')
 expect(buttons.length).toBe(2)
 expect(buttons.at(1).find('input').exists()).toBe(false)
 await buttons.at(0).trigger('click')
 expect(w.emitted('manual')).toHaveLength(1)
 expect(w.find('button.close-btn').attributes('aria-label')).toBe('Close')
 const input={files:[{name:'qa.xlsx'}],value:'qa.xlsx'}
 w.vm.handleFileChange({target:input})
 expect(w.emitted('import')).toHaveLength(1)
 expect(w.emitted('update:show')).toBeUndefined()
 expect(input.value).toBe('')
 w.destroy()
})

test('English validation identifies the row and learner mismatch in English', () => {
 const vm={$i18n:{locale:'en'},categories:[],$store:{getters:{'user/user':[]}}}
 expect(()=>Artworks.methods.prepareImportRows.call(vm,[{ArtworkTitleEng:'QA',ArtistID:'missing',Price:100}])).toThrow('Row 2: No unique matching learner ID')
})

test.each(['en','th'])('failed import preserves reviewed rows for retry and prevents duplicate saves (%s)',async locale=>{
 const rows=[{title:[{key:'en',value:'QA recovery'}]}]
 let rejectRequest
 const dispatch=jest.fn().mockImplementationOnce(()=>new Promise((resolve,reject)=>{rejectRequest=reject})).mockResolvedValueOnce({})
 const vm={pendingImport:rows,importing:false,importError:'',importFeedback:'',showChoiceModal:true,$i18n:{locale},$store:{dispatch},fetchArtworks:jest.fn().mockResolvedValue()}
 const first=Artworks.methods.confirmArtworkImport.call(vm)
 expect(vm.importing).toBe(true)
 await Artworks.methods.confirmArtworkImport.call(vm)
 expect(dispatch).toHaveBeenCalledTimes(1)
 rejectRequest(new Error('offline'));await first
 expect(vm.showChoiceModal).toBe(true);expect(vm.pendingImport).toBe(rows);expect(vm.importError).toBeTruthy();expect(vm.importing).toBe(false)
 await Artworks.methods.confirmArtworkImport.call(vm)
 expect(dispatch).toHaveBeenCalledTimes(2)
 expect(dispatch.mock.calls[1][1]).toBe(rows)
 expect(vm.showChoiceModal).toBe(false);expect(vm.pendingImport).toEqual([]);expect(vm.importFeedback).toBeTruthy();expect(vm.importError).toBe('')
})
