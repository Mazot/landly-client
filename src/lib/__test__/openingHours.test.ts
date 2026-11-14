import { describe, expect, it } from 'vitest'
import type { OpeningHours } from '@/types/api'
import { formatInterval, hoursToday } from '../openingHours'
import { weekdayLabel } from '../openingHours'

const office: OpeningHours = { mon: [['14:00', '18:00'], ['09:00', '13:00']], tue: [['00:00', '24:00']], sun: [] }
const berlin = 'Europe/Berlin'
/** Berlin is UTC+1 in November: 2026-11-02 is a Monday. */
const monday = (hhmm: string) => new Date(`2026-11-02T${hhmm}:00+01:00`)

describe('hoursToday', () => {
  it('has no answer without hours or a time zone', () => {
    expect(hoursToday(null, berlin)).toBeUndefined()
    expect(hoursToday(office, null)).toBeUndefined()
  })

  it('has no answer for an unknown time zone instead of throwing', () => {
    expect(hoursToday(office, 'Europe/Nowhere', monday('10:30'))).toBeUndefined()
  })

  it('answers with the interval that is open now', () => {
    expect(hoursToday(office, berlin, monday('10:30'))).toEqual(['09:00', '13:00'])
    expect(hoursToday(office, berlin, monday('14:00'))).toEqual(['14:00', '18:00'])
  })

  it('treats the closing time as closed and takes the next interval of the day', () => {
    expect(hoursToday(office, berlin, monday('13:00'))).toEqual(['14:00', '18:00'])
    expect(hoursToday(office, berlin, monday('07:00'))).toEqual(['09:00', '13:00'])
  })

  it('is null once the last interval has ended, and on a day without hours', () => {
    expect(hoursToday(office, berlin, monday('18:00'))).toBeNull()
    expect(hoursToday(office, berlin, new Date('2026-11-04T10:00:00+01:00'))).toBeNull() // Wednesday: no entry
    expect(hoursToday(office, berlin, new Date('2026-11-01T10:00:00+01:00'))).toBeNull() // Sunday: empty list
  })

  it('reads the clock of the place, not of the viewer', () => {
    // 23:30 in Berlin on Monday is already Tuesday morning in Tbilisi (UTC+4): the all-day interval applies.
    const instant = monday('23:30')
    expect(hoursToday(office, berlin, instant)).toBeNull()
    expect(hoursToday(office, 'Asia/Tbilisi', instant)).toEqual(['00:00', '24:00'])
  })

  it('defaults to the current time', () => {
    expect(hoursToday({}, berlin)).toBeNull()
  })
})

describe('formatInterval', () => {
  it('joins the times with an en dash', () => {
    expect(formatInterval(['09:00', '13:00'])).toBe('09:00–13:00')
  })
})

describe('weekdayLabel', () => {
  it('names the weekday in the reader language, Monday first', () => {
    expect(weekdayLabel('mon', 'en')).toBe('Mon')
    expect(weekdayLabel('sun', 'en')).toBe('Sun')
    expect(weekdayLabel('mon', 'ru')).toBe('пн')
  })
})
