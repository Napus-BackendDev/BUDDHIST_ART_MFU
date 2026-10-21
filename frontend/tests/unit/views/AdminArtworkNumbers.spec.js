import Creator from '@/views/Admin/components/modal/artwork/ArtworkCreateModal.vue'
import Editor from '@/views/Admin/components/modal/artwork/ArtworkEditModal.vue'
import { createLocalVue, mount } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'

const context = () => ({ form: { title: { th: 'งานทดสอบ', en: 'QA Artwork' }, artist: 'qa-owner', category: 'qa-category',
  width: '40', height: '60', depth: '20', price: '900', storageDetail: 'QA room' }, is3D: true,
  isProcessingImage: false, isUniversityStorageSelected: false, imagePreview: 'qa-image.png' })

describe.each([['create', Creator], ['edit', Editor]])('%s admin artwork numbers', (_, component) => {
  test.each([['width', '-1'], ['height', '0'], ['width', 'Infinity'], ['depth', ''], ['depth', '-1'],
    ['price', '-1'], ['price', 'Infinity'], ['price', 'invalid']])('rejects %s=%p', (field, value) => {
    const vm = context(); vm.form[field] = value
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(false)
  })
  test.each([false, true])('allows zero price with valid dimensions, 3D=%s', is3D => {
    const vm = context(); vm.is3D = is3D; vm.form.price = 0
    if (!is3D) vm.form.depth = ''
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(true)
  })
  test('cannot continue with missing 3D height', () => {
    const vm = context(); vm.form.depth = ''
    expect(Boolean(component.computed.isStepOneValid.call(vm))).toBe(false)
  })
  test('requires the exact university storage location', () => {
    const vm = context(); vm.isUniversityStorageSelected = true; vm.form.storageDetail = ' '
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(false)
  })
})

test('editing saved artwork keeps dimensions reactive through the real CoreUI input', async () => {
  const localVue = createLocalVue(); localVue.use(Coreui)
  const artwork = { _id: 'qa-work', artist: { _id: 'qa-owner' }, category: { _id: 'qa-category' }, image: 'qa.png', price: 900,
    title: [{ key: 'en', value: 'QA Artwork' }, { key: 'th', value: 'งานทดสอบ' }], size: [{ key: 'en', value: '40 x 60 x 20 cm' }], status: {} }
  const wrapper = mount({ ...Editor, created() {} }, { localVue, propsData: { show: true, artwork },
    computed: { is3D: () => true }, mocks: { $i18n: { locale: 'en' }, $store: { getters: {} } },
    stubs: { CIcon: true, CModal: { template: '<div><slot/><slot name="footer"/></div>' } } })
  await wrapper.findAll('button').wrappers.find(button => button.text().includes('Continue')).trigger('click')
  const save = () => wrapper.findAll('button').wrappers.find(button => button.text().includes('Save Changes'))
  expect(save().element.disabled).toBe(false)
  await wrapper.find('input[placeholder="Width"]').setValue('-1')
  expect(save().element.disabled).toBe(true)
  wrapper.destroy()
})

test('edit price parser preserves zero', () => {
  expect(Editor.methods.cleanPrice(0)).toBe('0')
})
