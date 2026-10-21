import Service from '@/service/api'

const pending = new WeakMap()
const release = entry => { if (entry?.url) URL.revokeObjectURL(entry.url) }

async function update(el, { value, oldValue }) {
  if (value === oldValue && pending.has(el)) return
  release(pending.get(el))
  const entry = {}
  pending.set(el, entry)
  el.removeAttribute('src')
  if (!value) return
  const base = String(process.env.VUE_APP_API_URL || '').replace(/\/$/, '')
  const prefix = `${base}/api/v1/submission/image/`
  const id = value.startsWith(prefix) ? value.slice(prefix.length) : ''
  if (!/^[a-f\d]{24}$/i.test(id)) {
    el.setAttribute('src', value)
    return
  }
  try {
    const response = await Service.submission('image', id)
    if (pending.get(el) !== entry) return
    entry.url = URL.createObjectURL(response.data)
    el.setAttribute('src', entry.url)
  } catch (_) {
    // A later render may retry; keep successful and in-flight entries cached.
    if (pending.get(el) === entry) pending.delete(el)
  }
}

export default {
  bind: update,
  update,
  unbind(el) {
    release(pending.get(el))
    pending.delete(el)
  }
}
