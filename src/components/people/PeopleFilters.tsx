import { useTranslation } from 'react-i18next'
import { ChipGroup, Field, TextField } from '@/components/ui'
import { usePersonSkills } from '@/hooks/usePeople'
import type { PeopleFilters as Filters } from '@/lib/peopleFilters'
import type { Uuid } from '@/types/api'
import { SpokenLanguagesField } from './SpokenLanguagesField'

export interface PeopleFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  /** The corridor's countries: their languages are the "Speaks" choices. */
  countryIds: Uuid[]
}

/** City, skills (the backend's reference list) and spoken languages — the sidebar on desktop, the body of the filters sheet elsewhere. */
export function PeopleFilters({ filters, onChange, countryIds }: PeopleFiltersProps) {
  const { t } = useTranslation()
  const skills = usePersonSkills().data ?? []

  return (
    <div className="flex flex-col gap-5">
      <Field label={t('people.filters.city')}>
        <TextField icon="pin" value={filters.city} onChange={(event) => onChange({ ...filters, city: event.target.value })} autoComplete="off" />
      </Field>
      {skills.length > 0 && (
        <Field label={t('people.filters.skills')}>
          <ChipGroup multiple size="sm" label={t('people.filters.skills')} options={skills.map((skill) => ({ value: skill.name, label: skill.name }))} value={filters.skills} onChange={(selected) => onChange({ ...filters, skills: selected })} />
        </Field>
      )}
      <Field label={t('people.filters.speaks')}>
        <SpokenLanguagesField label={t('people.filters.speaks')} value={filters.languageIds} onChange={(languageIds) => onChange({ ...filters, languageIds })} countryIds={countryIds} />
      </Field>
    </div>
  )
}
