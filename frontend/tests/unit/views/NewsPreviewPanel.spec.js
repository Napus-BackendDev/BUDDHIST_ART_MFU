import { shallowMount } from '@vue/test-utils'
import Panel from '@/views/Admin/components/modal/news/NewsPreviewPanel.vue'

const mount = props => shallowMount(Panel, { propsData: props, mocks: { $i18n: { locale: 'en' } } })

describe('news preview panel', () => {
  test('shows title, sanitised content and puts the chosen cover first', () => {
    const wrapper = mount({ title: 'Hello', html: '<p>Body</p><script>alert(1)</script>', images: ['a.png', 'b.png', 'c.png'], coverIndex: 2 })
    expect(wrapper.find('.news-preview-title').text()).toBe('Hello')
    expect(wrapper.find('.news-preview-content').html()).toContain('Body')
    expect(wrapper.find('.news-preview-content').html()).not.toContain('<script')
    expect(wrapper.vm.ordered).toEqual(['c.png', 'a.png', 'b.png'])
  })
  test('empty state copy when there are no images or title', () => {
    const wrapper = mount({})
    expect(wrapper.text()).toContain('(no title)')
    expect(wrapper.text()).toContain('No images added.')
  })
})
