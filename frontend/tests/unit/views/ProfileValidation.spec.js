import Buyer from '@/views/User/components/modal/ProfileModal.vue'
import Artist from '@/views/Artist/components/modal/EditProfileModal.vue'

describe.each([['buyer', Buyer], ['artist', Artist]])('%s profile email', (name, component) => {
  test.each(['invalid-email', 'a@@example.test', 'a b@example.test', 'a@localhost', 'a'.repeat(255) + '@example.test'])('does not emit a save for invalid email %s', email => {
    const vm = { localForm: { personalEmail: email }, selectedFile: null, $i18n: { locale: 'th' }, $emit: jest.fn(), validationError: '' }
    component.methods.handleSave.call(vm)
    expect(vm.$emit).not.toHaveBeenCalled()
    expect(vm.validationError).toBeTruthy()
  })
  test.each(['', 'qa+buyer@example.test'])('allows optional or valid personal email %s', email => {
    const vm = { localForm: { personalEmail: email }, selectedFile: null, $i18n: { locale: 'th' }, $emit: jest.fn(), validationError: '' }
    component.methods.handleSave.call(vm)
    expect(vm.$emit).toHaveBeenCalledWith('save', expect.any(Object))
  })
})
