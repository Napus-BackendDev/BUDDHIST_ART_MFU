// Pure unit tests (no DB / no app) — verify order mail templates never crash when
// an artwork price is missing (was `price.toLocaleString()` on undefined -> TypeError).
const confirmationOrderMail = require('../server/Project/Mail/confirmationOrder');
const approvedOrderMail = require('../server/Project/Mail/approvedOrder');
const adminNewOrderMail = require('../server/Project/Mail/adminNewOrder');

describe('Order mail templates tolerate a missing price', () => {
  const cases = [
    ['confirmationOrder', confirmationOrderMail],
    ['approvedOrder', approvedOrderMail],
    ['adminNewOrder', adminNewOrderMail],
  ];

  it.each(cases)('%s renders without throwing when price is undefined', (name, template) => {
    let html;
    expect(() => {
      html = template({ buyerName: 'Buyer', orderId: 'ORD-2026-0001', artworkTitle: 'Artwork', orderDate: 'today' });
    }).not.toThrow();
    expect(typeof html).toBe('string');
    expect(html).toContain('฿0');
  });

  it('confirmationOrder formats a real price with thousands separators', () => {
    const html = confirmationOrderMail({ buyerName: 'B', orderId: 'ORD-1', artworkTitle: 'A', price: 12000, orderDate: 'd' });
    expect(html).toContain('฿12,000');
  });
});

describe('payment-received confirmation', () => {
  const confirmation = require('../server/Project/Mail/confirmationOrder');
  it('does not ask a buyer who already sent a slip to pay within 24 hours', () => {
    const html = confirmation({ buyerName: 'B', orderId: 'ORD-1', artworkTitle: 'A', price: 1, orderDate: 'd', paymentReceived: true });
    expect(html).toContain('ได้รับหลักฐานการชำระเงิน');
    expect(html).not.toContain('ภายใน 24 ชั่วโมง');
  });
  it('reservation email still asks for payment', () => {
    const html = confirmation({ buyerName: 'B', orderId: 'ORD-1', artworkTitle: 'A', price: 1, orderDate: 'd' });
    expect(html).toContain('ภายใน 24 ชั่วโมง');
  });
});
