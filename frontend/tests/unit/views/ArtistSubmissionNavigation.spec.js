import { createLocalVue, mount } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import List from '@/views/Artist/Submissions.vue'
import Detail from '@/views/Artist/SubmissionsDetail.vue'
import Creator from '@/views/Artist/components/modal/SubmissionCreateModal.vue'
import Editor from '@/views/Artist/components/modal/SubmissionEditModal.vue'

const portal = { _id: 'qa-portal', title: [{ key: 'en', value: 'QA Portal' }, { key: 'th', value: 'งานทดสอบ' }],
  artist: ['qa-owner'], create: { startAt: '2026-01-01', endAt: '2099-01-01' }, assignments: [] }
const setup = (component, locale) => {
  const localVue = createLocalVue(); localVue.use(Coreui)
  return mount({ ...component, created() {} }, { localVue,
    computed: component === Detail ? { submission: () => portal } : {},
    mocks: { $i18n: { locale }, $store: { getters: { 'submission/submissions': [portal], 'auth/userId': 'qa-owner' } } },
    stubs: { CIcon: true, SubmissionModal: true, ArtworkViewModal: true, SubmissionEditModal: true } })
}

test.each(['th', 'en'])('assignment portal has a named native action with no duplicate parent event (%s)', async locale => {
  const wrapper = setup(List, locale)
  const action = wrapper.find('button.btn-circle-action')
  expect(action.exists()).toBe(true)
  expect(action.attributes('aria-label')).toBe(locale === 'en' ? 'Open submission: QA Portal' : 'เปิดการส่งงาน: งานทดสอบ')
  await action.trigger('click')
  expect(wrapper.emitted('view-detail')).toEqual([['qa-portal']])
  wrapper.destroy()
})

test.each(['th', 'en'])('submission back button has a localized name and emits back (%s)', async locale => {
  const wrapper = setup(Detail, locale)
  const back = wrapper.find('button.btn-back-minimal')
  expect(back.attributes('aria-label')).toBe(locale === 'en' ? 'Back to submissions' : 'กลับรายการส่งงาน')
  await back.trigger('click')
  expect(wrapper.emitted('back')).toHaveLength(1)
  wrapper.destroy()
})

test.each(['th', 'en'])('empty portal explains that no assignments are available (%s)', locale => {
  const wrapper = setup(Detail, locale)
  expect(wrapper.find('[role="status"]').text()).toBe(locale === 'en' ? 'No assignments are available in this submission yet.' : 'ยังไม่มีงานที่มอบหมายในรายการส่งงานนี้')
  expect(wrapper.text()).not.toContain(locale === 'en' ? 'Select an assignment below' : 'เลือกงานที่ได้รับมอบหมายด้านล่าง')
  wrapper.destroy()
})

describe.each([['create', Creator], ['edit', Editor]])('%s submission modal', (_, component) => {
  test.each(['th', 'en'])('header close is named and cancels without saving (%s)', async locale => {
    const localVue = createLocalVue(); localVue.use(Coreui)
    const wrapper = mount({ ...component, created() {} }, { localVue, propsData: { show: true },
      mocks: { $i18n: { locale }, $store: { getters: {} } },
      stubs: { CIcon: true, CModal: { template: '<div><slot name="header"/></div>' } } })
    const close = wrapper.find('button.close-btn')
    expect(close.attributes('type')).toBe('button')
    expect(close.attributes('aria-label')).toBe(locale === 'en' ? 'Close' : 'ปิด')
    await close.trigger('click')
    expect(wrapper.emitted('update:show')).toEqual([[false]])
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.emitted('save')).toBeUndefined()
    wrapper.destroy()
  })
})


test('the standalone submission route opens its detail route rather than emitting to a missing parent', () => {
  const push = jest.fn(), emit = jest.fn()
  List.methods.handleView.call({ $route: { name: 'ArtistSubmissions' }, $router: { push }, $emit: emit }, portal)
  expect(push).toHaveBeenCalledWith({ name: 'ArtistSubmissionsDetail', params: { id: portal._id } })
  expect(emit).not.toHaveBeenCalled()
})

test('the standalone submission detail returns to the list', () => {
  const push = jest.fn(), emit = jest.fn()
  Detail.methods.handleBack.call({ $route: { name: 'ArtistSubmissionsDetail' }, $router: { push }, $emit: emit })
  expect(push).toHaveBeenCalledWith({ name: 'ArtistSubmissions' })
  expect(emit).not.toHaveBeenCalled()
})
