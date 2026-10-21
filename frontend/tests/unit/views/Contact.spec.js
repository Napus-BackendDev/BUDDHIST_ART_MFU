jest.doMock('@/service/api', () => ({ __esModule: true, default: { contact: jest.fn() } }))
const Service = require('@/service/api').default
const Contact = require('@/views/page/Contact.vue').default
const context = () => ({ form: { name: 'QA Contact', email: 'qa@example.test', subject: 'QA subject', message: 'QA message' },
  submitting: false, submitted: false, submitError: '', $i18n: { locale: 'th' }, $nextTick: () => Promise.resolve(), $refs: { contactForm: { reportValidity: () => true } } })
beforeEach(() => jest.clearAllMocks())

test.each(['th', 'en'])('contact success/reset and failed send preserve keyboard focus (%s)', async locale => {
  const { shallowMount } = require('@vue/test-utils')
  const previousScroll = HTMLElement.prototype.scrollIntoView
  const scrollIntoView = jest.fn()
  HTMLElement.prototype.scrollIntoView = scrollIntoView
  const wrapper = shallowMount(Contact, { attachToDocument: true, mocks: { $i18n: { locale } },
    stubs: ['CContainer','CRow','CCol','CCard','CCardBody','CIcon','CSpinner','CButton','SectionPageHero'] })
  try {
    await wrapper.setData({ form: context().form })
    Service.contact.mockResolvedValueOnce({ data: { success: true } })
    await wrapper.vm.handleSubmit()
    expect(document.activeElement).toBe(wrapper.find('h3.success-title').element)
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'center' })
    await wrapper.vm.resetForm()
    expect(document.activeElement).toBe(wrapper.find('#contact-name').element)
    expect(wrapper.vm.form).toEqual({ name: '', email: '', subject: '', message: '' })
    await wrapper.setData({ form: context().form })
    Service.contact.mockRejectedValueOnce(new Error('offline'))
    await wrapper.vm.handleSubmit()
    expect(document.activeElement).toBe(wrapper.find('[role="alert"]').element)
    expect(scrollIntoView).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.form.message).toBe('QA message')
  } finally { wrapper.destroy(); HTMLElement.prototype.scrollIntoView = previousScroll }
})
test('shows success only after the server accepts the inquiry', async () => {
  const vm = context()
  Service.contact.mockResolvedValue({ data: { success: true } })
  await Contact.methods.handleSubmit.call(vm)
  expect(Service.contact).toHaveBeenCalledWith(vm.form)
  expect(vm.submitted).toBe(true)
  expect(vm.submitting).toBe(false)
})
test('mail failure preserves the inquiry and displays an error', async () => {
  const vm = context()
  Service.contact.mockRejectedValue(new Error('SMTP unavailable'))
  await Contact.methods.handleSubmit.call(vm)
  expect(vm.submitted).toBe(false)
  expect(vm.form.message).toBe('QA message')
  expect(vm.submitError).toBeTruthy()
  expect(vm.submitting).toBe(false)
})
test('invalid email and repeat clicks do not submit', async () => {
  const vm = context()
  vm.$refs.contactForm.reportValidity = () => false
  await Contact.methods.handleSubmit.call(vm)
  vm.submitting = true
  vm.$refs.contactForm.reportValidity = () => true
  await Contact.methods.handleSubmit.call(vm)
  expect(Service.contact).not.toHaveBeenCalled()
})

test('visible send failure follows the selected language without clearing the draft', async () => {
  const { shallowMount } = require('@vue/test-utils')
  const Vue = require('vue')
  const locale = Vue.observable({ locale: 'en' })
  const wrapper = shallowMount(Contact, { mocks: { $i18n: locale }, stubs: ['CContainer','CRow','CCol','CCard','CCardBody','CIcon','CSpinner','CButton','SectionPageHero'] })
  const previousScroll = HTMLElement.prototype.scrollIntoView
  HTMLElement.prototype.scrollIntoView = jest.fn()
  try {
    await wrapper.setData({ form: context().form })
    Service.contact.mockRejectedValue(new Error('offline'))
    await wrapper.vm.handleSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="alert"]').text()).toMatch(/^Your message/)
    locale.locale = 'th'; await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="alert"]').text()).toBe('ยังส่งข้อความไม่สำเร็จ กรุณาลองใหม่ภายหลัง หรือติดต่อทางอีเมล')
    expect(wrapper.vm.form.message).toBe('QA message')
  } finally { wrapper.destroy(); HTMLElement.prototype.scrollIntoView = previousScroll }
})
