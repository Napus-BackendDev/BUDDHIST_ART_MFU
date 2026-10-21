import Create from '@/views/Admin/components/modal/order/OrderCreateModal.vue'
import Orders from '@/views/Admin/Orders.vue'
const context = email => ({saving:false,formError:'',form:{contact:{name:'QA Admin Order',email},address:{bill:'QA',shipping:'QA'},artworks:[{_id:'qa-art'}]},imageFile:null,$emit:jest.fn(),$refs:{},artworkSearchQuery:'',searchResults:[]})
test('successful submission keeps form values until the parent confirms server success',()=>{
 const vm=context('qa@example.test');vm.resetForm=Create.methods.resetForm.bind(vm)
 Create.methods.handleSave.call(vm)
 expect(vm.$emit).toHaveBeenCalledWith('save',expect.objectContaining({artwork:['qa-art']}))
 expect(vm.form.contact.name).toBe('QA Admin Order')
})
test('invalid email is rejected locally with the original inputs preserved',()=>{
 const vm=context('invalid-email');vm.$i18n={locale:'th'};vm.resetForm=jest.fn()
 Create.methods.handleSave.call(vm)
 expect(vm.$emit).not.toHaveBeenCalled();expect(vm.formError).toBeTruthy();expect(vm.form.contact.email).toBe('invalid-email')
})
test('optional blank email is omitted rather than sent as an invalid explicit email',()=>{
 const vm=context(' ');vm.$i18n={locale:'th'};vm.resetForm=jest.fn()
 Create.methods.handleSave.call(vm)
 expect(vm.$emit.mock.calls[0][1].contact.email).toBeUndefined()
})
test('admin order list includes unpaid reservations that can receive a slip later',()=>{
 const rows=['Reserved','Pending','Approved'].map((s,i)=>({_id:String(i),status:{title:[{key:'en',value:s}]}}))
 expect(Orders.computed.orders.call({$store:{getters:{'order/orders':rows}}})).toHaveLength(3)
})
test('slip failure after creation opens that saved order for retry instead of recreating it',async()=>{
 const saved={_id:'qa-saved-order'}
 const dispatch=jest.fn((action)=>action==='order/create'?Promise.resolve({data:{data:saved}}):Promise.reject(new Error('Upload failed')))
 const vm={loading:false,$i18n:{locale:'th'},$store:{dispatch,commit:jest.fn()},fetchOrders:jest.fn(),onEditOrder:jest.fn(),showCreateModal:true,createError:''}
 await Orders.methods.handleSaveOrder.call(vm,{contact:{},address:{},artwork:['qa'],_image:{name:'slip.png'}})
 expect(dispatch.mock.calls.filter(c=>c[0]==='order/create')).toHaveLength(1)
 expect(vm.onEditOrder).toHaveBeenCalledWith(saved)
 expect(vm.showCreateModal).toBe(false)
})

test.each(['invoice','certificate'])('document query opens the %s controls without bypassing login',async document=>{
 const order={_id:'qa-query-order'}
 const vm={$route:{query:{order:order._id,document}},$store:{getters:{'order/orders':[order]}}}
 await Orders.methods.openDocumentFromQuery.call(vm)
 expect(vm.selectedOrder).toBe(order);expect(vm.showViewModal).toBe(true)
 expect(vm.requestedDocument).toBe(document)
})
test('unknown document types and missing orders cannot trigger downloads',async()=>{
 const vm={$route:{query:{order:'missing',document:'invoice'}},$store:{getters:{'order/orders':[]}},$nextTick:jest.fn()}
 await Orders.methods.openDocumentFromQuery.call(vm)
 vm.$route.query.document='https://example.test/file'
 await Orders.methods.openDocumentFromQuery.call(vm)
 expect(vm.$nextTick).not.toHaveBeenCalled()
})
import Edit from '@/views/Admin/components/modal/order/OrderEditModal.vue'
test.each([[Create,'text/plain',10],[Edit,'text/plain',10],[Create,'image/png',2*1024*1024+1],[Edit,'image/png',2*1024*1024+1]])('invalid slip selection preserves the previous image and shows an error', (Component,type,size)=>{
 global.alert=jest.fn()
 const old=new File(['QA old'],'old.png',{type:'image/png'})
 const vm={imageFile:old,imagePreview:'old-preview',uploadError:'',$i18n:{locale:'th'}}
 const event={target:{files:[new File([new Uint8Array(size)],'invalid.'+(type==='text/plain'?'txt':'png'),{type})],value:'fake-path'}}
 Component.methods.handleImageUpload.call(vm,event)
 expect(vm.imageFile).toBe(old);expect(vm.imagePreview).toBe('old-preview');expect(vm.uploadError).toBeTruthy();expect(event.target.value).toBe('')
})
test('opening create refreshes availability even when artworks are already cached',()=>{
 const vm={allArtworks:[{_id:'cached'}],resetForm:jest.fn(),$store:{dispatch:jest.fn()}}
 Create.watch.show.call(vm,true)
 expect(vm.$store.dispatch).toHaveBeenCalledWith('artwork/get')
})
