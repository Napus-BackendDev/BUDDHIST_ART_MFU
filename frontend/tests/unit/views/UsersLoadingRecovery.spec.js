import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import UsersManagement from '@/views/Admin/UsersManagement.vue'
import UsersTable from '@/views/Admin/components/table/UsersTable.vue'
import { CDataTable } from '@coreui/vue'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))
function mountPage(dispatch, locale = Vue.observable({ locale: 'en' })) {
  return shallowMount(UsersManagement, {
    mocks: { $i18n: locale, $store: { dispatch, getters: {}, commit: jest.fn() } },
    methods: { fetchRoles: jest.fn(), fetchStatuses: jest.fn() },
    stubs: { HeaderHero: true, UserWidget: true, UserFilter: true, UsersTable: true,
      UserCreateChoiceModal: true, UserCreateModal: true, UserViewModal: true, UserEditModal: true,
      CButton: { template: '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot/></button>' } }
  })
}
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks() })

test('pending user data shows loading rather than an empty table or zero widgets', async () => {
  let resolve
  const dispatch = jest.fn(() => new Promise(done => { resolve = done }))
  const w = mountPage(dispatch)
  try {
    expect(w.find('[role="status"]').text()).toBe('Loading users...')
    expect(w.find('userwidget-stub').exists()).toBe(false)
    expect(w.find('userstable-stub').exists()).toBe(false)
    await w.vm.fetchUsers()
    expect(dispatch).toHaveBeenCalledTimes(1)
    resolve([]); await flush()
    expect(w.find('userstable-stub').exists()).toBe(true)
  } finally { w.destroy() }
})

test('a rejected load shows localized recovery and retry preserves filters', async () => {
  const locale = Vue.observable({ locale: 'en' })
  const dispatch = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([])
  const w = mountPage(dispatch, locale)
  try {
    await flush()
    expect(w.find('[role="alert"]').text()).toContain('Unable to load users')
    expect(w.find('userwidget-stub').exists()).toBe(false)
    expect(w.find('userstable-stub').exists()).toBe(false)
    await w.setData({ filters: { search: 'QA', role: 'Artist', status: 'All Status' } })
    locale.locale = 'th'; await w.vm.$nextTick()
    expect(w.find('[role="alert"]').text()).toContain('โหลดข้อมูลผู้ใช้ไม่สำเร็จ')
    await w.find('[role="alert"] button').trigger('click'); await flush()
    expect(w.find('[role="alert"]').exists()).toBe(false)
    expect(w.find('userstable-stub').exists()).toBe(true)
    expect(w.vm.filters.search).toBe('QA')
    expect(dispatch).toHaveBeenCalledTimes(2)
  } finally { w.destroy() }
})

test('429 respects Retry-After and recovers only after the cooldown', async () => {
  jest.useFakeTimers('modern')
  let now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)
  const dispatch = jest.fn().mockRejectedValueOnce({ response: { status: 429, headers: { 'retry-after': '30' } } }).mockResolvedValue([])
  const w = mountPage(dispatch)
  try {
    await Promise.resolve(); await Promise.resolve(); await w.vm.$nextTick()
    expect(w.find('[role="alert"]').text()).toContain('Too many requests')
    expect(w.find('[role="alert"] button').attributes('disabled')).toBeDefined()
    await w.vm.fetchUsers()
    expect(dispatch).toHaveBeenCalledTimes(1)
    now += 30000; jest.advanceTimersByTime(30000); await w.vm.$nextTick()
    expect(w.vm.usersRetryNow).toBeGreaterThanOrEqual(w.vm.usersRetryAt)
    expect(w.find('[role="alert"] button').attributes('disabled')).toBeUndefined()
    await w.vm.fetchUsers(); await w.vm.$nextTick()
    expect(w.find('userstable-stub').exists()).toBe(true)
    expect(dispatch).toHaveBeenCalledTimes(2)
  } finally { w.destroy() }
})

test('the actual CoreUI table empty state follows the selected language', async () => {
  const locale = Vue.observable({ locale: 'th' })
  const w = shallowMount(UsersTable, {
    mocks: { $i18n: locale, $store: { getters: { 'user/user': [] } } },
    stubs: { CDataTable, CCard: { template: '<div><slot/></div>' }, CCardFooter: true, CIcon: true, CPagination: true }
  })
  try {
    expect(w.text()).toContain('ไม่พบผู้ใช้งาน')
    expect(w.text()).not.toContain('No items')
    locale.locale = 'en'; await w.vm.$nextTick()
    expect(w.text()).toContain('No users found')
  } finally { w.destroy() }
})


test('retry reloads status metadata as well as users before re-enabling the table', async () => {
  const w = mountPage(jest.fn().mockResolvedValue([]))
  try {
    await flush()
    w.vm.fetchStatuses = jest.fn().mockRejectedValueOnce(new Error('status offline')).mockResolvedValue([])
    await w.vm.fetchUsers(); await w.vm.$nextTick()
    expect(w.find('[role="alert"]').exists()).toBe(true)
    expect(w.find('userstable-stub').exists()).toBe(false)
    await w.vm.fetchUsers(); await w.vm.$nextTick()
    expect(w.vm.fetchStatuses).toHaveBeenCalledTimes(2)
    expect(w.find('userstable-stub').exists()).toBe(true)
  } finally { w.destroy() }
})
