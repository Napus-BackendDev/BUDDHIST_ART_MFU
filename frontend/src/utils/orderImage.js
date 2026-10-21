export const orderImageError = (file, locale) => {
  if (!/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.type || '')) {
    return locale === 'en' ? 'Only PNG, JPG, GIF or WEBP images are supported.' : 'รองรับเฉพาะภาพ PNG, JPG, GIF หรือ WEBP'
  }
  if (file.size > 2 * 1024 * 1024) {
    return locale === 'en' ? 'Image size exceeds 2MB limit.' : 'ขนาดรูปภาพต้องไม่เกิน 2MB'
  }
  return ''
}
