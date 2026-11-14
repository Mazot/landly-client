import { useTranslation } from 'react-i18next'
import { ChipGroup, type ChipOption } from '@/components/ui'
import type { OrganisationType } from '@/types/api'
import { typeChipOptions } from './typeOptions'

const ALL = 'all'

export interface TypeRailProps {
  orgTypes: OrganisationType[]
  /** Selected type slugs; empty = all types. */
  value: string[]
  onChange: (slugs: string[]) => void
  size?: 'md' | 'sm'
}

/** One scrolling row of chips: "All" and one per organisation type that has a slug (those can be filtered on). */
export function TypeRail({ orgTypes, value, onChange, size = 'md' }: TypeRailProps) {
  const { t } = useTranslation()
  const options: ChipOption[] = [
    { value: ALL, label: t('map.all') },
    ...typeChipOptions(orgTypes),
  ]
  return (
    <ChipGroup
      multiple
      scroll
      size={size}
      label={t('map.typeRail')}
      options={options}
      value={value.length ? value : [ALL]}
      // With "All" active a click picks a type (dropping "All"); with types active, "All" clears them.
      onChange={(next) => onChange(value.length === 0 ? next.filter((slug) => slug !== ALL) : next.includes(ALL) ? [] : next)}
    />
  )
}
