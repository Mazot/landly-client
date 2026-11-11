import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, colors, IconButton, ListItem, Meta, OpenStatus, Rating, TypeTag, VerifiedMark } from '@/components/ui'
import { formatInterval, hoursToday } from '@/lib/openingHours'
import type { Organisation, OrganisationType } from '@/types/api'

/** What a row shows of a place: a search result, or the draft of the add-a-place preview. */
export type PlaceRow = Pick<Organisation, 'name' | 'verified' | 'ratingAvg' | 'reviewsCount' | 'distanceKm' | 'city' | 'openingHours' | 'timezone' | 'openNow'>

export interface PlaceListItemProps<P extends PlaceRow = Organisation> {
  place: P
  /** The place's organisation type, when it has one. */
  type?: OrganisationType
  /** The place whose pin is selected on the map. */
  active: boolean
  /** Tighter row for tablet and phone. */
  compact: boolean
  /** Makes the row a button (the map list); without it the row only shows the place (a preview). */
  onSelect?: (place: P) => void
  /** Bookmark state; `undefined` hides the bookmark (guests cannot save). */
  saved?: boolean
  onToggleSaved?: (place: P) => void
}

/** Distance is shown up to 50 km, farther away the city says more. */
const NEAR_KM = 50

/** One place in the map results: avatar, name, type, rating, distance or city, today's hours, bookmark. */
export function PlaceListItem<P extends PlaceRow = Organisation>({ place, type, active, compact, onSelect, saved, onToggleSaved }: PlaceListItemProps<P>) {
  const { t } = useTranslation()
  const row = useRef<HTMLDivElement>(null)
  // A place picked on the map comes into view in the list.
  useEffect(() => {
    if (active) row.current?.scrollIntoView({ block: 'nearest' })
  }, [active])
  const hours = hoursToday(place.openingHours, place.timezone)
  const hoursText = hours === undefined ? undefined : hours ? formatInterval(hours) : t('map.closedToday')
  const near = place.distanceKm !== undefined && place.distanceKm < NEAR_KM
  const where = near ? t('filters.km', { km: place.distanceKm!.toFixed(1) }) : place.city
  const typeColor = type?.color ?? (type?.slug ? colors.type[type.slug as keyof typeof colors.type]?.DEFAULT : undefined)

  return (
    <div ref={row} className="relative">
      <ListItem
        size={compact ? 'sm' : 'md'}
        leading={<Avatar name={place.name} color={typeColor} size={compact ? 'md' : 'lg'} />}
        title={place.name}
        adornment={place.verified ? <VerifiedMark /> : undefined}
        meta={
          <>
            {type && <TypeTag slug={type.slug} label={type.title ?? type.type} color={type.color} />}
            <Rating value={place.ratingAvg} count={place.reviewsCount} size="sm" />
            {where && <Meta>{where}</Meta>}
          </>
        }
        footer={place.openNow === null ? undefined : <OpenStatus open={place.openNow} hours={hoursText} size="sm" />}
        // Room for the bookmark, which sits above the row (a button inside a button row is not valid).
        trailing={onToggleSaved ? <span aria-hidden="true" className="size-9" /> : undefined}
        active={active}
        onClick={onSelect && (() => onSelect(place))}
      />
      {onToggleSaved && (
        <IconButton
          icon="bookmark"
          size="sm"
          pressed={saved}
          label={t(saved ? 'map.unsave' : 'map.save', { name: place.name })}
          onClick={() => onToggleSaved(place)}
          className="absolute top-2.5 right-2.5"
        />
      )}
    </div>
  )
}
