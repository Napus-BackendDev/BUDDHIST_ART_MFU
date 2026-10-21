import { mount, createLocalVue } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Filter from '@/views/Admin/components/filter/ArtworkFilter.vue'

test.each(['en','th'])('artwork search and date fields have connected localized labels (%s)',async locale=>{
 const localVue=createLocalVue();localVue.use(Coreui)
 const value={search:'',category:'All Categories',status:'All Status',startDate:null,endDate:null,quickRange:'All Time'}
 const w=mount(Filter,{localVue,propsData:{value},mocks:{$i18n:{locale}},stubs:{CIcon:true}})
 const fields=w.findAll('input')
 expect(fields.length).toBe(3)
 for(const field of fields.wrappers)expect(field.element.labels.length).toBeGreaterThan(0)
 const start=w.find('#artwork-filter-start')
 expect(start.attributes('placeholder')).toBe(locale==='en'?'Start date':'วันเริ่มต้น')
 await fields.at(0).setValue('QA match')
 expect(w.emitted('input').pop()[0].search).toBe('QA match')
 w.destroy()
})
