import router from '@/router'

test('bill redirects to the payment confirmation with a real query parameter', () => {
  const route = router.match('/bill')
  expect(route.name).toBe('Payment')
  expect(route.path).toBe('/payment')
  expect(route.query.step).toBe('3')
})

// Vue Router generates a trailing slash for a named empty-path child.
test.each([['Users', 'Home', '/'], ['Admin', 'Overview', '/admin/']])('named container %s renders its default page', (name, page, path) => {
  const route = router.match({ name, query: { qa: 'preserved' }, hash: '#section' })
  expect(route.path).toBe(path)
  expect(route.name).toBe(page)
  expect(route.matched).toHaveLength(2)
  expect(route.query).toEqual({ qa: 'preserved' })
  expect(route.hash).toBe('#section')
})

test('named not-found route renders its message inside the public container', () => {
  const route = router.match({ name: 'NotFound', params: { pathMatch: '/qa-missing-page' } })
  expect(route.path).toBe('/qa-missing-page/')
  expect(route.matched).toHaveLength(2)
  expect(route.matched[1].components.default).toBeDefined()
})

test('path navigation still resolves default pages, protected children and fallback', () => {
  expect(router.match('/').name).toBe('Home')
  expect(router.match('/admin').name).toBe('Overview')
  const orders = router.match('/admin/orders')
  expect(orders.name).toBe('OrdersAdmin')
  expect(orders.matched.some(record => record.meta.requiresAuth && (record.meta.requiresAdminAccess || (record.meta.roles || []).includes('admin')))).toBe(true)
  expect(router.match('/qa-missing-page').matched).toHaveLength(2)
})
