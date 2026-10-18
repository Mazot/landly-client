import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { LOCALES } from '@/types/api'
import { UI_NS, uiResources } from '@/components/ui/i18n'

import enTranslation from './locales/en/translation.json'
import ruTranslation from './locales/ru/translation.json'
import ukTranslation from './locales/uk/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation, [UI_NS]: uiResources.en },
      ru: { translation: ruTranslation, [UI_NS]: uiResources.ru },
      uk: { translation: ukTranslation, [UI_NS]: uiResources.uk },
    },
    fallbackLng: 'en',
    supportedLngs: [...LOCALES],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
