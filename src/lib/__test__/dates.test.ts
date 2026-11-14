import { describe, expect, it } from 'vitest'
import { formatAgo, formatDay, parseServerDateTime } from '../dates'

describe('parseServerDateTime', () => {
  it('reads a zone-less server timestamp as UTC', () => {
    expect(parseServerDateTime('2026-10-18T09:12:44.123456').toISOString()).toBe('2026-10-18T09:12:44.123Z')
  })

  it('keeps an explicit Z', () => {
    expect(parseServerDateTime('2026-10-18T09:12:44Z').toISOString()).toBe('2026-10-18T09:12:44.000Z')
  })

  it('honours an explicit offset', () => {
    expect(parseServerDateTime('2026-10-18T11:12:44+02:00').toISOString()).toBe('2026-10-18T09:12:44.000Z')
  })
})

describe('formatDay', () => {
  const now = new Date('2026-11-13T12:00:00Z')

  it('is the day and short month, in the reader’s language', () => {
    expect(formatDay('2026-03-02T09:30:00', 'en', now)).toBe('Mar 2')
    expect(formatDay('2026-03-02T09:30:00', 'ru', now)).toBe('2 мар.')
  })

  it('adds the year when it is not the current one', () => {
    expect(formatDay('2025-12-31T23:59:00', 'en', now)).toBe('Dec 31, 2025')
  })

  it('reads the timestamp as UTC, whatever the reader’s time zone', () => {
    expect(formatDay('2026-03-02T00:10:00', 'en', now)).toBe('Mar 2')
    expect(formatDay('2026-03-02T23:50:00', 'en', now)).toBe('Mar 2')
  })

  it('defaults to today for the year', () => {
    expect(formatDay(new Date().toISOString(), 'en')).not.toMatch(/\d{4}/)
  })
})

describe('formatAgo', () => {
  const now = new Date('2026-11-13T12:00:00Z')
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString().replace('Z', '')
  const MIN = 60_000

  it.each([
    [30_000, 'now'],
    [5 * MIN, '5 minutes ago'],
    [59 * MIN, '59 minutes ago'],
    [60 * MIN, '1 hour ago'],
    [2 * 60 * MIN + 59 * MIN, '2 hours ago'],
    [24 * 60 * MIN, 'yesterday'],
    [3 * 24 * 60 * MIN, '3 days ago'],
    [29 * 24 * 60 * MIN, '29 days ago'],
  ])('%i ms → %s', (ms, expected) => {
    expect(formatAgo(ago(ms), 'en', now)).toBe(expected)
  })

  it('names the day once a month has passed', () => {
    expect(formatAgo(ago(30 * 24 * 60 * MIN), 'en', now)).toBe('Oct 14')
  })

  it('speaks the reader’s language', () => {
    expect(formatAgo(ago(2 * 60 * MIN), 'ru', now)).toBe('2 часа назад')
    expect(formatAgo(ago(3 * 24 * 60 * MIN), 'uk', now)).toBe('3 дні тому')
  })

  it('treats a timestamp from the future (clock skew) as now', () => {
    expect(formatAgo(ago(-5 * MIN), 'en', now)).toBe('now')
  })

  it('defaults to the current time', () => {
    expect(formatAgo(new Date().toISOString(), 'en')).toBe('now')
  })
})
