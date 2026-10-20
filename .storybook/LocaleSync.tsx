import { useEffect, type ReactNode } from 'react'
import i18n from '../src/i18n'
import type { Locale } from '../src/types/api'

/** Follows the toolbar language; ru/uk copy is longer — layouts must survive it. */
export function LocaleSync({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale)
  }, [locale])
  return children
}
