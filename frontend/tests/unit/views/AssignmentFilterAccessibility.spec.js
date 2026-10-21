import { mount, createLocalVue } from '@vue/test-utils'
import CoreuiVue from '@coreui/vue'
import SubmissionDetailFilter from '@/views/Admin/components/submission_detail/SubmissionDetailFilter.vue'
import AssignmentFilter from '@/views/Admin/components/filter/AssignmentFilter.vue'

const localVue = createLocalVue()
localVue.use(CoreuiVue)

describe.each([SubmissionDetailFilter, AssignmentFilter])('$name filter accessible inputs', Component => {
  test.each(['th', 'en'])('names search and both dates in %s', locale => {
    const wrapper = mount(Component, {
      localVue,
      propsData: { value: { search: '', status: 'All Status', startDate: null, endDate: null } },
      mocks: { $i18n: { locale } }
    })
    const names = locale === 'en' ? ['Start date', 'End date'] : ['วันที่เริ่มต้น', 'วันที่สิ้นสุด']
    names.forEach(name => expect(wrapper.find(`input[aria-label="${name}"]`).exists()).toBe(true))
    const search = wrapper.find('input[id]')
    expect(search.exists()).toBe(true)
    expect(wrapper.find(`label[for="${search.attributes('id')}"]`).exists()).toBe(true)
    expect(wrapper.findAll('input').wrappers.slice(1).every(input => input.attributes('placeholder') === (locale === 'en' ? 'dd/mm/yyyy' : 'วัน/เดือน/ปี'))).toBe(true)
    wrapper.destroy()
  })
})
