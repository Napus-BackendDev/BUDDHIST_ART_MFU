import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import CoreuiVue from '@coreui/vue'
import SystemSettings from '@/views/Admin/SystemSettings.vue'

const localVue = createLocalVue()
localVue.use(CoreuiVue)

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('SystemSettings.vue', () => {
  test.each(['Groups', 'Statuses', 'Categories'])('searches %s by either translated name after renaming', type => {
    const item = { _id:'qa-setting',code:'ORIGINAL_CODE',group:'qa-group',
      title:[{key:'th',value:'ชื่อใหม่ภาษาไทย'},{key:'en',value:'Renamed English label'}] };
    const vm = { ...SystemSettings.methods,locale:'th',selectedGroupId:'qa-group',
      groups:[item],statuses:[item,{...item,_id:'other',group:'other-group'}],categories:[item] };
    const searchKey = {Groups:'groupSearch',Statuses:'statusSearch',Categories:'categorySearch'}[type];
    for (const query of ['renamed english','ชื่อใหม่','original_code']) {
      vm[searchKey]=query;
      expect(SystemSettings.computed[`filtered${type}`].call(vm).map(s=>s._id)).toEqual(['qa-setting']);
    }
  });
  const groups = [
    { _id: 'group-sale', code: 'SALE_STATUS', title: [{ key: 'th', value: 'สถานะการขาย' }, { key: 'en', value: 'Sale status' }] },
    { _id: 'group-student', code: 'STUDENT_GROUP', title: [{ key: 'th', value: 'กลุ่มนักศึกษา' }, { key: 'en', value: 'Student group' }] }
  ]
  const statuses = [
    { _id: 'status-pending', group: 'group-sale', code: 'PENDING', title: [{ key: 'th', value: 'รอตรวจสอบ' }, { key: 'en', value: 'Pending' }] }
  ]
  const categories = [
    { _id: 'category-painting', code: 'PAINTING', title: [{ key: 'th', value: 'จิตรกรรม' }, { key: 'en', value: 'Painting' }] }
  ]

  const mountPage = () => {
    const dispatch = jest.fn(type => Promise.resolve({
      'setting/groups/get': groups,
      'setting/status/get': statuses,
      'artwork/category': categories
    }[type] || []))
    const wrapper = shallowMount(SystemSettings, {
      localVue,
      mocks: {
        $i18n: { locale: 'th' },
        $store: { dispatch, commit: jest.fn() }
      }
    })
    return { wrapper, dispatch }
  }

  it('loads groups, keeps the selected group, and filters master-detail data', async () => {
    const { wrapper } = mountPage()
    await flushPromises()
    expect(wrapper.vm.selectedGroupId).toBe('group-sale')
    expect(wrapper.vm.filteredStatuses).toHaveLength(1)

    wrapper.vm.groupSearch = 'student'
    expect(wrapper.vm.filteredGroups.map(item => item._id)).toEqual(['group-student'])
  })

  it('switches tabs and opens bilingual create modal with validation guard', async () => {
    const { wrapper } = mountPage()
    await flushPromises()
    wrapper.vm.activeTab = 'categories'
    expect(wrapper.vm.activeTab).toBe('categories')

    wrapper.vm.openCreate('group')
    expect(wrapper.vm.formModal).toBe(true)
    wrapper.vm.form.title.th = ''
    await wrapper.vm.saveForm()
    expect(wrapper.vm.saving).toBe(false)
    expect(wrapper.vm.formModal).toBe(true)
  })
})



describe('settings form accessible labels', () => {
  test.each(['th', 'en'])('associates every field label with its control in %s', async locale => {
    const wrapper = shallowMount(SystemSettings, {
      localVue,
      mocks: { $i18n: {locale}, $store: {dispatch: jest.fn(() => Promise.resolve([])), commit: jest.fn()} },
      stubs: {CModal: {template: '<div><slot/><slot name="footer"/></div>'}}
    })
    await flushPromises()
    await wrapper.setData({formType: 'status', formModal: true, deleteModal: true,
      impact: {requiresReplacement: true}, deleteItem: {_id: 'qa-source'}})
    const labels = wrapper.findAll('label.form-label-custom')
    expect(labels.length).toBe(6)
    for (const label of labels.wrappers) {
      const id = label.attributes('for')
      expect(id).toBeTruthy()
      const control = wrapper.find('#' + id)
      expect(control.exists()).toBe(true)
      expect(['INPUT', 'SELECT', 'TEXTAREA']).toContain(control.element.tagName)
      expect(control.element.labels[0]).toBe(label.element)
    }
    wrapper.destroy()
  })
})
