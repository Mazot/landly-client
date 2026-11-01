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

  it('has the same message keys in every locale for the landing and auth screens', () => {
    // Plural forms differ per language (`_one` / `_few` / `_many` / `_other`), the key itself must not.
    const keys = (lng: string, section: string) => {
      const out = new Set<string>()
      const walk = (node: unknown, path: string) => {
        if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walk(v, `${path}.${k}`))
        else out.add(path.replace(/_(zero|one|two|few|many|other)$/, ''))
      }
      walk(i18n.getResourceBundle(lng, 'translation')[section], section)
      return [...out].sort()
    }
    for (const section of ['auth', 'landing', 'corridor']) {
      expect(keys('ru', section)).toEqual(keys('en', section))
      expect(keys('uk', section)).toEqual(keys('en', section))
    }
  })

  it('pluralises the place count per language', async () => {
    const open = (count: number) => i18n.t('landing.openMap', { count })
    expect([1, 2, 5, 21].map(open)).toEqual(['Open the map · 1 place', 'Open the map · 2 places', 'Open the map · 5 places', 'Open the map · 21 places'])
    await i18n.changeLanguage('ru')
    expect([1, 2, 5, 21].map(open)).toEqual(['Открыть карту · 1 место', 'Открыть карту · 2 места', 'Открыть карту · 5 мест', 'Открыть карту · 21 место'])
    await i18n.changeLanguage('uk')
    expect([1, 2, 5, 21].map(open)).toEqual(['Відкрити мапу · 1 місце', 'Відкрити мапу · 2 місця', 'Відкрити мапу · 5 місць', 'Відкрити мапу · 21 місце'])
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
