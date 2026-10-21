jest.doMock('@/utils/artworkImage',()=>({readArtworkImage:jest.fn()}))
const {readArtworkImage}=require('@/utils/artworkImage')
const Input=require('@/mixins/artistImageInput').default
const Artwork=require('@/views/Artist/components/modal/ArtworkCreateModal.vue').default
const Submission=require('@/views/Artist/components/modal/SubmissionCreateModal.vue').default
const Resubmit=require('@/views/Artist/components/modal/SubmissionEditModal.vue').default
const state=()=>({...Input.data(),form:{image:'old-file'},imagePreview:'old-preview',$i18n:{locale:'en'}})
const event=()=>({target:{files:[new File(['QA image'],'qa.png',{type:'image/png'})],value:'qa-file'}})
beforeEach(()=>readArtworkImage.mockReset())
test('failed selection retains the last valid image and allows retry',async()=>{
 const vm=state(),e=event();readArtworkImage.mockRejectedValueOnce(new Error('Damaged image'))
 await Input.methods.handleFileUpload.call(vm,e)
 expect(vm.form.image).toBe('old-file');expect(vm.imagePreview).toBe('old-preview');expect(vm.imageError).toBe('Damaged image');expect(e.target.value).toBe('')
 readArtworkImage.mockResolvedValueOnce('new-preview');const next=event();await Input.methods.handleFileUpload.call(vm,next)
 expect(vm.form.image).toBe(next.target.files[0]);expect(vm.imagePreview).toBe('new-preview');expect(vm.imageError).toBe('');expect(vm.isProcessingImage).toBe(false)
})
test('keeps the previous image while processing and ignores an in-flight second selection',async()=>{
 const vm=state();let finish;readArtworkImage.mockReturnValue(new Promise(resolve=>{finish=resolve}))
 const work=Input.methods.handleFileUpload.call(vm,event())
 await Input.methods.handleFileUpload.call(vm,event())
 expect(vm.isProcessingImage).toBe(true);expect(vm.form.image).toBe('old-file');expect(readArtworkImage).toHaveBeenCalledTimes(1)
 finish('new-preview');await work;expect(vm.isProcessingImage).toBe(false)
})
test('closing the modal prevents a late image from changing a reopened draft',async()=>{
 const vm=state();let finish;readArtworkImage.mockReturnValue(new Promise(resolve=>{finish=resolve}))
 const work=Input.methods.handleFileUpload.call(vm,event())
 Input.watch.show.call(vm,false);vm.form={image:null};vm.imagePreview=null
 finish('late-preview');await work
 expect(vm.form.image).toBeNull();expect(vm.imagePreview).toBeNull();expect(vm.isProcessingImage).toBe(false)
})
test.each([Artwork,Submission,Resubmit])('image processing prevents submission in %s',Component=>{
 const vm={isProcessingImage:true,isStepOneValid:true,isPriceVisible:true,is3D:false,imagePreview:'qa.png',form:{title:{th:'งาน',en:'Work'},artist:'qa',category:'qa',width:50,height:70,price:100}}
 expect(Component.computed.isFormValid.call(vm)).toBe(false)
})
