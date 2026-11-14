import { useTranslation } from 'react-i18next'
import { OpenStatus } from '@/components/ui'
import { formatInterval, hoursToday } from '@/lib/openingHours'
import type { Organisation } from '@/types/api'

export interface PlaceOpenStatusProps {
  place: Pick<Organisation, 'openNow' | 'openingHours' | 'timezone'>
  size?: 'sm' | 'md'
}

/** "Open now · 09:00–13:00" / "Closed · Closed today" from the server's `openNow` and today's hours in the place's zone. */
export function PlaceOpenStatus({ place, size }: PlaceOpenStatusProps) {
  const { t } = useTranslation()
  if (place.openNow === null) return null
  const hours = hoursToday(place.openingHours, place.timezone)
  const text = hours === undefined ? undefined : hours ? formatInterval(hours) : t('map.closedToday')
  return <OpenStatus open={place.openNow} hours={text} size={size} />
}
