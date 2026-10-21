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
