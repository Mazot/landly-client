import { useTranslation } from 'react-i18next'
import { List, TextField, ToggleRow } from '@/components/ui'
import { hoursToCopy, isValidInterval, weekdayLabels, type DayHours } from '@/lib/placeDraft'
import { WEEKDAYS, type Weekday } from '@/types/api'

export interface HoursEditorProps {
  value: Record<Weekday, DayHours>
  onChange: (hours: Record<Weekday, DayHours>) => void
}

/**
 * The week, one row a day: open / closed, and the opening and closing times of an open day.
 * Switching a day on copies the hours of the nearest open day before it. Day names come from Intl
 * in the UI language.
 */
export function HoursEditor({ value, onChange }: HoursEditorProps) {
  const { t, i18n } = useTranslation()
  const labels = weekdayLabels(i18n.language)
  const set = (day: Weekday, hours: DayHours) => onChange({ ...value, [day]: hours })

  return (
    <List variant="divided" label={t('addPlace.hours.label')}>
      {WEEKDAYS.map((day) => {
        const interval = value[day]
        const invalid = !!interval && !!interval[0] && !!interval[1] && !isValidInterval(interval)
        return (
          <ToggleRow
            key={day}
            title={labels[day]}
            switchLabel={t('addPlace.hours.openOn', { day: labels[day] })}
            checked={!!interval}
            onChange={(open) => set(day, open ? hoursToCopy(value, day) : null)}
            description={interval ? undefined : t('addPlace.hours.closed')}
            extra={
              interval && (
                <>
                  <TextField className="min-w-0 flex-1 sm:w-30 sm:flex-none" type="time" size="sm" aria-label={t('addPlace.hours.opens', { day: labels[day] })} value={interval[0]} invalid={invalid} onChange={(event) => set(day, [event.target.value, interval[1]])} />
                  <span aria-hidden="true">–</span>
                  <TextField className="min-w-0 flex-1 sm:w-30 sm:flex-none" type="time" size="sm" aria-label={t('addPlace.hours.closes', { day: labels[day] })} value={interval[1]} invalid={invalid} onChange={(event) => set(day, [interval[0], event.target.value])} />
                </>
              )
            }
          />
        )
      })}
    </List>
  )
}
