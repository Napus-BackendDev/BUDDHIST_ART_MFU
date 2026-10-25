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

describe.each([['buyer', Buyer], ['artist', Artist]])('%s profile telephone', (name, component) => {
  const run = telephone => {
    const vm = { localForm: { personalEmail: '', telephone }, selectedFile: null, $i18n: { locale: 'en' }, $emit: jest.fn(), validationError: '' }
    component.methods.handleSave.call(vm)
    return vm
  }
  test.each(['abc', '12ab', '123', '1'.repeat(16)])('blocks malformed telephone %s', telephone => {
    const vm = run(telephone)
    expect(vm.$emit).not.toHaveBeenCalled()
    expect(vm.validationError).toMatch(/phone/i)
  })
  test.each(['', '0812345678', '081-234-5678', '+66 81 234 5678'])('accepts telephone %p', telephone => {
    expect(run(telephone).$emit).toHaveBeenCalled()
  })
})
