import { shallowMount } from '@vue/test-utils'
import Queue from '@/views/Admin/components/post_term/PostTermSaleQueue.vue'

test('post-term decisions are native buttons with selection state and labelled fields', async () => {
  const wrapper = shallowMount({ ...Queue, created() {} }, {
    mocks: { $i18n: { locale: 'en' }, $store: { getters: {} } },
    stubs: { CModal: { template: '<div><slot/><slot name="footer"/></div>' }, CIcon: true }
  })
  await wrapper.setData({ selectedItem: { _id: 'qa', title: [{key:'en',value:'QA work'}], postTermSale: {} }, selectedIds:['qa'], showModal:true })
  const choices=wrapper.findAll('button.decision-select-card')
  expect(choices.length).toBe(2)
  expect(choices.at(0).attributes('type')).toBe('button')
  expect(choices.at(0).attributes('aria-pressed')).toBe('true')
  await choices.at(1).trigger('click')
  expect(wrapper.vm.form.decision).toBe('display_only')
  expect(choices.at(1).attributes('aria-pressed')).toBe('true')
  expect(wrapper.find('label[for="post-term-contact-method"]').exists()).toBe(true)
  expect(wrapper.find('#post-term-contact-method').element.tagName).toBe('SELECT')
  expect(wrapper.find('label[for="post-term-note"]').exists()).toBe(true)
  expect(wrapper.find('#post-term-note').element.tagName).toBe('TEXTAREA')
  wrapper.destroy()
})
