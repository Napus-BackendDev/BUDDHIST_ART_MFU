import { mount,createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Coreui from '@coreui/vue-pro'
import Shipping from '@/views/page/components/card/CardShipping.vue'
const localVue=createLocalVue();localVue.use(Vuex);localVue.use(Coreui)
const create=locale=>mount(Shipping,{localVue,propsData:{currentStep:2},store:new Vuex.Store({modules:{cart:{namespaced:true,getters:{cartFinalTotal:()=>1002}},auth:{namespaced:true,getters:{userId:()=> 'qa'}},user:{namespaced:true,getters:{user:()=>[]},actions:{get:()=>[]}}}}),mocks:{$i18n:{locale}},stubs:['CIcon']})
const file={name:'qa.png',type:'image/png',size:100}
let originalCreate,originalRevoke
beforeEach(()=>{
 jest.spyOn(window,'alert').mockImplementation(()=>{})
 originalCreate=URL.createObjectURL;originalRevoke=URL.revokeObjectURL
 URL.createObjectURL=jest.fn(()=> 'blob:qa-slip');URL.revokeObjectURL=jest.fn()
})
afterEach(()=>{jest.restoreAllMocks();URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke})

test('upload area is a native keyboard button and respects checkout busy state',async()=>{
 const w=create('en')
 expect(w.find('button.upload-area').exists()).toBe(true)
 expect(w.find('button.upload-area').attributes('type')).toBe('button')
 await w.setProps({loading:true})
 expect(w.find('button.upload-area').element.disabled).toBe(true)
 w.destroy()
})

test.each(['en','th'].flatMap(locale=>['size','type'].map(issue=>[locale,issue])))('%s %s checkout file error is inline and does not open an alert',async(locale,issue)=>{
 const w=create(locale),event={target:{files:[issue==='size'?{...file,size:10*1024*1024+1}:{name:'qa.txt',type:'text/plain',size:20}],value:'qa-file'}}
 w.vm.handleFileUpload(event);await w.vm.$nextTick()
 expect(window.alert).not.toHaveBeenCalled()
 expect(w.find('[role="alert"]').text()).toContain(issue==='size'?'10MB':(locale==='en'?'JPG':'รูปภาพ'))
 expect(w.vm.paymentProofFile).toBeNull()
 expect(event.target.value).toBe('')
 w.destroy()
})

test('a dropped file is selected, removable and its object URL is released',async()=>{
 const w=create('en')
 await w.find('.upload-area').trigger('drop',{dataTransfer:{files:[file]}})
 expect(w.vm.paymentProofFile).toBe(file)
 expect(w.text()).toContain('qa.png')
 await w.findAll('button').wrappers.find(b=>b.text()==='Remove file').trigger('click')
 expect(w.vm.paymentProofFile).toBeNull()
 expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:qa-slip')
 w.destroy()
})
