jest.doMock('@/service/api', () => ({ __esModule: true, default: {} }))
jest.doMock('vue-quill-editor', () => ({ quillEditor: { render: h => h('div') } }))
jest.doMock('quill/dist/quill.snow.css', () => ({}))
const News = require('@/views/Admin/News.vue').default

test('upload failure after create reopens the created news for repair instead of creating a duplicate', async () => {
  const saved = { _id: 'qa-created', title: [], description: [], images: [] }
  const dispatch = jest.fn(action => action === 'news/create' ? Promise.resolve({ data: { data: saved } }) : Promise.reject(new Error('upload rejected')))
  const vm = { saving: false, showCreateModal: true, showEditModal: false, selectedNews: null, $i18n: { locale: 'th' }, $store: { dispatch, commit: jest.fn() }, fetchNews: jest.fn() }
  const error = jest.spyOn(console, 'error').mockImplementation(() => {})
  try {
    await News.methods.handleSaveNews.call(vm, { title: [], description: [], _images: [new File(['qa'], 'qa.png', { type: 'image/png' })] })
    expect(dispatch.mock.calls.filter(call => call[0] === 'news/create')).toHaveLength(1)
    expect(vm.selectedNews).toEqual(saved)
    expect(vm.showCreateModal).toBe(false)
    expect(vm.showEditModal).toBe(true)
    expect(vm.saving).toBe(false)
  } finally { error.mockRestore() }
})

test('failure before news creation keeps the current create form open', async () => {
  const vm = { saving: false, showCreateModal: true, showEditModal: false, selectedNews: null, $i18n: { locale: 'en' }, $store: { dispatch: jest.fn().mockRejectedValue(new Error('create rejected')), commit: jest.fn() }, fetchNews: jest.fn() }
  const error = jest.spyOn(console, 'error').mockImplementation(() => {})
  try {
    await News.methods.handleSaveNews.call(vm, { title: [], description: [], _images: [] })
    expect(vm.showCreateModal).toBe(true)
    expect(vm.showEditModal).toBe(false)
    expect(vm.selectedNews).toBeNull()
    expect(vm.saving).toBe(false)
  } finally { error.mockRestore() }
})
