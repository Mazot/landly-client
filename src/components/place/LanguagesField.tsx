import { useTranslation } from 'react-i18next'
import { ChipGroup, Select } from '@/components/ui'
import { useCountryLanguages, useLanguages } from '@/hooks/useCommon'
import { TAGS_PER_LIST_MAX, type Uuid } from '@/types/api'

export interface LanguagesFieldProps {
  label: string
  /** Language names (organisations store names, not ids). */
  value: string[]
  onChange: (languages: string[]) => void
  /** The corridor's countries: their official languages are offered first. */
  countryIds: Uuid[]
}

/**
 * Languages spoken at the place: chips for the corridor's languages (from the backend) and the
 * ones already picked, and a picker with every other language of the reference list.
 */
export function LanguagesField({ label, value, onChange, countryIds }: LanguagesFieldProps) {
  const { t } = useTranslation()
  const corridor = useCountryLanguages(countryIds).data ?? []
  const all = useLanguages().data ?? []

  const offered = [...corridor.map((language) => language.name), ...value.filter((name) => !corridor.some((language) => language.name === name))]
  const others = all.filter((language) => !offered.includes(language.name))
  const full = value.length >= TAGS_PER_LIST_MAX

  return (
    <div className="flex flex-col gap-2">
      {offered.length > 0 && <ChipGroup multiple label={label} options={offered.map((name) => ({ value: name, label: name }))} value={value} onChange={onChange} />}
      {others.length > 0 && !full && (
        <Select
          aria-label={t('addPlace.languages.other')}
          placeholder={t('addPlace.languages.other')}
          options={others.map((language) => ({ value: language.name, label: language.name }))}
          value=""
          onChange={(event) => event.target.value && onChange([...value, event.target.value])}
        />
      )}
    </div>
  )
}
