// Plain-language list of what still blocks a disabled Save/Create button.
const L = {
  studentId: ['Student ID', 'รหัสนักศึกษา'],
  role: ['Role', 'บทบาท'],
  status: ['Account status', 'สถานะบัญชี'],
  name: ['Name', 'ชื่อ'],
  email: ['A valid email', 'อีเมลที่ถูกต้อง'],
  titleTh: ['Thai title', 'ชื่อผลงานภาษาไทย'],
  titleEn: ['English title', 'ชื่อผลงานภาษาอังกฤษ'],
  title: ['Title (Thai or English)', 'ชื่อผลงาน (ไทยหรืออังกฤษ)'],
  artist: ['Artist', 'ศิลปิน'],
  category: ['Category', 'หมวดหมู่'],
  size: ['Size (all dimensions above 0)', 'ขนาด (ทุกมิติมากกว่า 0)'],
  price: ['Price (0 or more)', 'ราคา (0 ขึ้นไป)'],
  image: ['Artwork image', 'รูปผลงาน'],
  imageBusy: ['Wait for the image to finish processing', 'รอให้ประมวลผลรูปเสร็จ'],
  nameTh: ['Thai name', 'ชื่อภาษาไทย'],
  nameEn: ['English name', 'ชื่อภาษาอังกฤษ'],
  group: ['Group', 'กลุ่ม'],
  storageDetail: ['Exact storage location', 'ตำแหน่งจัดเก็บ']
}

const label = (key, locale) => L[key][locale === 'en' ? 0 : 1]
const has = value => String(value == null ? '' : value).trim() !== ''
const positive = value => Number.isFinite(Number(value)) && Number(value) > 0 && has(value)

export const dimensionsOk = (form, is3D) => [form.width, form.height, ...(is3D ? [form.depth] : [])].every(positive)
export const priceOk = value => has(value) && Number.isFinite(Number(value)) && Number(value) >= 0

// `rules` is an ordered list of [key, isOk] pairs; returns the labels of the failing ones.
export const missingLabels = (rules, locale) => rules.filter(([, ok]) => !ok).map(([key]) => label(key, locale))

export const missingText = (labels, locale) => labels.length
  ? `${locale === 'en' ? 'Still needed' : 'ยังขาด'}: ${labels.join(', ')}`
  : ''
