// Match checkout eligibility before offering or adding an artwork to the cart.
export function isArtworkPurchasable(artwork, getName) {
  const status = artwork && artwork.status;
  if (!status || !status.approval || !status.sale) return false;
  if (getName('en', status.approval) !== 'Approved' || getName('en', status.sale) !== 'Available') return false;
  const lifecycle = artwork.postTermSale;
  if (!lifecycle || !lifecycle.applicable) return true;
  if (lifecycle.needsReview || !lifecycle.initialSaleEndsAt) return false;
  return new Date(lifecycle.initialSaleEndsAt).getTime() > Date.now() || lifecycle.decision === 'continue_sale';
}
