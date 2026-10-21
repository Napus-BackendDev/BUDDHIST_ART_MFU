export const shippingForSubtotal = () => 0
export const checkoutAmounts = artworks => {
  const subtotal = (artworks || []).reduce((sum, art) => sum + Math.round((Number(art.price) || 0) * 100), 0) / 100
  const shipping = shippingForSubtotal(subtotal)
  return { subtotal, shipping, total: subtotal + shipping }
}

export const orderAmounts = order => {
  const saved = order?.amounts || order
  if (saved && Number.isFinite(saved.subtotal)) {
    return { ...saved, shipping: 0, total: saved.subtotal }
  }
  const amounts = checkoutAmounts(order?.artwork)
  return { ...amounts, shipping: 0, total: amounts.subtotal }
}

export const orderLinePrice = (order, artwork) => {
  const saved = order?.amounts?.items?.find(item => String(item.artwork?._id || item.artwork) === String(artwork?._id))
  return saved && Number.isFinite(saved.price) ? saved.price : (Number(artwork?.price) || 0)
}
