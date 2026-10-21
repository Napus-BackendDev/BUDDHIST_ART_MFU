import { mount, createLocalVue } from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import Artwork from '@/views/Artist/components/modal/ArtworkCreateModal.vue'
import Order from '@/views/Artist/components/modal/OrderModal.vue'
import Submission from '@/views/Artist/components/modal/SubmissionCreateModal.vue'
import ArtworkView from '@/views/Artist/components/modal/ArtworkViewModal.vue'

const localVue = createLocalVue()
localVue.use(Coreui)

test.each(['th', 'en'])('submission wizard exposes names on actual input controls (%s)', locale => {
  const wrapper = mount({ ...Submission, created() {} }, {
    localVue, propsData: { show: true }, mocks: { $i18n: { locale }, $store: { getters: {} } },
    stubs: { CIcon: true, CModal: { template: '<div><slot name="header"/><slot/><slot name="footer"/></div>' } }
  })
  const controls = wrapper.findAll('input:not([type="file"]), textarea')
  expect(controls.length).toBeGreaterThanOrEqual(13)
  controls.wrappers.forEach(control => expect(control.attributes('aria-label')).toEqual(expect.any(String)))
  expect(wrapper.find('input[aria-label="ความกว้าง"]').exists()).toBe(true)
  expect(wrapper.find('input[aria-label="Width"]').exists()).toBe(true)
  expect(wrapper.find(`input[aria-label="${locale === 'en' ? 'Price' : 'ราคา'}"]`).exists()).toBe(true)
  wrapper.destroy()
})

test.each([[Order, 'th'], [Order, 'en'], [ArtworkView, 'th'], [ArtworkView, 'en']])('artist modal header has a named close action (%p, %s)', async (component, locale) => {
  const wrapper = mount(component, { localVue, propsData: { show: true }, mocks: { $i18n: { locale } },
    stubs: { CIcon: true, CModal: { template: '<div><slot name="header"/></div>' } } })
  const close = wrapper.find('button.close-btn')
  expect(close.attributes('aria-label')).toBe(locale === 'en' ? 'Close' : 'ปิด')
  expect(close.attributes('type')).toBe('button')
  await close.trigger('click')
  expect(wrapper.emitted('update:show')).toEqual([[false]])
  wrapper.destroy()
})

test.each(['th', 'en'])('artist artwork fields and dismiss action have names (%s)', async locale => {
  const wrapper = mount({ ...Artwork, created() {} }, {
    localVue, propsData: { show: true }, mocks: { $i18n: { locale }, $store: { getters: {} } },
    stubs: { CIcon: true, CModal: { template: '<div><slot name="header"/><slot/><slot name="footer"/></div>' } }
  })
  const expected = locale === 'en'
    ? ['Artwork Title (TH)', 'Technique (TH)', 'Remark (TH)', 'Description (TH)', 'Artwork Title (EN)', 'Technique (EN)', 'Remark (EN)', 'Description (EN)', 'Width', 'Length', 'Price']
    : ['ชื่อผลงาน (ภาษาไทย)', 'เทคนิคที่ใช้ (ภาษาไทย)', 'หมายเหตุ (ภาษาไทย)', 'รายละเอียดผลงาน (ภาษาไทย)', 'ชื่อผลงาน (ภาษาอังกฤษ)', 'เทคนิคที่ใช้ (ภาษาอังกฤษ)', 'หมายเหตุ (ภาษาอังกฤษ)', 'รายละเอียดผลงาน (ภาษาอังกฤษ)', 'ความกว้าง', 'ความยาว', 'ราคา']
  for (const name of expected) expect(wrapper.find(`[aria-label="${name}"]`).exists()).toBe(true)
  const close = wrapper.find('button.close-btn')
  expect(close.attributes('aria-label')).toBe(locale === 'en' ? 'Close' : 'ปิด')
  expect(close.attributes('type')).toBe('button')
  await close.trigger('click')
  expect(wrapper.emitted('update:show')).toEqual([[false]])
  expect(wrapper.emitted('save')).toBeUndefined()
  wrapper.destroy()
})
