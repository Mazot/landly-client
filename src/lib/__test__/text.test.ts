import { describe, expect, it } from 'vitest'
import { charCount, firstName } from '../text'

describe('charCount', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(charCount('ab')).toBe(2)
    expect(charCount('😀')).toBe(1)
  })
})

describe('firstName', () => {
  it('takes the first word of a name', () => {
    expect(firstName('Daria Kuznetsova')).toBe('Daria')
    expect(firstName('  Nino   Gelashvili ')).toBe('Nino')
    expect(firstName('Madonna')).toBe('Madonna')
    expect(firstName('')).toBe('')
  })
})
