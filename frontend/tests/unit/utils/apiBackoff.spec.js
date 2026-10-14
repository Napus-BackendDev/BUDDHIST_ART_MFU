let handlers
let now
beforeEach(() => {
  jest.resetModules()
  now = Date.now()
  jest.spyOn(Date, 'now').mockImplementation(() => now)
  const instance = { defaults: {}, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } }
  jest.doMock('axios', () => ({ create: () => instance }))
  jest.doMock('@/store/store', () => ({ state: {}, getters: {} }))
  require('@/service/api')
  handlers = { request: instance.interceptors.request.use.mock.calls[0][0], error: instance.interceptors.response.use.mock.calls[0][1] }
})
afterEach(() => jest.restoreAllMocks())

test('background reads stop making HTTP requests during Retry-After; writes remain independent', async () => {
  const error = { config: { method: 'get' }, response: { status: 429, headers: { 'retry-after': '30' } } }
  await expect(handlers.error(error)).rejects.toBe(error)
  await expect(handlers.request({ method: 'get', headers: {} })).rejects.toMatchObject({ response: { status: 429 } })
  expect(handlers.request({ method: 'post', headers: {} }).method).toBe('post')
  now += 30000
  expect(handlers.request({ method: 'get', headers: {} }).method).toBe('get')
})
test('authentication throttling does not stop public reads', async () => {
  const error = { config: { method: 'post' }, response: { status: 429, headers: { 'retry-after': '900' } } }
  await expect(handlers.error(error)).rejects.toBe(error)
  expect(handlers.request({ method: 'get', headers: {} }).method).toBe('get')
})
