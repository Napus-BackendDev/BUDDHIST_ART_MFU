import Vue from 'vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import CoreuiVue from '@coreui/vue'
import SystemSettings from '@/views/Admin/SystemSettings.vue'

const localVue = createLocalVue()
localVue.use(CoreuiVue)

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('SystemSettings.vue', () => {
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

