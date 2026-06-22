import { formatDate, formatDateTime, getStatusColor } from '@/lib/utils'

describe('formatDate', () => {
  test('formats date correctly', () => {
    // Note: timezone can affect toLocaleDateString, but for '2026-06-15T10:00:00Z', 
    // it usually gives 'Jun 15, 2026' or similar depending on the local timezone.
    // Using a simpler date to avoid UTC shifts
    const formatted = formatDate('2026-06-15T12:00:00.000Z')
    expect(formatted).toMatch(/Jun 15, 2026/)
  })
})

describe('formatDateTime', () => {
  test('formats date and time correctly', () => {
    const formatted = formatDateTime('2026-06-15T10:30:00.000Z')
    expect(formatted).toMatch(/Jun 15, 2026/)
    expect(formatted).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/)
  })
})

describe('getStatusColor', () => {
  test('pending returns amber colors', () => {
    const result = getStatusColor('pending')
    expect(result.text).toBe('#f59e0b')
  })

  test('approved returns green colors', () => {
    const result = getStatusColor('approved')
    expect(result.text).toBe('#10b981')
  })

  test('rejected returns rose colors', () => {
    const result = getStatusColor('rejected')
    expect(result.text).toBe('#f43f5e')
  })

  test('cancelled returns gray colors', () => {
    const result = getStatusColor('cancelled')
    expect(result.text).toBe('#8b92b6')
  })

  test('unknown status returns default gray', () => {
    const result = getStatusColor('anything')
    expect(result.text).toBe('#8b92b6')
  })
})


