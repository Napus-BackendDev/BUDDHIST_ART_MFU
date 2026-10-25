import { normalizeCourse, canonicalCourse } from './courses'

export const learnerImportHeaders = [
  'ลำดับ', 'ชื่อผู้เรียน', 'Name - Surname', 'ประเภทผู้เรียน', 'รหัสประจำตัวผู้เรียน',
  'หมายเลขโทรศัพท์', 'e-Mail ติดต่อผู้เรียน', 'อีเมล', 'ภาพถ่าย'
]

// Explicit allowlist: never copy national ID / Passport or unknown columns.
export function learnerImportRow(row) {
  const value = (...keys) => {
    for (const key of keys) {
      const found = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase())
      // The Users export writes '-' / 'N/A' for blanks: treat them as empty so an export can be imported back.
      if (found && row[found] != null && !['', '-', 'n/a'].includes(String(row[found]).trim().toLowerCase())) return String(row[found]).trim()
    }
    return ''
  }
  const type = value('ประเภทผู้เรียน')
  const studentId = value('รหัสประจำตัวผู้เรียน', 'StudentID', 'Student ID')
  let status = value('Status')
  if (type && studentId) {
    if (/เดิม|เก่า/.test(type)) status = 'OldStudent'
    else if (/ใหม่/.test(type)) status = 'NewStudent'
    else throw Error(`ประเภทผู้เรียนไม่รองรับ: ${type}`)
  }
  let telephone = value('หมายเลขโทรศัพท์', 'Telephone')
  if (/^[689]\d{8}$/.test(telephone)) telephone = '0' + telephone
  const photo = value('ภาพถ่าย', 'Image', 'Profile Image')
  return {
    StudentID: /^\d+(\.\d+)?e\+?\d+$/i.test(studentId) && Number.isSafeInteger(Number(studentId)) ? String(Number(studentId)) : studentId,
    UsernameThai: value('ชื่อผู้เรียน', 'UsernameThai', 'Full Name (Thai)'),
    UsernameEng: value('Name - Surname', 'UsernameEng', 'Full Name (English)'),
    'Official Email': value('อีเมล', 'Official Email'),
    'Personal Email': value('e-Mail ติดต่อผู้เรียน', 'Personal Email'),
    Telephone: telephone,
    Role: value('Role'),
    Status: status,
    'Temporary Password': value('Temporary Password'),
    Image: /^https?:\/\//i.test(photo) ? photo : '',
    Course: canonicalCourse(value('หลักสูตร', 'Course'))
  }
}

export function resolveLearnerImportStatus(value, statuses) {
  const normalize = v => String(v || '').toLowerCase().replace(/[\s_()\-]/g, '')
  const key = normalize(value)
  const code = ['oldstudent', 'ผู้เรียนเดิม', 'ผู้เรียนเก่า'].includes(key) ? 'OLD_STUDENT'
    : ['newstudent', 'ผู้เรียนใหม่'].includes(key) ? 'NEW_STUDENT' : value
  const canonical = statuses.find(s => s.code === code)
  if (canonical) return canonical
  return statuses.find(s => [s.nameEn, s.name, ...(Array.isArray(s.title) ? s.title.map(t => t.value) : [])]
    .some(v => v && normalize(v) === key))
}

// A workbook may carry the course on another sheet (name + หลักสูตร columns); match learners by name.
const nameKey = value => normalizeCourse(value).replace(/\s+/g, '').toLowerCase()
export function courseByNameFromSheets(sheetRows) {
  const lookup = new Map()
  for (const rows of sheetRows) {
    for (const row of rows) {
      const keys = Object.keys(row)
      const courseKey = keys.find(k => k.trim() === 'หลักสูตร')
      const nameKeyName = keys.find(k => k.trim() === 'ชื่อ')
      if (!courseKey || !nameKeyName) continue
      const course = canonicalCourse(row[courseKey])
      const key = nameKey(row[nameKeyName])
      // The same name listed under two courses is ambiguous: leave it for an admin to set by hand.
      if (course && key) lookup.set(key, lookup.has(key) && lookup.get(key) !== course ? '' : course)
    }
  }
  return lookup
}
export const courseForLearner = (lookup, thaiName) => lookup.get(nameKey(thaiName)) || ''
