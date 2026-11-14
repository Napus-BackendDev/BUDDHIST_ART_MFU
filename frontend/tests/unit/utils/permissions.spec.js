import {
  ADMIN_TAB_KEYS,
  buildDefaultPermissions,
  normalizePermissions,
  hasAdminAccess,
  hasTabPermission,
  firstAllowedAdminRoute,
  saveSessionPermissions
} from '@/utils/permissions'

describe('Frontend RBAC permissions helper', () => {
  test('Admin role always resolves to full edit on every tab', () => {
    const perms = normalizePermissions({ submissions: 'none', roles: 'view' }, 'Admin')
    ADMIN_TAB_KEYS.forEach((tab) => {
      expect(perms[tab]).toBe('edit')
    })
  })

  test('normalizePermissions preserves none/view/edit and sanitizes unknown values', () => {
    const perms = normalizePermissions({
      submissions: 'view',
      artworks: 'edit',
      users: 'super-admin',
      unknownTab: 'edit',
    }, 'Reviewer')
    expect(perms.submissions).toBe('view')
    expect(perms.artworks).toBe('edit')
    expect(perms.users).toBe('none')
    expect(perms.unknownTab).toBeUndefined()
  })

  test('hasAdminAccess and hasTabPermission evaluate role & permission levels properly', () => {
    const reviewerSession = {
      role: 'Reviewer',
      permissions: { ...buildDefaultPermissions('none'), submissions: 'view' }
    }
    const artistSession = {
      role: 'Artist',
      permissions: buildDefaultPermissions('none')
    }
    expect(hasAdminAccess(reviewerSession)).toBe(true)
    expect(hasTabPermission(reviewerSession, 'submissions', 'view')).toBe(true)
    expect(hasTabPermission(reviewerSession, 'submissions', 'edit')).toBe(false)
    expect(hasTabPermission(reviewerSession, 'orders', 'view')).toBe(false)

    expect(hasAdminAccess(artistSession)).toBe(false)
    expect(hasTabPermission(artistSession, 'submissions', 'view')).toBe(false)
  })

  test('firstAllowedAdminRoute sends restricted staff directly to their first permitted tab', () => {
    const reviewerSession = {
      role: 'Reviewer',
      permissions: { ...buildDefaultPermissions('none'), submissions: 'view' }
    }
    expect(firstAllowedAdminRoute(reviewerSession)).toBe('/admin/submissions')
    expect(firstAllowedAdminRoute({ role: 'Admin' })).toBe('/admin')
    expect(firstAllowedAdminRoute({ role: 'Customer', permissions: buildDefaultPermissions('none') })).toBe('/')
  })

  test('saveSessionPermissions updates objs storage only when an authenticated token exists', () => {
    window.localStorage.setItem('objs', JSON.stringify({
      role: 'Reviewer',
      permissions: buildDefaultPermissions('none'),
    }))
    saveSessionPermissions('Reviewer', { ...buildDefaultPermissions('none'), orders: 'view' })
    let saved = JSON.parse(window.localStorage.getItem('objs'))
    expect(saved.permissions.orders).toBe('none')

    window.localStorage.setItem('objs', JSON.stringify({
      role: 'Reviewer',
      xAccessToken: 'tok-123',
      permissions: buildDefaultPermissions('none'),
    }))
    saveSessionPermissions('Reviewer', { ...buildDefaultPermissions('none'), orders: 'view' })
    saved = JSON.parse(window.localStorage.getItem('objs'))
    expect(saved.permissions.orders).toBe('view')
    window.localStorage.removeItem('objs')
  })
})
