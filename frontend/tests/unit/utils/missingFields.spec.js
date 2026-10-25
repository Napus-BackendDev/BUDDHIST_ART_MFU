import { missingLabels, missingText, dimensionsOk, priceOk } from '@/utils/missingFields'

describe('missing field hints', () => {
  test('lists only failing rules in order, per locale', () => {
    const rules = [['titleTh', false], ['artist', true], ['price', false]]
    expect(missingLabels(rules, 'en')).toEqual(['Thai title', 'Price (0 or more)'])
    expect(missingLabels(rules, 'th')).toEqual(['ชื่อผลงานภาษาไทย', 'ราคา (0 ขึ้นไป)'])
  })
  test('says nothing when complete', () => {
    expect(missingText([], 'en')).toBe('')
    expect(missingText(['Image'], 'en')).toBe('Still needed: Image')
    expect(missingText(['รูป'], 'th')).toBe('ยังขาด: รูป')
  })
  test('dimension and price rules', () => {
    expect(dimensionsOk({ width: '30', height: '40' }, false)).toBe(true)
    expect(dimensionsOk({ width: '30', height: '40', depth: '' }, true)).toBe(false)
    expect(dimensionsOk({ width: '0', height: '40' }, false)).toBe(false)
    expect(priceOk('0')).toBe(true)
    expect(priceOk('')).toBe(false)
    expect(priceOk('-1')).toBe(false)
  })
})
