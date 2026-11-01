import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/types/api'
import { LOCALE_NAMES, LOCALE_OPTIONS } from '../locales'

describe('locales', () => {
  it('names every server locale in its own language', () => {
    expect(Object.keys(LOCALE_NAMES).sort()).toEqual([...LOCALES].sort())
    expect(LOCALE_OPTIONS).toEqual([
      { value: 'en', label: 'English' },
      { value: 'ru', label: 'Русский' },
      { value: 'uk', label: 'Українська' },
    ])
  })
})
