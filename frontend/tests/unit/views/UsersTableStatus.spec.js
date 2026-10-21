import { shallowMount } from '@vue/test-utils'
import UsersTable from '@/views/Admin/components/table/UsersTable.vue'

test('the status column distinguishes old and new learners who both have Artist role', () => {
  const user = (en, th) => ({ role: {title:[{key:'en',value:'Artist'}]}, status:{ title:[{key:'en',value:en},{key:'th',value:th}] } })
  const users = [user('OldStudent','ผู้เรียนเก่า'), user('NewStudent','ผู้เรียนใหม่')]
  const wrapper = shallowMount(UsersTable, {
    mocks: { $i18n:{locale:'th'}, $store:{getters:{}}, $t:v=>v },
    computed: { filteredUsers:()=>users },
    stubs: {
      CDataTable: { props:['items'], render(h) {return h('div', this.items.map(item=>this.$scopedSlots.status({item}))) } },
      CCard:true, CCardBody:true, CCardFooter:true, CIcon:true, CPagination:true
    }
  })
  expect(wrapper.text()).toContain('ผู้เรียนเก่า')
  expect(wrapper.text()).toContain('ผู้เรียนใหม่')
  expect(wrapper.findAll('.status-badge').wrappers.map(w=>w.text())).toEqual(['ผู้เรียนเก่า','ผู้เรียนใหม่'])
})
test.each([['en',['View user: QA User','Edit user: QA User','Delete user: QA User']],['th',['ดูผู้ใช้: ผู้ใช้ QA','แก้ไขผู้ใช้: ผู้ใช้ QA','ลบผู้ใช้: ผู้ใช้ QA']]])('user action buttons have names in %s', (locale, labels) => {
 const item={_id:'qa',studentId:'QA-USER',name:[{key:'en',value:'QA User'},{key:'th',value:'ผู้ใช้ QA'}]}
 const wrapper=shallowMount(UsersTable,{
  mocks:{$i18n:{locale},$store:{getters:{}}},computed:{filteredUsers:()=>[item]},
  stubs:{CDataTable:{props:['items'],render(h){return h('div',this.items.map(item=>this.$scopedSlots.actions({item}))) }},CCard:true,CCardBody:true,CCardFooter:true,CIcon:true,CPagination:true}
 })
 expect(wrapper.findAll('button').wrappers.map(w=>w.attributes('aria-label'))).toEqual(labels)
 wrapper.destroy()
})
