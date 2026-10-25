import { afterAll, describe, expect, it } from 'vitest'
import { LOCALES } from '@/types/api'
import i18n from '../index'

describe('i18n', () => {
  afterAll(() => i18n.changeLanguage('en'))

  it('supports exactly the server locales, falling back to English', () => {
    expect(i18n.options.supportedLngs).toEqual(expect.arrayContaining([...LOCALES]))
    expect(i18n.options.fallbackLng).toEqual(['en'])
  })

  it('has the same top-level sections in every locale', () => {
    const sections = (lng: string) => Object.keys(i18n.getResourceBundle(lng, 'translation')).sort()
    expect(sections('ru')).toEqual(sections('en'))
    expect(sections('uk')).toEqual(sections('en'))
  })

  it('translates and remembers the chosen language', async () => {
    await i18n.changeLanguage('ru')
    expect(i18n.t('header.profile')).toBe('Профиль')
    expect(localStorage.getItem('i18nextLng')).toBe('ru')
  })

  it('falls back to English for an unsupported language', async () => {
    await i18n.changeLanguage('de')
    expect(i18n.t('header.profile')).toBe('Profile')
  })

  it('keeps <html lang> on the language actually shown (screen readers, hyphenation)', async () => {
    await i18n.changeLanguage('uk')
    expect(document.documentElement.lang).toBe('uk')
    await i18n.changeLanguage('de')
    expect(document.documentElement.lang).toBe('en')
  })

  it('falls back to "en" for <html lang> while no language is resolved yet', () => {
    const resolved = i18n.resolvedLanguage
    i18n.resolvedLanguage = undefined
    try {
      document.documentElement.lang = 'ru'
      i18n.emit('languageChanged', 'xx')
      expect(document.documentElement.lang).toBe('en')
    } finally {
      i18n.resolvedLanguage = resolved
    }
  })
})
