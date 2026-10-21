// Private order PDFs must be downloaded by the authenticated application.
export const orderDocumentUrl = (order, document) => {
  if (!order?._id || !['invoice', 'certificate'].includes(document)) return ''
  const url = new URL('/admin/orders', window.location.origin)
  url.searchParams.set('order', String(order._id))
  url.searchParams.set('document', document)
  return url.toString()
}
