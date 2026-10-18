import { describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { UI_NS, uiResources } from './index'

const keys = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
const base = (key: string) => key.replace(/_(one|few|many|other)$/, '')

describe('ui namespace', () => {
  it('has the same keys in every locale (plural forms aside)', () => {
    const en = [...new Set(keys(uiResources.en).map(base))].sort()
    expect([...new Set(keys(uiResources.ru).map(base))].sort()).toEqual(en)
    expect([...new Set(keys(uiResources.uk).map(base))].sort()).toEqual(en)
  })

  it('is registered in the app i18n instance', async () => {
    await i18n.changeLanguage('ru')
    expect(i18n.t('stars', { ns: UI_NS, count: 5 })).toBe('5 звёзд')
    await i18n.changeLanguage('en')
    expect(i18n.t('status.pending', { ns: UI_NS })).toBe('Pending review')
  })
})
