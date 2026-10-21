import { shallowMount } from '@vue/test-utils'
import ArtworkTable from '@/views/Admin/components/table/AdminTable.vue'
import OrderTable from '@/views/Admin/components/table/OrderTable.vue'
import SubmissionTable from '@/views/Admin/components/table/SubmissionTable.vue'
import AssignmentTable from '@/views/Admin/components/table/SubmissionDetailTable.vue'
import NewsTable from '@/views/Admin/components/table/NewsTable.vue'
jest.doMock('vue-multiselect/dist/vue-multiselect.min.css', () => ({}))
const ReviewTable = require('@/views/Admin/components/table/AssignmentTable.vue').default
import i18nMixin from '@/mixins/i18nMixin'
const DataTable={props:['items'],render(h){const row=this.$scopedSlots.actions({item:this.items[0]});return h('table',[h('tbody',[h('tr',row)])])}}
const status={title:[{key:'en',value:'Pending'}]}
test.each([ArtworkTable,OrderTable,SubmissionTable,AssignmentTable,NewsTable,ReviewTable].flatMap(Component=>[[Component,'th'],[Component,'en']]))('icon actions expose translated accessible names', (Component,locale)=>{
 const item={_id:'qa',id:'qa',title:'QA',createdAt:new Date().toISOString(),status:Component===ArtworkTable?{approval:status}:Component===ReviewTable?'Pending':status,image:'qa.png',artwork:[]}
 const w=shallowMount(Component,{propsData:{items:[item]},mocks:{$i18n:{locale},$store:{getters:{'submission/submissions':[item]}}},methods:{getName:i18nMixin.methods.getName},directives:{'c-tooltip':()=>{}},stubs:{CDataTable:DataTable,CIcon:true,CSpinner:true,CCard:true,TablePaginationFooter:true}})
 const actions=w.findAll('button.action-btn');expect(actions.length).toBeGreaterThan(2)
 for(const button of actions.wrappers)expect(button.attributes('aria-label')).toBeTruthy()
 expect(w.find('button.icon-view').attributes('aria-label')).toBe(locale==='en'?'View Details':'ดูรายละเอียด')
 w.destroy()
})

