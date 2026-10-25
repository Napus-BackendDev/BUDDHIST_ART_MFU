import UsersManagement from '@/views/Admin/UsersManagement.vue'
import UserCreateModal from '@/views/Admin/components/modal/user/UserCreateModal.vue'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const make = (locale, rejection) => ({
  saving: false, createError: '', showManualImportModal: true, fetchUsers: jest.fn(),
  $i18n: { locale }, $store: { dispatch: jest.fn(() => Promise.reject(rejection)) }
})

describe('manual user creation failure', () => {
  beforeEach(() => { global.alert = jest.fn(); jest.spyOn(console, 'error').mockImplementation(() => {}) })
  afterEach(() => { delete global.alert; console.error.mockRestore() })

  test.each([['th', 'มีอยู่แล้ว'], ['en', 'already exists']])('duplicate keeps the form open and explains why (%s)', async (locale, text) => {
    const vm = make(locale, { response: { status: 404 } })
    UsersManagement.methods.handleSaveUser.call(vm, { studentId: 'X' })
    await flush()
    expect(vm.createError).toContain(text)
    expect(vm.showManualImportModal).toBe(true)
    expect(global.alert).not.toHaveBeenCalled()
    expect(vm.saving).toBe(false)
  })

  test('other failures get a generic inline message and no native alert', async () => {
    const vm = make('en', new Error('network'))
    UsersManagement.methods.handleSaveUser.call(vm, {})
    await flush()
    expect(vm.createError).toMatch(/Failed to create user/)
    expect(global.alert).not.toHaveBeenCalled()
  })

  test('the modal declares an error prop', () => {
    expect(UserCreateModal.props.error).toBeDefined()
  })
})
