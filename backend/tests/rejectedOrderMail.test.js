const template = require('../server/Project/Mail/rejectedOrder');

test('rejection explains the released reservation and escapes dynamic content', () => {
  const html = template({ buyerName: 'QA <Buyer>', orderId: 'QA-ORDER', artworkTitle: '<Artwork>', reason: '<b>QA reason</b>' });
  expect(html).toContain('การจองในคำสั่งซื้อนี้สิ้นสุดแล้ว');
  expect(html).toContain('ตรวจสอบว่าผลงานยังพร้อมขายก่อนทำรายการจองใหม่');
  expect(html).not.toContain('ดำเนินการอัปโหลดภาพหลักฐานการโอนเงินที่ถูกต้องใหม่อีกครั้ง');
  expect(html).toContain('&lt;b&gt;QA reason&lt;/b&gt;');
  expect(html).not.toContain('<b>QA reason</b>');
});
