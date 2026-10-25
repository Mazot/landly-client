import { useTranslation } from 'react-i18next'
import { LOCALES, type Locale } from '@/types/api'

/** The language the UI is shown in, narrowed to a server `Locale` (what signup / profile send). */
export function useUiLocale(): Locale {
  const { i18n } = useTranslation()
  return LOCALES.find((locale) => locale === i18n.resolvedLanguage) ?? 'en'
}
