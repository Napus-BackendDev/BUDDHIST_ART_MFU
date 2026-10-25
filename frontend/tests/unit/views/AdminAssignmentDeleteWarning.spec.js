import Detail from '@/views/Admin/SubmissionsDetail.vue'

const run = (item, locale = 'en') => {
  const confirm = jest.fn(() => false)
  global.confirm = confirm
  const vm = { $i18n: { locale }, getName: (l, i) => i.title, submission: { assignments: [item] }, $store: { dispatch: jest.fn() } }
  Detail.methods.handleDelete.call(vm, item)
  return confirm.mock.calls[0][0]
}

describe('admin delete assignment confirm', () => {
  test('warns when submitted artworks would be removed', () => {
    expect(run({ _id: 'a', title: 'T', artworks: [{}, {}] })).toMatch(/2 submitted artwork/)
    expect(run({ _id: 'a', title: 'T', artworks: [{}] }, 'th')).toMatch(/1 ชิ้น/)
  })
  test('plain confirm when there are no artworks', () => {
    expect(run({ _id: 'a', title: 'T', artworks: [] })).toBe('Are you sure you want to delete assignment "T"?')
  })
})
