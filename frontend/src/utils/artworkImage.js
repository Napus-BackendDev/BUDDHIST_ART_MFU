export async function readArtworkImage(file, locale) {
  const en = locale === 'en'
  if (!/^image\/(png|jpeg|jpg)$/.test(file.type || '')) throw new Error(en ? 'Only PNG or JPG images are supported.' : 'รองรับเฉพาะภาพ PNG หรือ JPG')
  if (file.size > 5 * 1024 * 1024) throw new Error(en ? 'Image size must not exceed 5 MB.' : 'ขนาดรูปภาพต้องไม่เกิน 5 MB')
  return decodeImageFile(file, locale)
}

export function decodeImageFile(file, locale) {
  const en = locale === 'en'
  const invalid = () => new Error(en ? 'Unable to read this image. Please choose another file.' : 'ไม่สามารถอ่านรูปภาพนี้ได้ กรุณาเลือกไฟล์อื่น')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(invalid())
    reader.onload = () => {
      if (typeof reader.result !== 'string') { reject(invalid()); return }
      const image = new Image()
      image.onerror = () => reject(invalid())
      image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0 ? resolve(reader.result) : reject(invalid())
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
