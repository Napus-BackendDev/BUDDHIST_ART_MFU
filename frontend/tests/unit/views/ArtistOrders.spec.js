import Profile from '@/views/Artist/Profile.vue'
import i18nMixin from '@/mixins/i18nMixin'

test('artist order rows use the business number from documents and keep legacy ID search', () => {
 const vm={resolvedArtistId:'qa-artist',allOrders:[{_id:'1234567890abcdef12345678',user:'qa-artist',orderNumber:'ORD-QA-00-016-02',createdAt:'2026-10-16T09:00:00Z',artwork:[],status:{title:[{key:'en',value:'Reserved'}]}}],
  getName:i18nMixin.methods.getName,calculateTimeLeft:()=>'-',$i18n:{locale:'th'}}
 const rows=Profile.computed.processedOrders.call(vm)
 expect(rows[0].orderIdDisplay).toBe('ORD-QA-00-016-02')
 for(const search of ['ord-qa-00-016-02','12345678']) {
  expect(Profile.computed.filteredOrders.call({processedOrders:rows,orderSearch:search})).toHaveLength(1)
 }
})
import { shallowMount } from '@vue/test-utils'
import OrderModal from '@/views/Artist/components/modal/OrderModal.vue'

test.each([['Rejected','th','ไม่อนุมัติ'],['Rejected','en','Rejected'],['Cancelled','th','ยกเลิก'],['Cancelled','en','Cancelled']])('artist order keeps %s distinct in %s', (status,locale,label)=>{
 const order={_id:'qa-order',user:'qa-artist',createdAt:'2026-10-16T09:00:00Z',artwork:[],status:{title:[{key:'en',value:status}]}}
 const vm={resolvedArtistId:'qa-artist',allOrders:[order],getName:i18nMixin.methods.getName,calculateTimeLeft:()=>'-',$i18n:{locale}}
 expect(Profile.computed.processedOrders.call(vm)[0].statusName).toBe(label)
})

test('artist rejected order shows the admin reason and keeps the certificate locked',()=>{
 const w=shallowMount(OrderModal,{propsData:{show:true,order:{_id:'qa-order',orderNumber:'ORD-QA-REJECT',statusName:'ไม่อนุมัติ',status:{title:[{key:'en',value:'Rejected'}]},remark:'QA rejection reason',artwork:[],contact:{},address:{}}},mocks:{$i18n:{locale:'th'}},stubs:{CModal:{template:'<div><slot/></div>'},CIcon:true,CSpinner:true,CButton:true}})
 expect(w.text()).toContain('QA rejection reason')
 expect(w.vm.isCertificateAvailable).toBe(false)
 w.destroy()
})
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin'
test.each(['ไม่อนุมัติ','ปฏิเสธ'])('Thai rejected badge is negative rather than pending: %s',status=>{
 expect(statusBadgeMixin.methods.getStatusBadge.call({$i18n:{locale:'th'}},status)).toMatchObject({class:'badge-cancelled',icon:'cil-x-circle'})
})
