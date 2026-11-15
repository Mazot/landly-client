import { useTranslation } from 'react-i18next'
import { ChipGroup, Select } from '@/components/ui'
import { useCountryLanguages, useLanguages } from '@/hooks/useCommon'
import type { Uuid } from '@/types/api'

export interface SpokenLanguagesFieldProps {
  label: string
  /** Language ids (people store ids, not names). */
  value: Uuid[]
  onChange: (languageIds: Uuid[]) => void
  /** The corridor's countries: their official languages are offered as chips. */
  countryIds: Uuid[]
  /** Upper bound of the picked languages; the picker hides when it is reached. */
  max?: number
}

/** Languages by id: chips for the corridor's languages (from the backend) and the picked ones, a picker for the rest. */
export function SpokenLanguagesField({ label, value, onChange, countryIds, max }: SpokenLanguagesFieldProps) {
  const { t } = useTranslation()
  const corridor = useCountryLanguages(countryIds).data ?? []
  const all = useLanguages().data ?? []

  const byId = new Map([...all, ...corridor].map((language) => [language.id, language]))
  const offeredIds = [...corridor.map((language) => language.id), ...value.filter((id) => !corridor.some((language) => language.id === id))]
  const others = all.filter((language) => !offeredIds.includes(language.id))
  const full = max !== undefined && value.length >= max

  return (
    <div className="flex flex-col gap-2">
      {offeredIds.length > 0 && (
        <ChipGroup multiple label={label} options={offeredIds.map((id) => ({ value: id, label: byId.get(id)?.name ?? id }))} value={value} onChange={onChange} />
      )}
      {others.length > 0 && !full && (
        <Select
          aria-label={t('people.languages.other')}
          placeholder={t('people.languages.other')}
          options={others.map((language) => ({ value: language.id, label: language.name }))}
          value=""
          onChange={(event) => event.target.value && onChange([...value, event.target.value])}
        />
      )}
    </div>
  )
}
