import { learnerImportHeaders, learnerImportRow, resolveLearnerImportStatus } from '@/utils/learnerImport'

describe('Thai learner import', () => {
  const source = {
    'ลำดับ': 1, 'ชื่อผู้เรียน': 'ผู้เรียนทดสอบ', 'Name - Surname': 'Test Learner',
    'ประเภทผู้เรียน': 'ผู้เรียน (เดิม)', 'รหัสประจำตัวผู้เรียน': '0012345678',
    'รหัสบัตรประจำตัวประชาชน/Passport': 'EXCLUDED-SENSITIVE-VALUE',
    'หมายเลขโทรศัพท์': 812345678, 'e-Mail ติดต่อผู้เรียน': 'test@example.com',
    'อีเมล': '0012345678@lamduan.mfu.ac.th', 'ภาพถ่าย': 'https://mfudrive.mfu.ac.th/s/example/download'
  }
  test('keeps the source column order except national ID / Passport', () => {
    expect(learnerImportHeaders).toEqual(Object.keys(source).filter(k => !k.includes('Passport')))
  })
  test('maps Thai headers, preserves student ID and contact details, and excludes sensitive columns', () => {
    const row = learnerImportRow(source)
    expect(row).toMatchObject({ StudentID: '0012345678', UsernameThai: 'ผู้เรียนทดสอบ', UsernameEng: 'Test Learner', Status: 'OldStudent', Telephone: '0812345678', Image: source['ภาพถ่าย'] })
    expect(JSON.stringify(row)).not.toContain('EXCLUDED-SENSITIVE-VALUE')
    expect(Object.keys(row)).not.toContain('รหัสบัตรประจำตัวประชาชน/Passport')
  })
  test('supports new learners and existing English templates', () => {
    expect(learnerImportRow({ ...source, 'ประเภทผู้เรียน': 'ผู้เรียน (ใหม่)' }).Status).toBe('NewStudent')
    expect(learnerImportRow({ StudentID: '123', UsernameThai: 'คน', Status: 'Active', Role: 'Artist' })).toMatchObject({ StudentID: '123', UsernameThai: 'คน', Status: 'Active', Role: 'Artist' })
  })
  test('never substitutes national ID for a missing student ID or accepts script image URLs', () => {
    const row = learnerImportRow({ ...source, 'รหัสประจำตัวผู้เรียน': '', 'ภาพถ่าย': 'javascript:alert(1)' })
    expect(row.StudentID).toBe('')
    expect(row.Image).toBe('')
  })
  test('accepts old learner wording and does not silently default unknown types', () => {
    expect(learnerImportRow({ ...source, 'ประเภทผู้เรียน': 'ผู้เรียน (เก่า)' }).Status).toBe('OldStudent')
    expect(() => learnerImportRow({ ...source, 'ประเภทผู้เรียน': 'ไม่ทราบ' })).toThrow('ประเภทผู้เรียนไม่รองรับ')
    expect(learnerImportRow({ ...source, 'รหัสประจำตัวผู้เรียน': '6.580000036E9' }).StudentID).toBe('6580000036')
  })
  test('prefers canonical status codes over duplicate test statuses and supports code and label aliases', () => {
    const statuses = [
      { _id: 'test-old', code: 'OLD_STUDENT_IMPORT_TEST', title: [{key:'en',value:'OldStudent'}] },
      { _id: 'real-old', code: 'OLD_STUDENT', title: [{key:'en',value:'OldStudent'}] },
      { _id: 'real-new', code: 'NEW_STUDENT', title: [{key:'en',value:'NewStudent'}] }
    ]
    for (const value of ['OldStudent', 'Old Student', 'OLD_STUDENT', 'ผู้เรียนเก่า']) expect(resolveLearnerImportStatus(value, statuses)._id).toBe('real-old')
    expect(resolveLearnerImportStatus('NewStudent', statuses)._id).toBe('real-new')
    expect(resolveLearnerImportStatus('Unknown', statuses)).toBeUndefined()
  })
})

describe('Users export can be imported back', () => {
  test('an English course label from the export maps back to the stored Thai value', () => {
    expect(learnerImportRow({ 'Student ID': '1', Course: 'Creative Buddhist Art' }).Course).toBe('พุทธศิลป์สร้างสรรค์')
    expect(learnerImportRow({ 'Student ID': '1', Course: 'basic buddhist art' }).Course).toBe('พุทธศิลป์พื้นฐาน')
  })
  test('maps the export headers and treats - as blank', () => {
    const row = learnerImportRow({ 'Student ID': '6600000001', 'Full Name (Thai)': 'ก ข', 'Full Name (English)': 'A B', 'Official Email': '-', 'Personal Email': 'a@b.co', Telephone: '-', Role: 'Artist', Status: 'NewStudent', Course: 'พุทธศิลป์พื้นฐาน', 'Profile Image': '-' })
    expect(row).toMatchObject({ StudentID: '6600000001', UsernameThai: 'ก ข', UsernameEng: 'A B', 'Official Email': '', 'Personal Email': 'a@b.co', Telephone: '', Role: 'Artist', Status: 'NewStudent', Course: 'พุทธศิลป์พื้นฐาน', Image: '' })
  })
})

describe('learner course (หลักสูตร)', () => {
  const { normalizeCourse, courseLabel } = require('@/utils/courses')
  const { courseByNameFromSheets, courseForLearner } = require('@/utils/learnerImport')

  test('normalizes doubled vowel marks and zero-width characters', () => {
    expect(normalizeCourse('พุุทธศิลป์สร้างสรรค์')).toBe('พุทธศิลป์สร้างสรรค์')
    expect(normalizeCourse(' พุทธศิลป์พื้นฐาน​ ')).toBe('พุทธศิลป์พื้นฐาน')
  })

  test('labels known courses per locale', () => {
    expect(courseLabel('พุุทธศิลป์สร้างสรรค์', 'en')).toBe('Creative Buddhist Art')
    expect(courseLabel('พุทธศิลป์พื้นฐาน', 'th')).toBe('พุทธศิลป์พื้นฐาน')
  })

  test('matches the course from another sheet by learner name', () => {
    const lookup = courseByNameFromSheets([[
      { ชื่อ: 'นาย ทดสอบ​ ระบบ', หลักสูตร: 'พุุทธศิลป์สร้างสรรค์' },
      { ชื่อ: 'ไม่มีคอร์ส', หลักสูตร: '' }
    ]])
    expect(courseForLearner(lookup, 'นายทดสอบ ระบบ')).toBe('พุทธศิลป์สร้างสรรค์')
    expect(courseForLearner(lookup, 'ไม่มีคอร์ส')).toBe('')
    expect(courseForLearner(lookup, 'คนอื่น')).toBe('')
  })

  test('a name listed under two different courses gets no course', () => {
    const lookup = courseByNameFromSheets([[
      { ชื่อ: 'ซ้ำ ชื่อ', หลักสูตร: 'พุทธศิลป์พื้นฐาน' },
      { ชื่อ: 'ซ้ำ ชื่อ', หลักสูตร: 'พุุทธศิลป์สร้างสรรค์' }
    ]])
    expect(courseForLearner(lookup, 'ซ้ำ ชื่อ')).toBe('')
  })

  test('learner rows carry an optional Course column and never the national ID', () => {
    const row = learnerImportRow({ 'ชื่อผู้เรียน': 'ก', 'รหัสประจำตัวผู้เรียน': '6600000001', 'รหัสบัตรประจำตัวประชาชน/Passport': '1234567890123', 'หลักสูตร': 'พุทธศิลป์พื้นฐาน' })
    expect(row.Course).toBe('พุทธศิลป์พื้นฐาน')
    expect(JSON.stringify(row)).not.toContain('1234567890123')
  })
})
