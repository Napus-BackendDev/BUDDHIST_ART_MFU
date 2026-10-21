export function paymentSlipIssue(file) {
  if (file.size > 10 * 1024 * 1024) return 'size';
  return /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type) && /\.(jpeg|jpg|png|gif|webp)$/i.test(file.name) ? '' : 'type';
}

export function canUploadPaymentSlip(order, getName, now = Date.now()) {
  if (!order || order.image) return false;
  const status = order.status?.code || getName('en', order.status);
  const created = new Date(order.createdAt).getTime();
  return String(status).toUpperCase() === 'RESERVED' && Number.isFinite(created) && created + 24 * 3600000 > now;
}

export function paymentSlipMessage(issue, locale) {
  const messages = locale === 'en'
    ? {size:'File size exceeds the 10MB limit.',type:'Choose a JPG, PNG, GIF or WebP image.',expired:'This order is no longer awaiting payment. Check your order history.',upload:'Upload failed. Please try again.'}
    : {size:'ขนาดไฟล์เกิน 10MB',type:'กรุณาเลือกรูปภาพ JPG, PNG, GIF หรือ WebP',expired:'คำสั่งซื้อนี้ไม่อยู่ในสถานะรอชำระเงินแล้ว กรุณาตรวจสอบประวัติคำสั่งซื้อ',upload:'อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'};
  return messages[issue] || '';
}
