import Creator from '@/views/Artist/components/modal/SubmissionCreateModal.vue'
import Editor from '@/views/Artist/components/modal/SubmissionEditModal.vue'
import { createLocalVue, mount } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'

const context = () => ({ form: { title: { th: 'งานทดสอบ', en: 'QA Artwork' }, artist: 'qa-owner', category: 'qa-category',
  width: '50', height: '70', depth: '30', price: '800', status: { approval: 'pending', sale: 'available' }, technique: {}, remark: {}, description: {} }, is3D: false, isPriceVisible: true, imagePreview: 'qa-image.png' })

describe.each([['create', Creator], ['resubmit', Editor]])('%s numeric artwork fields', (_, component) => {
  test.each([
    ['width', 0, false], ['height', -1, false], ['width', 'Infinity', false],
    ['depth', '', true], ['depth', 0, true], ['depth', -2, true],
    ['price', -1, false], ['price', 'Infinity', false], ['price', 'invalid', false]
  ])('rejects %s=%p (3D=%s)', (field, value, is3D) => {
    const vm = context(); vm.form[field] = value; vm.is3D = is3D
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(false)
  })
  test.each([false, true])('permits positive dimensions, including 3D=%s and zero price', is3D => {
    const vm = context(); vm.form.price = '0'; vm.is3D = is3D
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(true)
  })
  test('2D work does not require an unused depth', () => {
    const vm = context(); vm.form.depth = ''
    expect(Boolean(component.computed.isFormValid.call(vm))).toBe(true)
  })
})

test('non-sale resubmission retains its existing no-price behavior', () => {
  const vm = context(); vm.isPriceVisible = false; vm.form.price = ''
  expect(Editor.computed.isFormValid.call(vm)).toBe(true)
})

test('real CoreUI numeric control disables the resubmit action after invalid input', async () => {
  const localVue = createLocalVue(); localVue.use(Coreui)
  const artwork = { _id: 'qa-work', owner: 'qa-owner', category: { _id: 'qa-category' }, image: 'qa-image.png', price: 800,
    title: [{ key: 'en', value: 'QA Artwork' }, { key: 'th', value: 'งานทดสอบ' }],
    size: [{ key: 'en', value: '50 x 70 cm' }], status: { approval: { _id: 'rejected' }, sale: { _id: 'available' } } }
  const wrapper = mount({ ...Editor, created() {} }, { localVue, propsData: { show: true, artwork },
    computed: { isPriceVisible: () => true, is3D: () => false },
    mocks: { $i18n: { locale: 'en' }, $store: { getters: {} } },
    stubs: { CIcon: true, CModal: { template: '<div><slot/><slot name="footer"/></div>' } } })
  expect(wrapper.find('.btn-save-artwork').element.disabled).toBe(false)
  await wrapper.find('input[placeholder="Width"]').setValue('-1')
  expect(wrapper.find('.btn-save-artwork').element.disabled).toBe(true)
  wrapper.destroy()
})
