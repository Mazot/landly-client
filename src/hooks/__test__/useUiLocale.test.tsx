import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { useUiLocale } from '../useUiLocale'

describe('useUiLocale', () => {
  afterEach(() => i18n.changeLanguage('en'))

  it('follows the language the UI is shown in', async () => {
    const { result } = renderHook(() => useUiLocale())
    expect(result.current).toBe('en')
    await act(() => i18n.changeLanguage('uk'))
    expect(result.current).toBe('uk')
  })

  it('falls back to en for a language the server does not know', async () => {
    await i18n.changeLanguage('de')
    const { result } = renderHook(() => useUiLocale())
    expect(result.current).toBe('en')
  })

  it('falls back to en while i18next has not resolved a language yet', () => {
    const resolved = i18n.resolvedLanguage
    i18n.resolvedLanguage = undefined
    try {
      expect(renderHook(() => useUiLocale()).result.current).toBe('en')
    } finally {
      i18n.resolvedLanguage = resolved
    }
  })
})
