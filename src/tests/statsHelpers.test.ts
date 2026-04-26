import { describe, it, expect } from 'vitest'
import { formatDuration, startOf, endOf } from '@/lib/statsHelpers'

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(3661)).toBe('1h 1m')
  })

  it('returns 0h 0m for zero seconds', () => {
    expect(formatDuration(0)).toBe('0h 0m')
  })

  it('formats whole hours', () => {
    expect(formatDuration(7200)).toBe('2h 0m')
  })

  it('formats minutes only', () => {
    expect(formatDuration(300)).toBe('0h 5m')
  })
})

describe('startOf', () => {
  it('returns first day of month at midnight', () => {
    const date = new Date('2026-04-15T14:30:00')
    const result = startOf('month', date)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(3)
    expect(result.getDate()).toBe(1)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
  })

  it('returns start of year', () => {
    const date = new Date('2026-07-20')
    const result = startOf('year', date)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(1)
  })

  it('returns start of day at midnight', () => {
    const date = new Date('2026-04-15T18:00:00')
    const result = startOf('day', date)
    expect(result.getHours()).toBe(0)
    expect(result.getDate()).toBe(15)
  })

  it('returns Monday for week', () => {
    const wednesday = new Date('2026-04-22') // Wednesday
    const result = startOf('week', wednesday)
    expect(result.getDay()).toBe(1) // Monday
  })
})

describe('endOf', () => {
  it('returns last day of month', () => {
    const date = new Date('2026-04-10')
    const result = endOf('month', date)
    expect(result.getMonth()).toBe(3)
    expect(result.getDate()).toBe(30)
  })

  it('returns Dec 31 for end of year', () => {
    const date = new Date('2026-03-01')
    const result = endOf('year', date)
    expect(result.getMonth()).toBe(11)
    expect(result.getDate()).toBe(31)
  })
})
