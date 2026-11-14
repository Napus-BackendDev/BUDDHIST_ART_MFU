import { createLocalVue, mount } from '@vue/test-utils'
import Router from 'vue-router'
import Coreui from '@coreui/vue-pro'
import Artwork from '@/components/CardArtwork.vue'
import News from '@/components/CardNew.vue'
import i18nMixin from '@/mixins/i18nMixin'

const setup = (Component, propsData, locale = 'th') => {
  const localVue = createLocalVue()
  localVue.use(Router); localVue.use(Coreui); localVue.mixin(i18nMixin)
  const router = new Router({ mode: 'abstract', routes: [{ path: '/artwork/:id', component: {} }, { path: '/news/:id', name: 'NewsDetail', component: {} }] })
  const push = jest.spyOn(router, 'push').mockResolvedValue()
  const dispatch = jest.fn().mockResolvedValue(art)
  const wrapper = mount(Component, { localVue, router, propsData, mocks: { $i18n: { locale }, $store: { getters: { 'cart/isInCart': () => false }, dispatch } }, stubs: { CIcon: true, CModal: true } })
  return { wrapper, push, dispatch }
}
const status = value => ({ title: [{ key: 'en', value }] })
const art = { _id: 'qa-art', title: [{ key: 'th', value: 'ผลงานทดสอบ' }, { key: 'en', value: 'Test Artwork' }], price: 500, status: { approval: status('Approved'), sale: status('Available') } }

test.each(['th', 'en'])('artwork title is a native detail link without duplicate parent navigation (%s)', async locale => {
  const { wrapper, push } = setup(Artwork, { artworks: [art] }, locale)
  const link = wrapper.find('h4 a[href="/artwork/qa-art"]')
  expect(link.exists()).toBe(true)
  expect(link.text()).toBe(locale === 'en' ? 'Test Artwork' : 'ผลงานทดสอบ')
  await link.trigger('click', { button: 0 })
  expect(push).toHaveBeenCalledTimes(1)
  wrapper.destroy()
})

test('cart action remains separate from detail navigation', async () => {
  const { wrapper, push, dispatch } = setup(Artwork, { artworks: [art] })
  await wrapper.find('.action-btn-circle-premium').trigger('click')
  await new Promise(resolve => setImmediate(resolve))
  expect(push).not.toHaveBeenCalled()
  expect(dispatch).toHaveBeenCalledWith('cart/addToCart', art)
  expect(dispatch).toHaveBeenCalledWith('artwork/updateView', 'qa-art')
  wrapper.destroy()
})

test.each(['th', 'en'])('owner edit/delete controls are named native buttons without detail navigation (%s)', async locale => {
  const { wrapper, push } = setup(Artwork, { artworks: [art], isPublic: false }, locale)
  const edit = wrapper.find('button.edit-btn'), remove = wrapper.find('button.delete-btn')
  expect(edit.exists()).toBe(true)
  expect(remove.exists()).toBe(true)
  expect(edit.attributes('aria-label')).toBe(`${locale === 'en' ? 'Edit artwork' : 'แก้ไขผลงาน'}: ${locale === 'en' ? 'Test Artwork' : 'ผลงานทดสอบ'}`)
  expect(remove.attributes('aria-label')).toBe(`${locale === 'en' ? 'Delete artwork' : 'ลบผลงาน'}: ${locale === 'en' ? 'Test Artwork' : 'ผลงานทดสอบ'}`)
  await edit.trigger('click'); await remove.trigger('click')
  expect(wrapper.emitted('edit')[0]).toEqual([art])
  expect(wrapper.emitted('delete')[0]).toEqual([art])
  expect(push).not.toHaveBeenCalled()
  wrapper.destroy()
})

test.each(['th', 'en'])('owner pending overlay follows page language (%s)', locale => {
  const { wrapper } = setup(Artwork, { artworks: [{ ...art, status: { approval: status('Pending'), sale: status('Available') } }], isPublic: false }, locale)
  expect(wrapper.find('.pending-overlay').text()).toBe(locale === 'en' ? 'Pending Review' : 'รอตรวจสอบ')
  wrapper.destroy()
})

test.each(['th', 'en'])('news read action is a native link with an article-specific accessible name (%s)', async locale => {
  const { wrapper, push } = setup(News, { newsList: [{ _id: 'qa-news', title: art.title, detail: [] }] }, locale)
  const link = wrapper.find('a.read-more-btn[href="/news/qa-news"]')
  expect(link.exists()).toBe(true)
  expect(link.attributes('aria-label')).toContain(locale === 'en' ? 'Test Artwork' : 'ผลงานทดสอบ')
  await link.trigger('click', { button: 0 })
  expect(push).toHaveBeenCalledTimes(1)
  wrapper.destroy()
})

test.each([['th', 'จองแล้ว'], ['en', 'Reserved']])('reserved artwork footer says reserved, not "not for sale" (%s)', (locale, label) => {
  const reserved = { ...art, status: { approval: status('Reserved'), sale: status('Available') } }
  const { wrapper } = setup(Artwork, { artworks: [reserved], isPublic: true }, locale)
  expect(wrapper.find('.price-value.exhibition-only').text()).toBe(label)
  wrapper.destroy()
})

test.each([
  ['th', '6', 'ผู้เรียนรุ่นที่ 06, จิตรกรรม'],
  ['en', '6', 'Cohort 06, Painting'],
  ['th', '00', 'งานศิลปะ อิสระ, จิตรกรรม'],
  ['en', '', 'Independent Artwork, Painting'],
])('card cohort tag renders localized learner cohort or independent label (%s, level=%s)', (locale, courseLevel, expected) => {
  const artworkWithCohort = {
    ...art,
    courseLevel,
    category: { title: [{ key: 'th', value: 'จิตรกรรม' }, { key: 'en', value: 'Painting' }] }
  }
  const { wrapper } = setup(Artwork, { artworks: [artworkWithCohort], isPublic: true }, locale)
  expect(wrapper.find('.badge-cohort-tag').text()).toBe(expected)
  wrapper.destroy()
})
