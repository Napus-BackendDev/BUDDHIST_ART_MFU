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
  it('uses reservation confirmation wording when slip is attached', () => {
    const html = confirmation({ buyerName: 'B', orderId: 'ORD-1', artworkTitle: 'A', price: 1, orderDate: 'd', paymentReceived: true });
    expect(html).toContain('ใบยืนยันการจองและหลักฐานการชำระเงิน');
    expect(html).not.toContain('ใบแจ้งหนี้และหลักฐานการชำระเงิน');
  });
});

describe('Certificate of Authenticity mail template feedback', () => {
  const certTemplate = require('../server/Project/Mail/certificateOfAuthenticity');
  const requiredFields = ['ARTWORK TITLE', 'ARTIST', 'YEAR OF CREATION', 'TECHNIQUE', 'SIZE', 'EDITION', 'CERTIFICATE NO.'];

  it('includes course emblem, ivory certificate layout, centered artist signature owner name without seal, and all metadata fields', () => {
    const html = certTemplate({
      title: 'Lotus Mind',
      artist: 'Artist A',
      size: '50 x 70 cm',
      year: '2026',
      technique: 'Acrylic on canvas',
      artworkCode: 'BA-2569-06-001',
      logoCid: 'course-logo@mfu',
    });
    expect(html).toContain('cid:course-logo@mfu');
    expect(html).toContain('CERTIFICATE OF AUTHENTICITY');
    expect(html).toContain('#f5f2eb');
    requiredFields.forEach(label => expect(html).toContain(label));
    expect(html).toContain('Artist A');
    expect(html).toContain('Buddhist Art MFU');
    expect(html).toContain('Tel 0-5391-7897 to 8036');
    expect(html).toContain('www.buddhistartspace.mfu.ac.th');
    expect(html).not.toContain('mfuSealTextArc');
    expect(html).not.toContain('Art Signatue');
    expect(html).not.toContain('Collector Name');
  });

  it('forwards inline logoCid in approvedOrderMail', () => {
    const html = approvedOrderMail({
      buyerName: 'Buyer',
      orderId: 'ORD-1',
      artworkTitle: 'Lotus Mind',
      price: 5000,
      orderDate: 'today',
      logoCid: 'course-logo@mfu',
    });
    expect(html).toContain('cid:course-logo@mfu');
    expect(html).toContain('CERTIFICATE OF AUTHENTICITY');
  });

  it.each([
    { code: 'PAINTING', title: { en: 'Painting', th: 'จิตรกรรม' }, size: '50 x 70 cm' },
    { code: 'DRAWING', title: { en: 'Drawing', th: 'การวาดเส้น' }, size: '40 x 60 cm' },
    { code: 'DIGITAL_ART', title: { en: 'Digital Art', th: 'ศิลปะดิจิทัล' }, size: '4000 x 3000 px' },
    { code: 'MIXED_MEDIA', title: { en: 'Mixed Media', th: 'สื่อผสม' }, size: '80 x 100 cm' },
    { code: 'OTHERS', title: { en: 'Others', th: 'อื่นๆ' }, size: '60 x 80 cm' },
  ])('renders SIZE label for 2D category %s', (category) => {
    const html = certTemplate({
      title: '2D Artwork',
      artist: 'Artist A',
      size: category.size,
      category,
      year: '2026',
      artworkCode: 'BA-2569-06-002',
    });
    expect(html).toContain('>SIZE</td>');
    expect(html).not.toContain('>DIMENSION</td>');
  });

  it.each([
    { label: 'SCULPTURE code', category: { code: 'SCULPTURE', title: { en: 'Sculpture', th: 'ประติมากรรม' } }, size: '40 x 40 x 80 cm' },
    { label: 'INSTALLATION_ART code', category: { code: 'INSTALLATION_ART', title: { en: 'Installation Art', th: 'ศิลปะการติดตั้ง' } }, size: '120 x 120 x 200 cm' },
    { label: 'Thai sculpture title', category: { title: { th: 'ประติมากรรม' } }, size: 'N/A' },
    { label: '3D numeric dimensions fallback', category: { code: 'OTHERS', title: { en: 'Others' } }, size: '60 × 60 × 50 cm' },
  ])('renders DIMENSION label for 3D case ($label)', ({ category, size }) => {
    const html = certTemplate({
      title: '3D Artwork',
      artist: 'Artist B',
      size,
      category,
      year: '2026',
      artworkCode: 'BA-2569-06-003',
    });
    expect(html).toContain('>DIMENSION</td>');
    expect(html).not.toContain('>SIZE</td>');
  });

  it('forwards artwork.category in approvedOrderMail for DIMENSION vs SIZE', () => {
    const html3d = approvedOrderMail({
      buyerName: 'Buyer',
      orderId: 'ORD-3D',
      artworkTitle: 'Bronze Form',
      price: 12000,
      artwork: {
        size: [{ key: 'en', value: '30 x 30 x 60 cm' }],
        category: { code: 'SCULPTURE', title: { en: 'Sculpture', th: 'ประติมากรรม' } },
      },
    });
    expect(html3d).toContain('>DIMENSION</td>');
    expect(html3d).not.toContain('>SIZE</td>');
  });
});
