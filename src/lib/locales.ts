import { LOCALES, type Locale } from '@/types/api'

/** Native names, so a reader can find their language whatever the UI language is. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', ru: 'Русский', uk: 'Українська' }

/** `<Select>` options for the interface language. */
export const LOCALE_OPTIONS = LOCALES.map((value) => ({ value, label: LOCALE_NAMES[value] }))
