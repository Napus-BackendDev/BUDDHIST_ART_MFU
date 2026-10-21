import ArtworkView from '@/views/Admin/components/modal/artwork/ArtworkViewModal.vue'
import SubmissionReview from '@/views/Admin/components/modal/submission/SubmissionReviewModal.vue'
import ArtistArtworkView from '@/views/Artist/components/modal/ArtworkViewModal.vue'

describe.each([['Artwork', ArtworkView], ['Submission', SubmissionReview], ['Artist', ArtistArtworkView]])('%s dimension units', (_, component) => {
  test.each(['cm', 'ชม.', 'ซม.', 'ซม'])('renders %s as Thai centimetres', unit => {
    const vm = { artwork: { size: `50 x 70 ${unit}` }, $i18n: { locale: 'th' }, getName: () => '' }
    expect(component.computed.dimensions.call(vm).unit).toBe('ซม.')
  })
  test('keeps millimetres distinct from metres', () => {
    const vm = { artwork: { size: '50 x 70 mm' }, $i18n: { locale: 'en' }, getName: () => '' }
    expect(component.computed.dimensions.call(vm).unit).toBe('mm')
  })
})
