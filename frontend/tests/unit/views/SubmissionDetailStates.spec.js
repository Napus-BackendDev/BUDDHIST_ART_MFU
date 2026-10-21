import {shallowMount} from '@vue/test-utils'
jest.doMock('vue-multiselect/dist/vue-multiselect.min.css',()=>({}))
import Portal from '@/views/Admin/SubmissionsDetail.vue'
const Assignment=require('@/views/Admin/Assignment.vue').default

const flush=()=>new Promise(resolve=>setTimeout(resolve,0))
const mountPage=(component,locale,dispatch,rows=[])=>shallowMount(component,{
 mocks:{$i18n:{locale},$route:{params:{id:component===Portal?'qa-portal':'qa-task',submissionId:'qa-portal'},fullPath:'/qa'},$store:{dispatch,getters:{'submission/submissions':rows,'setting/status/item':[]}}},
 stubs:{CIcon:true,CSpinner:true,CButton:{template:'<button @click="$emit(\'click\')"><slot/></button>'},CLink:{props:['to'],template:'<a><slot/></a>'}}
})

test.each([Portal,Assignment].flatMap(component=>['en','th'].map(locale=>[component,locale])))('%s %s distinguishes missing data from a failed request and lets users retry',async(component,locale)=>{
 let fail=false
 const dispatch=jest.fn(()=>fail?Promise.reject(new Error('offline')):Promise.resolve([]))
 const w=mountPage(component,locale,dispatch)
 await flush()
 expect(w.find('h1').text()).toContain(locale==='en'?'not found':'ไม่พบ')
 expect(w.find('a').exists()).toBe(true)
 fail=true;await w.vm.fetchSubmission()
 expect(w.find('[role="alert"]').exists()).toBe(true)
 expect(w.find('h1').text()).toContain(locale==='en'?'Unable':'ไม่สำเร็จ')
 fail=false;await w.find('[role="alert"] button').trigger('click');await flush()
 expect(w.find('[role="alert"]').exists()).toBe(false)
 expect(w.find('h1').text()).toContain(locale==='en'?'not found':'ไม่พบ')
 w.destroy()
})

test('an existing portal with no matching assignment is not a normal empty submissions table',async()=>{
 const w=mountPage(Assignment,'en',jest.fn().mockResolvedValue([]),[{_id:'qa-portal',artist:[],assignments:[]}])
 await flush();expect(w.find('h1').text()).toBe('Assignment not found');expect(w.find({name:'AssignmentTable'}).exists()).toBe(false)
 w.destroy()
})
