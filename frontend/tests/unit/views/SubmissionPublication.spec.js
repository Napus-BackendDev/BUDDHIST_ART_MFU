import { shallowMount } from '@vue/test-utils'
import Table from '@/views/Admin/components/table/AdminTable.vue'
import Notice from '@/views/Artist/components/PostTermSaleNotice.vue'
import Create from '@/views/Admin/components/modal/submission/SubmissionCreateModal.vue'
import Edit from '@/views/Admin/components/modal/submission/SubmissionEditModal.vue'
import AssignmentCreate from '@/views/Admin/components/modal/submission/AssignmentCreateModal.vue'
import AssignmentEdit from '@/views/Admin/components/modal/submission/AssignmentEditModal.vue'
import Detail from '@/views/Admin/SubmissionsDetail.vue'

test.each([Create, AssignmentCreate])('create form retains input until the parent confirms persistence', component => {
  const vm = { form: { title:'QA retained input', assignments:[], startDate:'2026-10-16',dueDate:'2026-10-20' },
    selectedStudents:['qa-user'], isFormValid:true, $emit:jest.fn(), resetForm:jest.fn() }
  component.methods.handleSave.call(vm)
  expect(vm.resetForm).not.toHaveBeenCalled()
})

test.each([AssignmentCreate, AssignmentEdit])('assignment form rejects reversed dates', component => {
  expect(Boolean(component.computed.isFormValid.call({
    form:{ title:'QA',startDateTime:'2026-10-20T09:00',endDateTime:'2026-10-19T09:00' },selectedStudents:['qa-user']
  }))).toBe(false)
})

test('failed assignment creation never adds a ghost row to the displayed submission', async () => {
  const original = { _id:'qa-sub',assignments:[{ _id:'round-1',title:[{key:'en',value:'Existing'}] }] }
  const vm = { submission:original,saving:false,showAssignmentModal:true,$i18n:{locale:'th'},
    $store:{dispatch:jest.fn().mockRejectedValue(Error('QA network failure'))},fetchSubmission:jest.fn() }
  const spy=jest.spyOn(window,'alert').mockImplementation(()=>{})
  await Detail.methods.handleAssignmentSave.call(vm,{title:'Should not appear',selectedStudents:['qa-user']})
  await Promise.resolve();await Promise.resolve()
  expect(original.assignments).toHaveLength(1)
  expect(vm.showAssignmentModal).toBe(true)
  spy.mockRestore()
})

describe.each([['create', Create], ['edit', Edit]])('Submission %s dates', (_, component) => {
  const context = () => ({ form: { title: 'QA', startDate: '2026-10-16', dueDate: '2026-10-20', assignments: [
    { title: 'QA Round', startDateTime: '2026-10-16T09:00', endDateTime: '2026-10-19T09:00' }
  ] }, selectedStudents: ['qa-artist'] })
  test('accepts ordered dates including a same-day portal', () => {
    const vm = context()
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(true)
    vm.form.dueDate = vm.form.startDate
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(true)
  })
  test('blocks reversed portal or assignment dates', () => {
    const vm = context()
    vm.form.dueDate = '2026-10-15'
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(false)
    vm.form.dueDate = '2026-10-20'
    vm.form.assignments[0].endDateTime = '2026-10-15T09:00'
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(false)
  })
})

test('published submission storage detail is visible even without a storage category', () => {
  const wrapper = shallowMount(Table, {
    propsData: { items: [{ _id: 'qa-work', storage: null, storageDetail: 'QA ห้องทดสอบ' }] },
    mocks: { $i18n: { locale: 'th' } },
    methods: { getName: () => '' },
    directives: { 'c-tooltip': () => {} },
    stubs: {
      CRow: { template: '<div><slot /></div>' }, CCol: { template: '<div><slot /></div>' },
      CCard: { template: '<div><slot /></div>' },
      CDataTable: { props: ['items'], template: '<table><tr v-for="item in items" :key="item._id"><slot name="storage" :item="item" /></tr></table>' },
      CIcon: true, TablePaginationFooter: true
    }
  })
  expect(wrapper.find('.storage-detail').text()).toBe('QA ห้องทดสอบ')
  wrapper.destroy()
})

test('artist decision notice includes only undecided artworks due within 30 days or overdue', () => {
  const now = Date.now(), day = 86400000
  const item = (id, days, decision = 'pending') => ({ _id: id, postTermSale: {
    initialSaleEndsAt: new Date(now + days * day).toISOString(), decision
  } })
  const items = [item('next-year', 366), item('outside', 31), item('boundary', 30),
    item('soon', 7), item('today', 0), item('overdue', -2),
    item('decided', -2, 'continue_sale'), item('display', 7, 'display_only'),
    { _id: 'invalid', postTermSale: { initialSaleEndsAt: 'invalid', decision: 'pending' } }]
  expect(Notice.computed.actionItems.call({ items }).map(value => value._id))
    .toEqual(['boundary', 'soon', 'today', 'overdue'])
})
