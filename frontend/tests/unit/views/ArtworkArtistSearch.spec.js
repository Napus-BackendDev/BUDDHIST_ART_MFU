import Create from '@/views/Admin/components/modal/artwork/ArtworkCreateModal.vue'
import Edit from '@/views/Admin/components/modal/artwork/ArtworkEditModal.vue'
const artist = { _id: 'qa-artist', studentId: 'QA-ARTIST-20261016', name: [{ key: 'th', value: 'ศิลปินทดสอบ' }, { key: 'en', value: 'QA Artist' }] }
describe.each([['create', Create], ['edit', Edit]])('%s artist selection', (name, component) => {
  test.each(['ศิลปินทดสอบ', 'qa artist', 'QA-ARTIST-20261016'])('finds by name or learner ID: %s', query => {
    expect(component.computed.filteredArtists.call({ allUsers: [artist], artistSearchQuery: query, getArtistName: () => 'QA Artist' })).toEqual([artist])
  })
  test('displays the current locale name', () => {
    expect(component.methods.getArtistName.call({ $i18n: { locale: 'th' } }, artist)).toBe('ศิลปินทดสอบ')
  })
})
