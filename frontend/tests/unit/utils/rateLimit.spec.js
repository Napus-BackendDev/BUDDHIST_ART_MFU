import { retryAtFromHeaders } from '@/utils/rateLimit'
test('supports Retry-After seconds, HTTP dates and invalid/missing header fallbacks', () => {
  const now = Date.parse('2026-10-14T00:00:00Z')
  expect(retryAtFromHeaders({ 'retry-after': '30' }, now)).toBe(now + 30000)
  expect(retryAtFromHeaders({ 'retry-after': 'Wed, 14 Oct 2026 00:02:00 GMT' }, now)).toBe(now + 120000)
  expect(retryAtFromHeaders({ 'retry-after': 'invalid' }, now)).toBe(now + 60000)
  expect(retryAtFromHeaders({}, now)).toBe(now + 60000)
})
