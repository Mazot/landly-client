import { compact } from 'es-toolkit'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Callout, Meta } from '@/components/ui'
import { useDuplicates } from '@/hooks/useOrganisations'

export interface DuplicateHintProps {
  /** The name as typed (asked once the user has left the field). */
  name: string
  point: google.maps.LatLngLiteral | null
}

/**
 * "A place with a similar name is 0.4 km away": live places near the pin whose name is like the
 * one typed (`GET /organisation/duplicates`). "It's different" hides it for this name; moderators
 * see the same check as a flag either way.
 */
export function DuplicateHint({ name, point }: DuplicateHintProps) {
  const { t } = useTranslation()
  const typed = name.trim()
  const [dismissed, setDismissed] = useState<string>()
  const duplicates = useDuplicates(typed && point ? { name: typed, lat: point.lat, lng: point.lng } : undefined)
  const found = duplicates.data ?? []
  if (!typed || !point || dismissed === typed || found.length === 0 || duplicates.isPlaceholderData) return null

  const nearest = found[0]
  return (
    <Callout
      tone="warning"
      title={t('addPlace.duplicate.title', { distance: (nearest.distanceKm ?? 0).toFixed(1) })}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setDismissed(typed)}>
          {t('addPlace.duplicate.different')}
        </Button>
      }
    >
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {found.map((place) => (
          <li key={place.id}>
            <Meta strong>{compact([place.name, place.address]).join(' · ')}</Meta>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-1">{t('addPlace.duplicate.hint')}</p>
    </Callout>
  )
}
