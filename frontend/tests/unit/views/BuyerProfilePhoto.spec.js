jest.doMock('@/utils/artworkImage',()=>({decodeImageFile:jest.fn()}))
const Profile=require('@/views/User/index.vue').default
const {decodeImageFile}=require('@/utils/artworkImage')
const state=dispatch=>({...Profile.data(),userId:'qa-customer',form:{image:'https://example.test/original-avatar.png'},$i18n:{locale:'th'},$store:{dispatch,commit:jest.fn()},$refs:{fileInput:{value:'qa-selected'}},fetchProfile:jest.fn().mockResolvedValue()})
const selection=(name,type,size=20)=>({target:{files:[new File([new Uint8Array(size)],name,{type})],value:'qa-selected'}})
beforeEach(()=>{decodeImageFile.mockReset().mockResolvedValue('data:image/png;base64,QA');URL.createObjectURL=jest.fn(()=> 'blob:invalid-preview');jest.spyOn(console,'error').mockImplementation(()=>{})})
afterEach(()=>jest.restoreAllMocks())
test.each([['qa.txt','text/plain',20,'type'],['qa.svg','image/svg+xml',20,'type'],['qa.png','image/png',10*1024*1024+1,'size']])('rejects %s before upload and preserves the previous photo',async(name,type,size,issue)=>{
 const dispatch=jest.fn().mockResolvedValue({}),vm=state(dispatch),event=selection(name,type,size)
 await Profile.methods.onFileChange.call(vm,event)
 expect(dispatch).not.toHaveBeenCalled();expect(decodeImageFile).not.toHaveBeenCalled();expect(vm.form.image).toBe('https://example.test/original-avatar.png');expect(vm.photoError).toBe(issue);expect(event.target.value).toBe('')
})
test.each([['png','image/png'],['jpg','image/jpeg'],['gif','image/gif'],['webp','image/webp']])('keeps supported %s photos and displays only the server-confirmed URL',async(ext,type)=>{
 const dispatch=jest.fn().mockResolvedValue({data:{image:'https://example.test/confirmed-avatar.png'}}),vm=state(dispatch),event=selection('qa.'+ext,type,ext==='png'?10*1024*1024:20)
 await Profile.methods.onFileChange.call(vm,event)
 expect(decodeImageFile).toHaveBeenCalled();expect(dispatch.mock.calls[0][0]).toBe('user/upload');expect(dispatch.mock.calls[0][1].get('_id')).toBe('qa-customer');expect(vm.form.image).toBe('https://example.test/confirmed-avatar.png');expect(URL.createObjectURL).not.toHaveBeenCalled();expect(vm.photoUploading).toBe(false);expect(event.target.value).toBe('')
})
test('a damaged image never uploads and does not replace the current photo',async()=>{
 decodeImageFile.mockRejectedValue(new Error('decode failed'));const dispatch=jest.fn().mockResolvedValue({}),vm=state(dispatch)
 await Profile.methods.onFileChange.call(vm,selection('broken.png','image/png'))
 expect(dispatch).not.toHaveBeenCalled();expect(vm.photoError).toBe('invalid');expect(vm.form.image).toBe('https://example.test/original-avatar.png');expect(vm.photoUploading).toBe(false)
})
test('upload failure leaves the original photo and resets the chooser so the same file can retry',async()=>{
 const vm=state(jest.fn().mockRejectedValue(new Error('offline'))),event=selection('qa.png','image/png')
 await Profile.methods.onFileChange.call(vm,event)
 expect(vm.photoError).toBe('upload');expect(vm.form.image).toBe('https://example.test/original-avatar.png');expect(event.target.value).toBe('');expect(vm.selectedFile).toBe(null)
})
test('a pending photo upload cannot be duplicated by another change event',async()=>{
 const finish=[],dispatch=jest.fn(()=>new Promise(r=>finish.push(r))),vm=state(dispatch),first=Profile.methods.onFileChange.call(vm,selection('one.png','image/png'))
 await Promise.resolve();await Promise.resolve();const second=Profile.methods.onFileChange.call(vm,selection('two.png','image/png'));await Promise.resolve();const requests=dispatch.mock.calls.length,busy=vm.photoUploading;finish.forEach(r=>r({}));await Promise.all([first,second]);expect(requests).toBe(1);expect(busy).toBe(true);expect(vm.photoUploading).toBe(false)
})
