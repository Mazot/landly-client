import { useTranslation } from 'react-i18next'
import { CorridorFields, Field, Select } from '@/components/ui'
import type { useGuestCorridor } from '@/hooks/useGuestCorridor'

export interface CorridorPickerProps {
  corridor: ReturnType<typeof useGuestCorridor>
  fromLabel: string
  toLabel: string
  /** Stack the two selects on phones (landing card). */
  stackOnPhone?: boolean
}

/** "From → To" country selects over the guest corridor (`useGuestCorridor`). */
export function CorridorPicker({ corridor, fromLabel, toLabel, stackOnPhone }: CorridorPickerProps) {
  const { t } = useTranslation()
  const options = corridor.countries.map((c) => ({ value: c.id, label: [c.flag, c.name].filter(Boolean).join('  ') }))
  const placeholder = corridor.isPending ? t('corridor.loading') : t('corridor.choose')
  return (
    <CorridorFields
      stackOnPhone={stackOnPhone}
      from={
        <Field label={fromLabel}>
          <Select options={options} placeholder={placeholder} disabled={!options.length} value={corridor.from?.id ?? ''} onChange={(event) => corridor.setFrom(event.target.value)} />
        </Field>
      }
      to={
        <Field label={toLabel}>
          <Select options={options} placeholder={placeholder} disabled={!options.length} value={corridor.to?.id ?? ''} onChange={(event) => corridor.setTo(event.target.value)} />
        </Field>
      }
    />
  )
}
