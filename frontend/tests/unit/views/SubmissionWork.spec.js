jest.doMock('@/service/api', () => ({ __esModule:true, default:{submission:jest.fn()} }));
jest.doMock('@/store/store', () => ({}));
const Service=require('@/service/api').default
const SubmissionModule=require('@/store/modules/Submission').default
const Detail=require('@/views/Artist/SubmissionsDetail.vue').default
const Editor=require('@/views/Artist/components/modal/SubmissionEditModal.vue').default
const Creator=require('@/views/Artist/components/modal/SubmissionCreateModal.vue').default
const Widget=require('@/views/Admin/components/submission_detail/SubmissionDetailWidget.vue').default
const ListWidget=require('@/views/Admin/components/widget/SubmissionWidget.vue').default

test('student total counts populated and raw identities once across portals',()=>{
 expect(ListWidget.computed.totalStudents.call({submissions:[{artist:[{_id:'one'},{_id:'two'}]},{artist:['one','two']}]})).toBe(2)
})

test('rejected Thai status is not mistaken for approved and enables the resubmit class',()=>{
 const status={title:[{key:'en',value:'Rejected'},{key:'th',value:'ไม่อนุมัติ'}]}
 const vm={getName:Detail.methods.getName}
 expect(Detail.methods.getApprovalStatusClass.call(vm,{status})).toBe('status-closed')
 expect(Detail.methods.getApprovalStatusClass.call(vm,{status:'ไม่ผ่าน'})).toBe('status-closed')
 expect(Detail.methods.getApprovalStatusClass.call(vm,{status:{title:[{key:'th',value:'อนุมัติ'}]}})).toBe('status-open')
})

test('pending review count accepts populated statuses and legacy strings',()=>{
 const pending={title:[{key:'en',value:'Pending'},{key:'th',value:'รอตรวจสอบ'}]}
 const vm={submission:{assignments:[{artworks:[{status:pending},{status:'Pending'},
  {status:{approval:pending}},{status:{title:[{key:'en',value:'Rejected'}]}},{status:'Approved'}]}]}}
 expect(Widget.computed.pendingReviews.call(vm)).toBe(3)
})

const sample = () => ({_id:'submission',assignments:[{_id:'round',title:[{key:'en',value:'QA Round'}],artworks:[
  {_id:'own-work',owner:'owner',title:[{key:'en',value:'Own'}],image:'https://mfudrive.mfu.ac.th/existing.png'},
  {_id:'peer-work',owner:'peer',title:[{key:'en',value:'Peer'}]}
]}]})
beforeEach(()=>jest.clearAllMocks())

test('sending work posts one row without copying or mutating peer assignments',async()=>{
 const submission=sample(), before=JSON.stringify(submission), dispatch=jest.fn().mockResolvedValue({})
 await SubmissionModule.actions.submitWork({state:{submissions:[submission]},dispatch,rootGetters:{'auth/userId':'owner'}},
   {submissionId:'submission',assignmentId:'round',artwork:{_id:'own-work',title:[{key:'en',value:'Corrected'}]}})
 expect(dispatch).toHaveBeenCalledWith('update',expect.objectContaining({_id:'submission',assignmentId:'round',artwork:expect.objectContaining({_id:'own-work',image:'https://mfudrive.mfu.ac.th/existing.png'})}))
 expect(dispatch.mock.calls[0][1].assignments).toBeUndefined()
 expect(JSON.stringify(submission)).toBe(before)
})

test('replacement upload includes assignment and artwork identity before the file',async()=>{
 Service.submission.mockResolvedValue({data:{data:{url:'https://mfudrive.mfu.ac.th/qa-upload.png'}}})
 const dispatch=jest.fn().mockResolvedValue({}), file=new File(['QA'],'qa.png',{type:'image/png'})
 await SubmissionModule.actions.submitWork({state:{submissions:[sample()]},dispatch,rootGetters:{'auth/userId':'owner'}},
   {submissionId:'submission',assignmentId:'round',artwork:{_id:'own-work',_image:file,title:[{key:'en',value:'Replacement'}]}})
 const form=Service.submission.mock.calls[0][1]
 expect(form.get('assignmentId')).toBe('round')
 expect(form.get('artworkId')).toBe('own-work')
 expect(Array.from(form.keys()).pop()).toBe('image')
 expect(dispatch.mock.calls[0][1].artwork.image).toBe('https://mfudrive.mfu.ac.th/qa-upload.png')
})

test('resubmission edits the nested Submission work rather than calling the main Artwork collection',async()=>{
 const dispatch=jest.fn().mockResolvedValue({})
 const submission=sample();submission.assignments[0].isAssigned=true
 const vm={submission,isParticipant:true,canSubmitAssignment:Detail.methods.canSubmitAssignment,selectedAssignment:null,$store:{dispatch,commit:jest.fn()},$i18n:{locale:'th'},
   fetchSubmission:jest.fn(),showEditModal:true,submitting:false}
 await Detail.methods.handleUpdateArtwork.call(vm,{_id:'own-work',title:[{key:'en',value:'Resubmitted'}]})
 expect(dispatch).toHaveBeenCalledWith('submission/submitWork',{submissionId:'submission',assignmentId:'round',artwork:expect.objectContaining({_id:'own-work'})})
 expect(dispatch.mock.calls.some(([type])=>type==='artwork/update')).toBe(false)
 expect(vm.showEditModal).toBe(false)
})

test('failed resubmission leaves the edit form open and reports an error',async()=>{
 const submission=sample();submission.assignments[0].isAssigned=true
 const vm={submission,isParticipant:true,canSubmitAssignment:Detail.methods.canSubmitAssignment,submitFailureMessage:Detail.methods.submitFailureMessage,selectedAssignment:null,$store:{dispatch:jest.fn().mockRejectedValue(new Error('Conflict')),commit:jest.fn()},
   $i18n:{locale:'th'},fetchSubmission:jest.fn(),showEditModal:true,submitting:false}
 const error=jest.spyOn(console,'error').mockImplementation(()=>{})
 await Detail.methods.handleUpdateArtwork.call(vm,{_id:'own-work'})
 expect(vm.showEditModal).toBe(true)
 expect(vm.$store.dispatch).toHaveBeenCalledWith('submission/submitWork',expect.objectContaining({assignmentId:'round'}))
 expect(vm.$store.commit).toHaveBeenCalledWith('dialog/showToast',expect.objectContaining({variant:'danger'}))
 expect(vm.submitting).toBe(false)
 error.mockRestore()
})

test('admin assignment updates carry the revision of their source snapshot',async()=>{
 const dispatchState={submissions:[{...sample(),updatedAt:'2026-10-16T09:00:00.000Z'}]}
 Service.submission.mockResolvedValue({})
 await SubmissionModule.actions.update({state:dispatchState},{_id:'submission',assignments:[]})
 expect(Service.submission).toHaveBeenCalledWith('put',expect.objectContaining({updatedAt:'2026-10-16T09:00:00.000Z'}),{})
})

test.each([['create',Creator],['edit',Editor]])('%s modal leaves closing to the parent after persistence succeeds',(name,component)=>{
 const vm={...component.data(),isFormValid:true,is3D:false,isPriceVisible:true,approvalStatuses:[],getName:()=>'',getUnitTH:()=> 'ซม.',getUnitLabel:'ซม.',$emit:jest.fn()}
 Object.assign(vm.form,{title:{en:'QA',th:'ทดสอบ'},description:{en:'',th:''},technique:{en:'',th:''},remark:{en:'',th:''},price:'1000',width:'50',height:'70',unit:'cm'})
 component.methods.handleSave.call(vm)
 expect(vm.$emit.mock.calls.some(([event])=>event==='submit'||event==='save')).toBe(true)
 expect(vm.$emit.mock.calls.some(([event,value])=>event==='update:show'&&value===false)).toBe(false)
})

test('nested submission work keeps its review status, sale default and zero price in the editor',()=>{
 const vm={statuses:[{_id:'available',code:'AVAILABLE',title:[{key:'en',value:'Available'}]}],getName:()=> 'Available',cleanPrice:Editor.methods.cleanPrice}
 Editor.methods.populateForm.call(vm,{_id:'nested',owner:{_id:'owner'},category:{_id:'category'},status:{_id:'pending'},price:0,size:[{key:'en',value:'50 x 70 cm'}]})
 expect(vm.form.artist).toBe('owner')
 expect(vm.form.status.approval).toBe('pending')
 expect(vm.form.status.sale).toBe('available')
 expect(vm.form.price).toBe('0')
})
