import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Coreui from '@coreui/vue-pro'
import RolesManagement from '@/views/Admin/RolesManagement.vue'
import Submissions from '@/views/Admin/Submissions.vue'
import { buildDefaultPermissions } from '@/utils/permissions'

const sampleRoles = [
  {
    _id: 'role-admin',
    title: [{ key: 'en', value: 'Admin' }, { key: 'th', value: 'ผู้ดูแลระบบ' }],
    isSystem: true,
    permissions: buildDefaultPermissions('edit'),
  },
  {
    _id: 'role-reviewer',
    title: [{ key: 'en', value: 'Reviewer' }, { key: 'th', value: 'อาจารย์ตรวจผลงาน' }],
    isSystem: false,
    permissions: { ...buildDefaultPermissions('none'), submissions: 'view' },
  },
]

const flushPromises = async wrapper => {
  await Promise.resolve()
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await wrapper.vm.$nextTick()
}

async function mountRoles(rolePerm = 'edit') {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(Coreui)

  const dispatch = jest.fn(() => Promise.resolve())
  const store = new Vuex.Store({
    modules: {
      auth: {
        namespaced: true,
        state: {
          role: rolePerm === 'edit' ? 'Admin' : 'Curator',
          permissions: { ...buildDefaultPermissions('none'), roles: rolePerm },
        },
        getters: {
          role: state => state.role,
          permissions: state => state.permissions,
        },
      },
      setting: {
        namespaced: true,
        modules: {
          roles: {
            namespaced: true,
            getters: { item: () => sampleRoles },
          },
        },
      },
    },
  })
  store.dispatch = dispatch

  const wrapper = mount(RolesManagement, {
    localVue,
    store,
    mocks: { $i18n: { locale: 'en' } },
    stubs: { CIcon: true },
  })
  await flushPromises(wrapper)
  return { wrapper, dispatch }
}

describe('Single-page RolesManagement and tab-free Submissions', () => {
  test('RolesManagement renders a single-page table matrix with only edit/delete column actions and saves inline', async () => {
    const { wrapper, dispatch } = await mountRoles('edit')

    expect(wrapper.find('.modal.show').exists()).toBe(false)
    expect(wrapper.find('table.single-matrix-table').exists()).toBe(true)
    expect(wrapper.findAll('.mini-preset-btn').length).toBe(0)
    expect(wrapper.findAll('.role-col-actions .mini-action-btn.neutral').length).toBe(2)
    expect(wrapper.findAll('.role-col-actions .mini-action-btn.danger').length).toBe(1)
    expect(wrapper.text()).toContain('Admin')
    expect(wrapper.text()).toContain('Reviewer')
    expect(wrapper.text()).toContain('Full Edit')

    // Toggle Overview -> View for Reviewer inside matrix cell
    const radioGroups = wrapper.findAll('[role="radiogroup"]')
    expect(radioGroups.length).toBeGreaterThan(0)
    const firstOverviewReviewerGroup = radioGroups.at(0)
    const viewBtn = firstOverviewReviewerGroup.findAll('button').filter(b => b.text() === 'View').at(0)
    await viewBtn.trigger('click')

    expect(wrapper.text()).toContain('Save Changes (1)')
    const saveBtn = wrapper.findAll('button').filter(b => b.text().includes('Save Changes (1)')).at(0)
    await saveBtn.trigger('click')
    await flushPromises(wrapper)

    expect(dispatch).toHaveBeenCalledWith(
      'setting/roles/update',
      expect.objectContaining({
        _id: 'role-reviewer',
        permissions: expect.objectContaining({ overview: 'view', submissions: 'view' }),
      })
    )
    wrapper.destroy()
  })

  test('RolesManagement uses CModal for Create Role and inline 2-step confirmation for Delete', async () => {
    const { wrapper, dispatch } = await mountRoles('edit')

    const createToggle = wrapper.findAll('button').filter(b => b.text().includes('Create Role')).at(0)
    await createToggle.trigger('click')
    await flushPromises(wrapper)
    expect(wrapper.vm.showCreateModal).toBe(true)
    expect(wrapper.find('.modal.d-block').exists()).toBe(true)
    expect(wrapper.text()).toContain('Create Custom Role')

    const inputs = wrapper.findAll('input.form-control')
    await inputs.at(0).setValue('Guest Critic')
    const submitCreate = wrapper.findAll('button').filter(b => b.text().includes('Add Role Column')).at(0)
    await submitCreate.trigger('click')
    await flushPromises(wrapper)

    expect(dispatch).toHaveBeenCalledWith(
      'setting/roles/create',
      expect.objectContaining({
        title: expect.arrayContaining([
          expect.objectContaining({ key: 'en', value: 'Guest Critic' }),
        ]),
      })
    )

    const delBtn = wrapper.findAll('button.mini-action-btn.danger').at(0)
    await delBtn.trigger('click')
    expect(wrapper.text()).toContain('Confirm Delete')
    const confirmDel = wrapper.findAll('button.confirm-danger').at(0)
    await confirmDel.trigger('click')
    await flushPromises(wrapper)

    expect(dispatch).toHaveBeenCalledWith('setting/roles/remove', { _id: 'role-reviewer' })
    wrapper.destroy()
  })

  test('RolesManagement hides mutating controls and disables pills in View-Only mode', async () => {
    const { wrapper } = await mountRoles('view')

    expect(wrapper.find('[role="note"]').exists()).toBe(true)
    expect(wrapper.findAll('button').filter(b => b.text().includes('Create Role')).length).toBe(0)
    const disabledPills = wrapper.findAll('button.level-pill:disabled')
    expect(disabledPills.length).toBeGreaterThan(0)
    wrapper.destroy()
  })

  test('Submissions renders submissions list directly without Archive & 1-Year Lifecycle tabs', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(Coreui)

    const store = new Vuex.Store({
      modules: {
        auth: {
          namespaced: true,
          getters: {
            role: () => 'Admin',
            permissions: () => buildDefaultPermissions('edit'),
          },
        },
        submission: {
          namespaced: true,
          getters: { submissions: () => [] },
        },
        user: {
          namespaced: true,
          getters: { user: () => [] },
        },
        setting: {
          namespaced: true,
          modules: {
            status: {
              namespaced: true,
              getters: { item: () => [] },
            },
          },
        },
      },
    })
    store.dispatch = jest.fn(() => Promise.resolve([]))

    const wrapper = mount(Submissions, {
      localVue,
      store,
      mocks: { $i18n: { locale: 'en' } },
      stubs: {
        HeaderHero: true,
        SubmissionWidget: true,
        SubmissionFilter: true,
        SubmissionTable: true,
        SubmissionCreateModal: true,
        SubmissionCreateChoiceModal: true,
        SubmissionEditModal: true,
        ArtworkImportModal: true,
        CIcon: true,
      },
    })

    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Archive & 1-Year Lifecycle')
    expect(wrapper.find('submissiontable-stub').exists()).toBe(true)
    wrapper.destroy()
  })
})
