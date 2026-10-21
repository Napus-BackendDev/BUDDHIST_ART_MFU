const cents = value => Math.round((Number(value) || 0) * 100);
const idOf = value => String(value?._id || value || '');

// Orders charge only artwork prices; shipping is always free.
const calculateOrderAmounts = artworks => {
    const items = (artworks || []).map(art => ({ artwork: art._id, price: cents(art.price) / 100 }));
    const subtotal = items.reduce((sum, item) => sum + cents(item.price), 0) / 100;
    const shipping = 0;
    return { subtotal, shipping, total: subtotal + shipping, items };
};
const getOrderAmounts = order => {
    if (order.amounts && Number.isFinite(order.amounts.subtotal)) {
        return { subtotal: order.amounts.subtotal, shipping: 0, total: order.amounts.subtotal, items: order.amounts.items };
    }
    // Keep the saved artwork price even if the catalogue price has changed.
    const amounts = calculateOrderAmounts(order.artwork);
    return { ...amounts, shipping: 0, total: amounts.subtotal };
};
const getLinePrice = (order, artwork) => {
    const saved = order.amounts?.items?.find(item => idOf(item.artwork) === idOf(artwork));
    return saved ? saved.price : (Number(artwork.price) || 0);
};
module.exports = { calculateOrderAmounts, getOrderAmounts, getLinePrice };
