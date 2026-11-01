import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { LOCALE_OPTIONS } from '@/lib/locales'

/** Switches the interface language (persisted by the i18next detector). */
export function LanguageSelect({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  return (
    <Select
      size="sm"
      icon="languages"
      aria-label={t('language')}
      options={LOCALE_OPTIONS}
      value={useUiLocale()}
      onChange={(event) => void i18n.changeLanguage(event.target.value)}
      className={className}
    />
  )
}
