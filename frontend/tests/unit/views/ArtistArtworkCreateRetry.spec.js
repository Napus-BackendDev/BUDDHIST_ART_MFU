import Profile from '@/views/Artist/Profile.vue'

const payload = { title: [], description: [], technique: [], artist: 'a', category: 'c', size: [], price: 1, status: 's', remark: [], _image: new Blob(['x']) }
const makeVm = dispatch => ({ loading: false, pendingArtworkId: null, showArtworkModal: true, $store: { dispatch, commit: jest.fn() } })

describe('artist artwork create retry', () => {
  test('retrying after a failed image upload reuses the saved record', async () => {
    let uploads = 0
    const dispatch = jest.fn(type => {
      if (type === 'artwork/create') return Promise.resolve({ data: { data: { _id: 'art-1' } } })
      if (type === 'artwork/upload') return ++uploads === 1 ? Promise.reject(new Error('drive down')) : Promise.resolve()
      return Promise.resolve()
    })
    const vm = makeVm(dispatch)
    await Profile.methods.handleArtworkSave.call(vm, payload)
    expect(vm.showArtworkModal).toBe(true)
    expect(vm.pendingArtworkId).toBe('art-1')
    await Profile.methods.handleArtworkSave.call(vm, payload)
    expect(dispatch.mock.calls.filter(([type]) => type === 'artwork/create')).toHaveLength(1)
    expect(vm.showArtworkModal).toBe(false)
    expect(vm.pendingArtworkId).toBeNull()
  })

  test('ignores a second click while saving', async () => {
    const dispatch = jest.fn(() => Promise.resolve())
    const vm = makeVm(dispatch); vm.loading = true
    await Profile.methods.handleArtworkSave.call(vm, payload)
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('a failed list refresh does not look like a failed save', async () => {
    const dispatch = jest.fn(type => type === 'artwork/create' ? Promise.resolve({ data: { data: { _id: 'art-2' } } }) : type === 'artwork/get' ? Promise.reject(new Error('x')) : Promise.resolve())
    const vm = makeVm(dispatch)
    await Profile.methods.handleArtworkSave.call(vm, payload)
    expect(vm.showArtworkModal).toBe(false)
    expect(vm.$store.commit).not.toHaveBeenCalledWith('dialog/showToast', expect.objectContaining({ variant: 'danger' }))
  })
})
