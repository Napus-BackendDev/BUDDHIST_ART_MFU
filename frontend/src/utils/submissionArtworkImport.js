// Keep the downloadable form in the same column order as the cohort 6 source.
export const artworkFormHeaders = [
  'ประทับเวลา', 'รหัสประจำตัว', 'ผลงานชิ้นที่', 'ลำดับ', 'ชื่อผู้เรียน',
  'ชื่อผู้เรียน (ภาษาอังกฤษ)', 'ชื่อผลงาน', 'ชื่อผลงาน (ภาษาอังกฤษ)',
  'ขนาด', 'เทคนิค', 'คำอธิบายผลงานสั้น ๆ (3 บรรทัด)', 'แนวคิด (ภาษาอังกฤษ) ถ้ามี',
  'ราคาผลงาน', 'ประเภทผลงาน', 'วิธีการนำเสนอ / การติดตั้งผลงาน',
  'ผลงานสร้างสรรค์ชิ้นที่', 'อัพโหลดภาพผลงานสมบูรณ์', 'คอลัมน์ 1'
]

const text = value => String(value == null ? '' : value).trim()
const normalize = value => text(value).toLowerCase().replace(/\s+/g, '')
export const imageFilenameKey = value => normalize(value).replace(/\.[^.]+$/, '').replace(/[_\-()]/g, '')
export const bilingual = (th, en) => [
  th ? { key: 'th', value: text(th) } : null,
  en ? { key: 'en', value: text(en) } : null
].filter(Boolean)

function field(row, names) {
  for (const name of names) {
    const key = Object.keys(row).find(k => normalize(k) === normalize(name))
    if (key && text(row[key])) return row[key]
  }
  return ''
}

export function imageLink(value) {
  try {
    const url = new URL(text(value))
    if (!['https:', 'http:'].includes(url.protocol)) return ''
    if (url.hostname === 'drive.google.com') {
      const id = url.searchParams.get('id') || (url.pathname.match(/\/file\/d\/([^/]+)/) || [])[1]
      return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` : ''
    }
    if (url.hostname === 'mfudrive.mfu.ac.th' && /^\/s\/[^/]+\/?$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/$/, '') + '/download'
    }
    return url.href
  } catch (_) { return '' }
}

export function submissionImageUrl(artworkId, source) {
  if (!source) return ''
  try {
    const url = new URL(source)
    if (artworkId && ['drive.google.com', 'mfudrive.mfu.ac.th'].includes(url.hostname)) {
      return `${String(process.env.VUE_APP_API_URL || '').replace(/\/$/, '')}/api/v1/submission/image/${encodeURIComponent(artworkId)}`
    }
  } catch (_) { /* Local uploads keep their existing URL. */ }
  return source
}

// Published artworks retain the identity of their original Submission image.
// Resolve display URLs without changing the stored source used by edit forms.
export function artworkImageUrl(artwork) {
  return submissionImageUrl(artwork?.submissionArtworkId, artwork?.image)
}

function categoryId(value, categories) {
  const names = text(value).split(/[()]/).map(normalize).filter(Boolean)
  const matches = categories.filter(category => {
    const localized = category.name || category.title || []
    const labels = Array.isArray(localized) ? localized.map(item => item.value) : [localized]
    return [...labels, category.nameEn, category.nameTh].some(label => label && names.includes(normalize(label)))
  })
  return matches.length === 1 ? matches[0]._id : null
}

export function parseArtworkRows(raw, users = [], categories = []) {
  if (!raw.length) throw Error('ไฟล์ไม่มีข้อมูลผลงาน')
  const keys = Object.keys(raw[0]).map(normalize)
  if (!['รหัสประจำตัว', 'ArtistID', 'StudentID', 'ArtistStudentID'].some(k => keys.includes(normalize(k))) ||
      !['ชื่อผลงาน', 'ArtworkTitleThai', 'TitleThai', 'ArtworkTitleEng', 'ArtworkTitleEnglish', 'TitleEng'].some(k => keys.includes(normalize(k)))) {
    throw Error('หัวคอลัมน์ไม่ตรงกับแบบฟอร์มผลงาน กรุณาดาวน์โหลด Template')
  }
  return raw.map((row, index) => {
    const get = (...names) => field(row, names)
    const studentId = text(get('รหัสประจำตัว', 'ArtistID', 'StudentID', 'ArtistStudentID'))
    const titleTh = text(get('ชื่อผลงาน', 'ArtworkTitleThai', 'TitleThai'))
    const titleEn = text(get('ชื่อผลงาน (ภาษาอังกฤษ)', 'ArtworkTitleEng', 'ArtworkTitleEnglish', 'TitleEng'))
    // Form exports may have notes/formatting beneath the actual data.
    if (!studentId && !titleTh && !titleEn) return null
    const owners = users.filter(user => text(user.studentId || user.studentID) === studentId)
    const category = text(get('ประเภทผลงาน', 'Category'))
    const price = Number(text(get('ราคาผลงาน', 'Price')).replace(/,/g, ''))
    const timestamp = get('ประทับเวลา')
    const submittedAt = timestamp ? new Date(timestamp) : null
    const sourceImage = ['คอลัมน์ 1', 'อัพโหลดภาพผลงานสมบูรณ์', 'ImageURL', 'ArtworkImage', 'Image']
      .map(name => text(get(name))).find(value => imageLink(value)) || ''
    const remarkTh = [get('วิธีการนำเสนอ / การติดตั้งผลงาน', 'RemarkThai'), get('ผลงานสร้างสรรค์ชิ้นที่')].filter(Boolean).join('\n')
    const result = {
      rowNumber: row.__rowNum__ == null ? index + 2 : row.__rowNum__ + 1,
      studentId, artistName: text(get('ชื่อผู้เรียน')), artistNameEn: text(get('ชื่อผู้เรียน (ภาษาอังกฤษ)')),
      artistId: owners.length === 1 ? owners[0]._id : null,
      titleTh, titleEn,
      descriptionTh: text(get('คำอธิบายผลงานสั้น ๆ (3 บรรทัด)', 'DescriptionThai', 'ArtworkDescriptionThai')),
      descriptionEn: text(get('แนวคิด (ภาษาอังกฤษ) ถ้ามี', 'DescriptionEng', 'ArtworkDescriptionEng')),
      techniqueTh: text(get('เทคนิค', 'TechniqueThai', 'Technique')),
      techniqueEn: text(get('TechniqueEng', 'เทคนิค', 'Technique')),
      sizeTh: text(get('ขนาด', 'SizeThai', 'Size')),
      sizeEn: text(get('SizeEng', 'ขนาด', 'Size')),
      remarkTh, remarkEn: text(get('RemarkEng')), price, category,
      categoryId: categoryId(category, categories), sourceImage,
      imageUrl: imageLink(sourceImage),
      imageFilename: text(get('ImageFilename', 'Filename')) || (!imageLink(get('Image', 'ArtworkImage')) ? text(get('Image', 'ArtworkImage')) : ''),
      submittedAt: submittedAt && !isNaN(submittedAt.getTime()) ? submittedAt : null,
      piece: text(get('ผลงานชิ้นที่')), sequence: text(get('ลำดับ')),
      issues: []
    }
    if (!result.artistId) result.issues.push('ไม่พบรหัสผู้เรียนที่ตรงกันเพียงคนเดียว')
    if (!titleTh && !titleEn) result.issues.push('ไม่มีชื่อผลงาน')
    if (!Number.isFinite(price) || price < 0) result.issues.push('ราคาไม่ถูกต้อง')
    if (category && !result.categoryId) result.issues.push('ไม่พบประเภทผลงานที่ตรงกันเพียงประเภทเดียว')
    if (timestamp && !result.submittedAt) result.issues.push('ประทับเวลาไม่ถูกต้อง')
    result.importKey = result.sequence && result.submittedAt
      ? JSON.stringify([studentId, result.sequence, result.submittedAt.toISOString()]) : null
    return result
  }).filter(Boolean)
}

export function matchArtworkImages(rows, files) {
  return rows.map(row => {
    const titles = [row.titleTh, row.titleEn].filter(Boolean).map(imageFilenameKey)
    const qualified = row.sequence ? [row.studentId, row.titleTh, row.titleEn].filter(Boolean).map(value => imageFilenameKey(`${value}_${row.sequence}`)) : []
    let candidates = row.imageFilename ? [imageFilenameKey(row.imageFilename)] : qualified
    let matches = files.filter(file => candidates.includes(imageFilenameKey(file.name)))
    let sharedTitle = false
    if (!row.imageFilename && !matches.length) {
      matches = files.filter(file => titles.includes(imageFilenameKey(file.name)))
      sharedTitle = matches.some(file => rows.some(other => other !== row && [other.titleTh, other.titleEn].filter(Boolean).map(imageFilenameKey).includes(imageFilenameKey(file.name))))
    }
    return { ...row, image: matches.length === 1 && !sharedTitle ? matches[0] : null, ambiguousImage: matches.length > 1 || sharedTitle }
  })
}

export function artworkPayload(row, image, status) {
  return {
    title: bilingual(row.titleTh, row.titleEn), description: bilingual(row.descriptionTh, row.descriptionEn),
    technique: bilingual(row.techniqueTh, row.techniqueEn), size: bilingual(row.sizeTh, row.sizeEn),
    remark: bilingual(row.remarkTh, row.remarkEn), price: row.price, image,
    owner: row.artistId, category: row.categoryId, status, importKey: row.importKey,
    create: { at: row.submittedAt || new Date() }
  }
}
