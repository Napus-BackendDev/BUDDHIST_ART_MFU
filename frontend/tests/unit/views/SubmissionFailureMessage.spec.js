import Detail from '@/views/Artist/SubmissionsDetail.vue'

const msg = (locale, error) => Detail.methods.submitFailureMessage.call({ $i18n: { locale } }, error)

describe('artist submit failure message', () => {
  test.each([['en', /not open/], ['th', /ยังไม่เปิดหรือปิดแล้ว/]])('explains a closed period (%s)', (locale, re) => {
    expect(msg(locale, { response: { status: 403, data: { message: 'This submission period is not open.' } } })).toMatch(re)
  })
  test('other 403 is a permission message', () => {
    expect(msg('en', { response: { status: 403, data: { message: 'You are not assigned to this round.' } } })).toMatch(/permission/)
  })
  test('unknown errors keep the refresh hint', () => {
    expect(msg('en', new Error('network'))).toBe('Refresh the page and try again.')
  })
})
