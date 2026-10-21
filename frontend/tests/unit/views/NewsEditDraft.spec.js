import { shallowMount } from '@vue/test-utils'
jest.doMock('vue-quill-editor', () => ({ quillEditor: { render: h => h('div') } }))
jest.doMock('quill/dist/quill.snow.css', () => ({}))
const Modal = require('@/views/Admin/components/modal/news/NewsEditModal.vue').default
const CreateModal = require('@/views/Admin/components/modal/news/NewsCreateModal.vue').default

const setup = () => {
  const news = { _id: 'qa-news', title: [{ key: 'en', value: 'Saved title' }], description: [{ key: 'en', value: '<p>Saved content</p>' }], images: ['saved-a.png', 'saved-b.png'] }
  return { news, wrapper: shallowMount(Modal, { propsData: { show: true, news }, mocks: { $i18n: { locale: 'th' } }, stubs: { CModal: true, CRow: true, CCol: true, CInput: true, CIcon: true, LoadingButton: true } }) }
}

test('removing and reordering draft images does not mutate saved news', () => {
  const { news, wrapper } = setup()
  wrapper.vm.removeExistingImage(0)
  expect(wrapper.vm.existingImages).toEqual(['saved-b.png'])
  expect(news.images).toEqual(['saved-a.png', 'saved-b.png'])
  wrapper.destroy()
})

test.each([Modal, CreateModal])('cover selection uses named native buttons with pressed state', async Component => {
  const wrapper = shallowMount(Component, { propsData: { show: true }, mocks: { $i18n: { locale: 'th' } }, stubs: { CModal: true, CRow: true, CCol: true, CInput: true, CIcon: true, LoadingButton: true } })
  await wrapper.setData({ imagePreviews: ['a.png', 'b.png'] })
  const controls = wrapper.findAll('button.cover-select-btn')
  expect(controls.length).toBe(2)
  expect(controls.at(1).attributes('aria-label')).toBe('เลือกภาพหน้าปก 2')
  expect(controls.at(1).attributes('type')).toBe('button')
  await controls.at(1).trigger('click')
  expect(wrapper.vm.coverIndex).toBe(1)
  expect(controls.at(1).attributes('aria-pressed')).toBe('true')
  expect(controls.at(0).attributes('aria-pressed')).toBe('false')
  wrapper.destroy()
})

test('create form keeps its draft and file order while saving, then clears on a new opening', async () => {
  const wrapper = shallowMount(CreateModal, { propsData: { show: true }, mocks: { $i18n: { locale: 'th' } }, stubs: { CModal: true, CRow: true, CCol: true, CInput: true, CIcon: true, LoadingButton: true } })
  const first = new File(['a'], 'a.png', { type: 'image/png' }), second = new File(['b'], 'b.png', { type: 'image/png' })
  await wrapper.setData({ form: { title: 'Draft', description: '<p>Content</p>', images: [first, second] }, imagePreviews: ['a', 'b'], coverIndex: 1 })
  wrapper.vm.onSave()
  expect(wrapper.emitted('save')[0][0]._images).toEqual([second, first])
  expect(wrapper.vm.form.title).toBe('Draft')
  expect(wrapper.vm.form.images).toEqual([first, second])
  await wrapper.setProps({ show: false })
  await wrapper.setProps({ show: true })
  expect(wrapper.vm.form.title).toBe('')
  expect(wrapper.vm.form.images).toEqual([])
  wrapper.destroy()
})

test('cancel and reopen of create form discards an unsaved draft', async () => {
  const wrapper = shallowMount(CreateModal, { propsData: { show: true }, mocks: { $i18n: { locale: 'th' } }, stubs: { CModal: true, CRow: true, CCol: true, CInput: true, CIcon: true, LoadingButton: true } })
  await wrapper.setData({ form: { title: 'Unsaved', description: 'Unsaved', images: [] } })
  await wrapper.setProps({ show: false })
  await wrapper.setProps({ show: true })
  expect(wrapper.vm.form.title).toBe('')
  expect(wrapper.vm.form.description).toBe('')
  wrapper.destroy()
})

test.each([Modal, CreateModal])('image input permits choosing the same file again after removing its preview', Component => {
  const event = { target: { files: [new File(['qa'], 'qa.png', { type: 'image/png' })], value: 'C:\\fakepath\\qa.png' } }
  const vm = { form: { images: [] }, imagePreviews: [] }
  Component.methods.handleMultipleFileUpload.call(vm, event)
  expect(event.target.value).toBe('')
  expect(vm.form.images).toHaveLength(1)
})

test('reopening the same news discards unsaved text, selected files, previews and cover', async () => {
  const { wrapper } = setup()
  wrapper.vm.form.title = 'Unsaved'
  wrapper.vm.form.description = 'Unsaved content'
  wrapper.vm.form.images = [new File(['test'], 'draft.png', { type: 'image/png' })]
  wrapper.vm.imagePreviews = ['draft-preview']
  wrapper.vm.coverIndex = 2
  await wrapper.setProps({ show: false })
  await wrapper.setProps({ show: true })
  expect(wrapper.vm.form.title).toBe('Saved title')
  expect(wrapper.vm.form.description).toBe('<p>Saved content</p>')
  expect(wrapper.vm.form.images).toEqual([])
  expect(wrapper.vm.imagePreviews).toEqual([])
  expect(wrapper.vm.existingImages).toEqual(['saved-a.png', 'saved-b.png'])
  expect(wrapper.vm.coverIndex).toBe(0)
  wrapper.destroy()
})
