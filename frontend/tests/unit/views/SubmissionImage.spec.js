import directive from '@/directives/submissionImage'
import Service from '@/service/api'
const id = '6ad1cd2872d6f3922c98929a'
const source = `${String(process.env.VUE_APP_API_URL || '').replace(/\/$/, '')}/api/v1/submission/image/${id}`
beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(Service, 'submission')
  URL.createObjectURL = jest.fn(() => 'blob:qa-image')
  URL.revokeObjectURL = jest.fn()
})
afterEach(() => jest.restoreAllMocks())

test('loads private images through the authenticated API service and releases their blobs', async () => {
  const el = document.createElement('img')
  Service.submission.mockResolvedValue({ data: new Blob(['image']) })
  await directive.bind(el, { value: source })
  expect(Service.submission).toHaveBeenCalledWith('image', id)
  expect(el.getAttribute('src')).toBe('blob:qa-image')
  directive.unbind(el)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:qa-image')
})

test('never falls back to a private image source after authorization fails', async () => {
  const el = document.createElement('img')
  Service.submission.mockRejectedValue(Error('404'))
  await directive.bind(el, { value: source })
  expect(el.hasAttribute('src')).toBe(false)
  expect(URL.createObjectURL).not.toHaveBeenCalled()
})

test('retries the same private image when it is shown again after a loading failure', async () => {
  const el = document.createElement('img')
  Service.submission.mockRejectedValueOnce(Error('offline')).mockResolvedValueOnce({ data: new Blob(['image']) })
  await directive.bind(el, { value: source })
  expect(el.hasAttribute('src')).toBe(false)
  await directive.update(el, { value: source, oldValue: source })
  expect(Service.submission).toHaveBeenCalledTimes(2)
  expect(el.getAttribute('src')).toBe('blob:qa-image')
  directive.unbind(el)
})

test('a rerender does not duplicate an image request that is still loading', async () => {
  const el = document.createElement('img')
  let finish
  Service.submission.mockReturnValue(new Promise(resolve => { finish = resolve }))
  const loading = directive.bind(el, { value: source })
  await directive.update(el, { value: source, oldValue: source })
  expect(Service.submission).toHaveBeenCalledTimes(1)
  finish({ data: new Blob(['image']) }); await loading
  directive.unbind(el)
})

test('ignores a request completed after the image was replaced or removed', async () => {
  const el = document.createElement('img')
  let resolve
  Service.submission.mockReturnValue(new Promise(done => { resolve = done }))
  const loading = directive.bind(el, { value: source })
  await directive.update(el, { value: 'https://example.com/public.png', oldValue: source })
  resolve({ data: new Blob(['old image']) })
  await loading
  expect(el.getAttribute('src')).toBe('https://example.com/public.png')
  expect(URL.createObjectURL).not.toHaveBeenCalled()
  directive.unbind(el)
})
