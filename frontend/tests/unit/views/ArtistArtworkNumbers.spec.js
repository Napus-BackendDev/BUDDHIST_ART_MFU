import Artwork from '@/views/Artist/components/modal/ArtworkCreateModal.vue'

const context = () => ({ form: { title: { th: 'งานทดสอบ', en: 'QA Artwork' }, artist: 'qa-owner', category: 'qa-category',
  width: '40', height: '60', depth: '20', price: '900' }, is3D: true, isPriceVisible: true, imagePreview: 'qa.png', isProcessingImage: false })

describe('artist direct artwork create and edit numeric validation', () => {
  test.each([
    ['width', '-1'], ['width', '0'], ['width', 'Infinity'], ['height', ''],
    ['height', 'NaN'], ['depth', '0'], ['depth', '-2'], ['depth', '']
  ])('blocks the first step for %s=%p', (field, value) => {
    const vm = context(); vm.form[field] = value
    expect(Boolean(Artwork.computed.isStepOneValid.call(vm))).toBe(false)
  })
  test('allows 2D artwork without depth', () => {
    const vm = context(); vm.is3D = false; vm.form.depth = ''
    expect(Boolean(Artwork.computed.isStepOneValid.call(vm))).toBe(true)
  })
  test.each(['Infinity', '-1', '', '900invalid'])('blocks invalid price %p', price => {
    const vm = context(); vm.form.price = price; vm.isStepOneValid = true
    expect(Boolean(Artwork.computed.isFormValid.call(vm))).toBe(false)
  })
  test('allows zero price with valid dimensions', () => {
    const vm = context(); vm.form.price = '0'; vm.isStepOneValid = true
    expect(Boolean(Artwork.computed.isFormValid.call(vm))).toBe(true)
  })
})
