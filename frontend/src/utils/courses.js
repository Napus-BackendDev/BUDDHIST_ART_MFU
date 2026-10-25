// Short-course tracks a learner can belong to (shown next to the learner status).
export const COURSES = [
  { value: 'พุทธศิลป์พื้นฐาน', en: 'Basic Buddhist Art', th: 'พุทธศิลป์พื้นฐาน' },
  { value: 'พุทธศิลป์สร้างสรรค์', en: 'Creative Buddhist Art', th: 'พุทธศิลป์สร้างสรรค์' }
]

// Spreadsheet text often has zero-width characters or doubled vowel marks (e.g. "พุุทธ").
export const normalizeCourse = value => String(value == null ? '' : value)
  .replace(/[​-‍⁠﻿]/g, '')
  .replace(/([ัิ-ฺ็-๎])\1+/g, '$1')
  .replace(/\s+/g, ' ')
  .trim()

export const courseLabel = (value, locale) => {
  const course = COURSES.find(item => item.value === normalizeCourse(value))
  if (!course) return normalizeCourse(value)
  return locale === 'en' ? course.en : course.th
}

// Accept either language label (an Excel export writes the localized label) and return the stored value.
export const canonicalCourse = value => {
  const text = normalizeCourse(value)
  const course = COURSES.find(item => item.value === text || item.th === text || item.en.toLowerCase() === text.toLowerCase())
  return course ? course.value : text
}
