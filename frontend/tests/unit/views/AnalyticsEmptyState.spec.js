import {createLocalVue,mount} from '@vue/test-utils'
import CoreuiVue from '@coreui/vue-pro'
import Analytics from '@/views/Admin/Analytics.vue'

test('empty cohort tables follow the active language and keep empty exports disabled',async()=>{
 const localVue=createLocalVue();localVue.use(CoreuiVue)
 const i18n=localVue.observable({locale:'th'})
 const wrapper=mount({...Analytics,created(){}},{localVue,
  data:()=>({loading:false,submissions:[{academicYear:'2569',courseLevel:'6'}]}),
  mocks:{$i18n:i18n,$store:{state:{submission:{submissions:[]},artwork:{artworks:[]},order:{orders:[]},user:{user:[]}}}},
  stubs:{CIcon:true,CChartBar:true}
 })
 try{
  expect(wrapper.text()).toContain('ไม่พบคำสั่งซื้อ')
  expect(wrapper.text()).toContain('ไม่พบผลงานศิลปะ')
  expect(wrapper.text()).not.toContain('No items')
  expect(wrapper.findAll('.table-export').wrappers.every(w=>w.attributes('disabled')!==undefined)).toBe(true)
  i18n.locale='en';await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('No orders found')
  expect(wrapper.text()).toContain('No artworks found')
  expect(wrapper.text()).not.toContain('ไม่พบคำสั่งซื้อ')
 }finally{wrapper.destroy()}
})
