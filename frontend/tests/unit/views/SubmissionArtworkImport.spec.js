import { shallowMount } from '@vue/test-utils'
import { parseArtworkRows } from '@/utils/submissionArtworkImport'

jest.doMock('@/service/api', () => ({ __esModule: true, default: { submission: jest.fn() } }))
const Service = require('@/service/api').default
const ArtworkImportModal = require('@/views/Admin/components/modal/submission/ArtworkImportModal.vue').default

const row = () => parseArtworkRows([{
  'รหัสประจำตัว': '6980000055', 'ชื่อผลงาน': 'งานใหม่', 'ราคาผลงาน': 1000,
  'อัพโหลดภาพผลงานสมบูรณ์': 'https://example.com/art.png'
}], [{ _id: 'artist-1', studentId: '6980000055' }])[0]
const submission = () => ({
  _id: 'sub-1', title: [{ key: 'th', value: 'รุ่น 6' }], artist: [{ _id: 'existing-artist' }],
  assignments: [{ _id: 'assignment-1', title: [{ key: 'th', value: 'ชิ้นที่ 1' }], artist: ['existing-artist'], artworks: [] }]
})

function mount() {
  const dispatch = jest.fn().mockResolvedValue({ data: { code: 20000, data: {} } })
  const wrapper = shallowMount(ArtworkImportModal, {
    propsData: { show: true, submissions: [submission()] },
    mocks: { $i18n: { locale: 'th' }, $store: { dispatch, getters: { 'setting/status/item': [{ _id: 'pending-id', code: 'PENDING' }] } } },
    stubs: ['CModal', 'CIcon']
  })
  wrapper.setData({ submissionId: 'sub-1' })
  return { wrapper, dispatch }
}

describe('Artwork import save flow', () => {
  beforeEach(() => jest.clearAllMocks())

  test('saves parsed artwork into the chosen assignment while preserving fresh existing data', async () => {
    const { wrapper, dispatch } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [row()] })
    const fresh = submission()
    fresh.assignments[0].artworks.push({ _id: 'old', owner: 'existing-artist', title: [{ key: 'th', value: 'งานเดิม' }], price: 500 })
    Service.submission.mockResolvedValue({ data: { data: fresh } })
    await wrapper.vm.importRows()
    expect(Service.submission).toHaveBeenCalledWith('exp', { _id: 'sub-1' })
    expect(dispatch).toHaveBeenCalledTimes(1)
    const [action, payload] = dispatch.mock.calls[0]
    expect(action).toBe('submission/update')
    expect(payload.artist).toEqual(['existing-artist', 'artist-1'])
    expect(payload.assignments[0].artworks).toHaveLength(2)
    expect(payload.assignments[0].artworks[0]).toEqual(fresh.assignments[0].artworks[0])
    expect(payload.assignments[0].artworks[1]).toMatchObject({ image: 'https://example.com/art.png', owner: 'artist-1', status: 'pending-id', price: 1000 })
    expect(wrapper.emitted('imported')).toEqual([[1]])
  })

  test('requires explicit choice before importing rows without images', async () => {
    const { wrapper } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [{ ...row(), imageUrl: '' }] })
    expect(wrapper.vm.canImport).toBe(false)
    wrapper.setData({ allowMissingImages: true })
    expect(wrapper.vm.canImport).toBe(true)
  })

  test('blocks duplicates found in a fresh copy before uploading or updating', async () => {
    const { wrapper, dispatch } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [row()] })
    const fresh = submission()
    fresh.assignments[0].artworks.push({ owner: { _id: 'artist-1' }, title: [{ key: 'th', value: 'งานใหม่' }] })
    Service.submission.mockResolvedValue({ data: { data: fresh } })
    await wrapper.vm.importRows()
    expect(wrapper.vm.error).toContain('มีผลงานนี้ในหัวข้องานแล้ว')
    expect(dispatch).not.toHaveBeenCalled()
    expect(wrapper.emitted('imported')).toBeUndefined()
  })

  test('blocks duplicates within the imported file', async () => {
    const { wrapper } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [row(), { ...row(), rowNumber: 3 }] })
    expect(wrapper.vm.invalidCount).toBe(2)
    expect(wrapper.vm.canImport).toBe(false)
  })

  test('allows repeated titles from distinct form responses and blocks reimporting the same response', async () => {
    const { wrapper, dispatch } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [{ ...row(), importKey: 'record-1' }, { ...row(), rowNumber: 3, importKey: 'record-2' }] })
    expect(wrapper.vm.canImport).toBe(true)
    const fresh = submission()
    fresh.assignments[0].artworks.push({ importKey: 'record-2', owner: 'artist-1', title: [{ key: 'th', value: 'งานใหม่' }] })
    Service.submission.mockResolvedValue({ data: { data: fresh } })
    await wrapper.vm.importRows()
    expect(wrapper.vm.error).toContain('มีผลงานนี้ในหัวข้องานแล้ว')
    expect(dispatch).not.toHaveBeenCalled()
  })

  test('reports save failures without announcing successful import', async () => {
    const { wrapper, dispatch } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [row()] })
    Service.submission.mockResolvedValue({ data: { data: submission() } })
    dispatch.mockRejectedValue(Error('save failed'))
    await wrapper.vm.importRows()
    expect(wrapper.vm.error).toBe('save failed')
    expect(wrapper.vm.busy).toBe(false)
    expect(wrapper.emitted('imported')).toBeUndefined()
  })

  test('uses uploaded image instead of the source link and keeps the upload payload contract', async () => {
    const { wrapper, dispatch } = mount()
    await wrapper.vm.$nextTick()
    wrapper.setData({ assignmentId: 'assignment-1', rows: [{ ...row(), image: new File(['image'], 'งานใหม่.png', { type: 'image/png' }) }] })
    Service.submission.mockResolvedValue({ data: { data: submission() } })
    dispatch.mockResolvedValueOnce({ data: { data: { url: 'https://example.com/uploaded.png' } } })
    await wrapper.vm.importRows()
    expect(dispatch.mock.calls[0][0]).toBe('submission/upload')
    expect(dispatch.mock.calls[0][1].get('_id')).toBe('sub-1')
    expect(dispatch.mock.calls[0][1].get('image').name).toBe('งานใหม่.png')
    expect(dispatch.mock.calls[0][1].get('artworkTitle')).toBe('งานใหม่_2')
    expect(dispatch.mock.calls[1][1].assignments[0].artworks[0].image).toBe('https://example.com/uploaded.png')
  })
})
