import { useTranslation } from 'react-i18next'
import { KeyValueList, Meta } from '@/components/ui'
import { useUiLocale } from '@/hooks/useUiLocale'
import { formatInterval, weekdayLabel } from '@/lib/openingHours'
import { WEEKDAYS, type Organisation } from '@/types/api'

export interface PlaceHoursProps {
  place: Pick<Organisation, 'openingHours' | 'timezone'>
}

/** The week's hours, Monday first, in the place's own time zone; nothing without hours. */
export function PlaceHours({ place }: PlaceHoursProps) {
  const { t } = useTranslation()
  const locale = useUiLocale()
  const hours = place.openingHours
  if (!hours) return null

  return (
    <div className="flex max-w-95 flex-col gap-2">
      <KeyValueList
        card={false}
        items={WEEKDAYS.map((weekday) => {
          const day = hours[weekday] ?? []
          return { label: weekdayLabel(weekday, locale), value: day.length > 0 ? day.map(formatInterval).join(', ') : t('place.closed') }
        })}
      />
      {place.timezone && <Meta icon="clock">{t('place.localTime', { zone: place.timezone })}</Meta>}
    </div>
  )
}
