import { createLocalVue, mount } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Header from '@/views/Artist/components/ArtistProfileHeader.vue'
import Profile from '@/views/Artist/Profile.vue'

test.each([
  ['Customer','me','me',true], ['Artist','me','me',false], ['Admin','me','me',false],
  ['Evaluator','me','me',true], ['Artist','me','peer',true], [' Artist ','ME','me',false],
  [null,'me','me',true], ['Customer',null,'me',true]
])('public profile owner controls respect role=%s viewer=%s artist=%s', (sessionRole,userId,resolvedArtistId,expected)=>{
  expect(Profile.computed.isPublic.call({sessionRole,userId,resolvedArtistId,$route:{params:{id:resolvedArtistId}}})).toBe(expected)
})

const label = (status, locale) => Header.computed.statusName.call({ user: { status }, $i18n: { locale },
  getStatusBadge: Header.mixins?.[0]?.methods.getStatusBadge })

test.each([
  ['OldStudent', 'en', 'Existing Student'], ['OldStudent', 'th', 'นักศึกษาเก่า'],
  ['NewStudent', 'en', 'New Student'], ['NewStudent', 'th', 'นักศึกษาใหม่'],
  [{ title: [{ key: 'en', value: 'OldStudent' }] }, 'th', 'นักศึกษาเก่า'],
  [{ title: [{ key: 'th', value: 'สถานะเฉพาะ' }] }, 'th', 'สถานะเฉพาะ']
])('learner status is readable for %p in %s', (status, locale, expected) => {
  expect(label(status, locale)).toBe(expected)
})

test.each(['th', 'en'])('public and owner portfolio copy describe their actual capabilities (%s)', locale => {
  const context = isPublic => ({ isPublic, $i18n: { locale } })
  expect(Profile.computed.portfolioHeading.call(context(true))).toBe(locale === 'en' ? 'Artist Portfolio' : 'ผลงานของศิลปิน')
  expect(Profile.computed.portfolioDescription.call(context(true))).toBe(locale === 'en' ? 'Explore this artist’s collection of artworks.' : 'ชมคอลเลกชันผลงานของศิลปิน')
  expect(Profile.computed.portfolioHeading.call(context(false))).toBe(locale === 'en' ? 'My Artwork Portfolio' : 'ข้อมูลผลงานของฉัน')
  expect(Profile.computed.portfolioDescription.call(context(false))).toContain(locale === 'en' ? 'manage' : 'จัดการ')
})

test.each([true, false])('public=%s keeps owner actions and private phone separated', isPublic => {
  const localVue = createLocalVue(); localVue.use(Coreui)
  const wrapper = mount(Header, { localVue, propsData: { isPublic, user: {
    name: [{ key: 'en', value: 'QA Artist' }], image: 'qa-avatar.png', status: 'OldStudent',
    contact: { telephone: 'QA-PRIVATE-PHONE', studentEmail: 'qa@example.test' }
  } }, mocks: { $i18n: { locale: 'en' } }, stubs: { CIcon: true } })
  expect(wrapper.find('img').attributes('alt')).toBe('QA Artist')
  expect(wrapper.text().includes('QA-PRIVATE-PHONE')).toBe(!isPublic)
  expect(wrapper.text().includes('Edit Profile')).toBe(!isPublic)
  expect(wrapper.text().includes('Express your unique artistic vision')).toBe(!isPublic)
  wrapper.destroy()
})
