import * as XLSX from 'xlsx'
import { artworkFormHeaders, parseArtworkRows, matchArtworkImages, artworkPayload, imageLink, submissionImageUrl, artworkImageUrl } from '@/utils/submissionArtworkImport'

const users = [{ _id: 'artist-1', studentId: '6980000055' }]
const categories = [{ _id: 'painting', name: [{ key: 'th', value: 'จิตรกรรม' }, { key: 'en', value: 'Painting' }] }]
const source = {
  'ประทับเวลา': new Date('2026-08-28T13:01:45.786Z'), 'รหัสประจำตัว': 6980000055,
  'ผลงานชิ้นที่': 1, 'ลำดับ': 1, 'ชื่อผู้เรียน': 'ผู้เรียนทดสอบ', 'ชื่อผู้เรียน (ภาษาอังกฤษ)': 'Test Artist',
  'ชื่อผลงาน': 'งามลวง ', 'ชื่อผลงาน (ภาษาอังกฤษ)': 'BEAUTIFUL DECEPTION ',
  'ขนาด': '150 × 200 cm', 'เทคนิค': 'Acrylic on canvas',
  'คำอธิบายผลงานสั้น ๆ (3 บรรทัด)': 'แนวคิดภาษาไทย', 'แนวคิด (ภาษาอังกฤษ) ถ้ามี': 'English concept',
  'ราคาผลงาน': '50,000', 'ประเภทผลงาน': 'Painting (จิตรกรรม)',
  'วิธีการนำเสนอ / การติดตั้งผลงาน': 'ติดตั้งบนผนัง',
  'ผลงานสร้างสรรค์ชิ้นที่': 'ผลงานชิ้นที่ 1 (ส่งประเมินวันที่ 29 สิงหาคม 2569)',
  'อัพโหลดภาพผลงานสมบูรณ์': 'https://drive.google.com/open?id=test-id', 'คอลัมน์ 1': ''
}
const parse = row => parseArtworkRows([row], users, categories)[0]

describe('Submission artwork form import', () => {
  test('published artworks display the original submission image without rewriting their source', () => {
    const artwork = { _id: 'published-id', submissionArtworkId: 'submission-id', image: 'https://drive.google.com/thumbnail?id=source' }
    const original = { ...artwork }
    expect(artworkImageUrl(artwork)).toMatch(/\/api\/v1\/submission\/image\/submission-id$/)
    expect(artwork).toEqual(original)
    expect(artworkImageUrl({ _id: 'direct-artwork', image: 'http://localhost:8081/uploads/direct.jpg' })).toBe('http://localhost:8081/uploads/direct.jpg')
    expect(artworkImageUrl(null)).toBe('')
  })
  test('renders imported Drive links through the image API while preserving uploaded image URLs', () => {
    expect(submissionImageUrl('artwork-1', 'https://drive.google.com/thumbnail?id=file-id')).toMatch(/\/api\/v1\/submission\/image\/artwork-1$/)
    expect(submissionImageUrl('artwork-2', 'https://mfudrive.mfu.ac.th/s/test/download')).toMatch(/\/api\/v1\/submission\/image\/artwork-2$/)
    expect(submissionImageUrl('artwork-3', 'http://localhost:8081/uploads/test.jpg')).toBe('http://localhost:8081/uploads/test.jpg')
    expect(submissionImageUrl('artwork-4', null)).toBe('')
  })
  test('maps Thai form columns to the existing submission artwork schema', () => {
    const row = parse(source)
    expect(row.issues).toEqual([])
    expect(row).toMatchObject({ rowNumber: 2, titleTh: 'งามลวง', titleEn: 'BEAUTIFUL DECEPTION', artistId: 'artist-1', categoryId: 'painting', price: 50000 })
    expect(artworkPayload(row, row.imageUrl, 'pending')).toMatchObject({
      title: [{ key: 'th', value: 'งามลวง' }, { key: 'en', value: 'BEAUTIFUL DECEPTION' }],
      description: [{ key: 'th', value: 'แนวคิดภาษาไทย' }, { key: 'en', value: 'English concept' }],
      size: [{ key: 'th', value: '150 × 200 cm' }, { key: 'en', value: '150 × 200 cm' }],
      technique: [{ key: 'th', value: 'Acrylic on canvas' }, { key: 'en', value: 'Acrylic on canvas' }],
      remark: [{ key: 'th', value: 'ติดตั้งบนผนัง\nผลงานชิ้นที่ 1 (ส่งประเมินวันที่ 29 สิงหาคม 2569)' }],
      create: { at: source['ประทับเวลา'] }, owner: 'artist-1', category: 'painting', status: 'pending'
    })
  })

  test('round-trips the 18 source columns through a downloadable Excel workbook', () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([artworkFormHeaders, artworkFormHeaders.map(h => source[h])])
    XLSX.utils.book_append_sheet(wb, ws, 'การตอบแบบฟอร์ม 1')
    const loaded = XLSX.read(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }), { type: 'array', cellDates: true })
    const raw = XLSX.utils.sheet_to_json(loaded.Sheets[loaded.SheetNames[0]], { defval: '' })
    expect(Object.keys(raw[0])).toEqual(artworkFormHeaders)
    expect(parse(raw[0])).toMatchObject({ artistId: 'artist-1', categoryId: 'painting', price: 50000, issues: [] })
  })

  test('skips trailing notes and preserves actual worksheet row numbers', () => {
    const row = { ...source }
    Object.defineProperty(row, '__rowNum__', { value: 25 })
    const rows = parseArtworkRows([row, { 'คอลัมน์ 1': 'หมายเหตุ' }], users, categories)
    expect(rows).toHaveLength(1)
    expect(rows[0].rowNumber).toBe(26)
  })

  test('keeps legacy English column imports working', () => {
    expect(parse({ StudentID: '6980000055', ArtworkTitleThai: 'งานเดิม', DescriptionThai: 'คำอธิบาย', TechniqueThai: 'สี', SizeThai: '10 cm', Price: 100, Category: 'Painting', ImageFilename: 'test.png' }))
      .toMatchObject({ titleTh: 'งานเดิม', descriptionTh: 'คำอธิบาย', techniqueTh: 'สี', sizeTh: '10 cm', price: 100, artistId: 'artist-1', categoryId: 'painting', imageFilename: 'test.png', issues: [] })
  })

  test.each(['-1', 'ไม่ระบุราคา', 'Infinity'])('rejects invalid price %s instead of importing zero', value => {
    expect(parse({ ...source, 'ราคาผลงาน': value }).issues).toContain('ราคาไม่ถูกต้อง')
  })

  test('reports unknown artists, categories and invalid timestamps', () => {
    expect(parse({ ...source, 'รหัสประจำตัว': 'unknown', 'ประเภทผลงาน': 'Unknown', 'ประทับเวลา': 'bad-date' }).issues).toHaveLength(3)
  })

  test.each(['Mixed Media & Kinetic Mechanism', 'Drawing Installation', 'สีอะคริลิคบนผ้าดิบ'])('imports unmatched category %s as Others and preserves original notes', category => {
    const other = { _id: 'other-id', code: 'OTHERS', title: [{ key: 'th', value: 'อื่นๆ' }] }
    const row = parseArtworkRows([{ ...source, 'ประเภทผลงาน': category }], users, [...categories, other])[0]
    expect(row).toMatchObject({ categoryId: 'other-id', categoryFallback: true, category, issues: [] })
    expect(artworkPayload(row, row.imageUrl, 'pending').remark).toContainEqual({
      key: 'th', value: `${source['วิธีการนำเสนอ / การติดตั้งผลงาน']}\n${source['ผลงานสร้างสรรค์ชิ้นที่']}\nประเภทผลงานตามต้นฉบับ: ${category}`
    })
  })

  test('keeps exact matches and falls back for ambiguous matches without guessing', () => {
    const other = { _id: 'other-id', title: [{ key: 'en', value: 'Others' }] }
    const exact = parseArtworkRows([source], users, [...categories, other])[0]
    expect(exact).toMatchObject({ categoryId: 'painting', categoryFallback: false })
    expect(exact.remarkTh).not.toContain('ประเภทผลงานตามต้นฉบับ')
    const ambiguous = parseArtworkRows([source], users, [...categories, { ...categories[0], _id: 'duplicate' }, other])[0]
    expect(ambiguous).toMatchObject({ categoryId: 'other-id', categoryFallback: true, issues: [] })
    const unresolved = parseArtworkRows([{ ...source, Category: '', 'ประเภทผลงาน': 'Unknown' }], users, [other, { ...other, _id: 'duplicate-other' }])[0]
    expect(unresolved.categoryId).toBeNull()
    expect(unresolved.issues).toContain('ไม่พบประเภทผลงานที่ตรงกันเพียงประเภทเดียว')
  })

  test('rejects unrelated workbook headers', () => {
    expect(() => parseArtworkRows([{ 'ชื่อ': 'คน' }])).toThrow('หัวคอลัมน์ไม่ตรง')
  })

  test('prefers the MFU image override and keeps the primary image when the override is empty', () => {
    expect(parse({ ...source, 'คอลัมน์ 1': 'https://mfudrive.mfu.ac.th/s/test' }).imageUrl).toBe('https://mfudrive.mfu.ac.th/s/test/download')
    expect(parse(source).imageUrl).toBe('https://drive.google.com/thumbnail?id=test-id&sz=w1600')
    expect(parse({ ...source, 'คอลัมน์ 1': 0 }).imageUrl).toBe('https://drive.google.com/thumbnail?id=test-id&sz=w1600')
    expect(imageLink('https://drive.google.com/file/d/test-id/view')).toBe('https://drive.google.com/thumbnail?id=test-id&sz=w1600')
    expect(imageLink('javascript:alert(1)')).toBe('')
    expect(imageLink('file:///C:/secret')).toBe('')
  })

  test('distinguishes repeated titles by the original response sequence and timestamp', () => {
    const first = parse(source)
    const second = parse({ ...source, 'ลำดับ': 15, 'ผลงานชิ้นที่': 2 })
    expect(first.importKey).not.toBe(second.importKey)
    expect(parse(source).importKey).toBe(first.importKey)
    expect(artworkPayload(first, first.imageUrl, 'pending').importKey).toBe(first.importKey)
  })

  test('matches images by filename/title and never by selection order', () => {
    const row = parse(source)
    expect(matchArtworkImages([row], [{ name: 'wrong.png' }])[0].image).toBeNull()
    expect(matchArtworkImages([row], [{ name: 'งามลวง.png' }])[0].image.name).toBe('งามลวง.png')
    expect(matchArtworkImages([row], [{ name: 'งามลวง.png' }, { name: 'งามลวง.jpg' }])[0]).toMatchObject({ image: null, ambiguousImage: true })
    expect(matchArtworkImages([{ ...row, imageFilename: 'specific.png' }], [{ name: 'งามลวง.png' }])[0].image).toBeNull()
  })

  test('requires a qualified filename when several form records share the same title', () => {
    const rows = [parse(source), parse({ ...source, 'ลำดับ': 15 })]
    expect(matchArtworkImages(rows, [{ name: 'งามลวง.png' }]).every(r => r.ambiguousImage && !r.image)).toBe(true)
    const matched = matchArtworkImages(rows, [{ name: 'งามลวง_1.png' }, { name: 'งามลวง_15.png' }])
    expect(matched.map(r => r.image.name)).toEqual(['งามลวง_1.png', 'งามลวง_15.png'])
  })
})
