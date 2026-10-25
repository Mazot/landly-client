import { describe, expect, it } from 'vitest'
import { parseServerDateTime } from '../dates'

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
