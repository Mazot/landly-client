import { AdvancedMarker, Map } from '@vis.gl/react-google-maps'
import { MapPin } from '@/components/ui'
import { GOOGLE_MAPS_MAP_ID, organisationPosition } from '@/lib/maps'
import type { Organisation, OrganisationType } from '@/types/api'

/** Street level: the place and its block. */
export const MINI_MAP_ZOOM = 15

export interface PlaceMiniMapProps {
  place: Pick<Organisation, 'latitude' | 'longitude' | 'name' | 'status'>
  type: OrganisationType | undefined
}

/** A still map around the place with its pin; nothing when it has no point. */
export function PlaceMiniMap({ place, type }: PlaceMiniMapProps) {
  const position = organisationPosition(place)
  if (!position) return null
  return (
    <div className="h-35 overflow-hidden rounded-r3 border border-border-1">
      <Map mapId={GOOGLE_MAPS_MAP_ID} defaultCenter={position} defaultZoom={MINI_MAP_ZOOM} disableDefaultUI gestureHandling="none" clickableIcons={false} keyboardShortcuts={false}>
        <AdvancedMarker position={position} title={place.name}>
          <MapPin slug={type?.slug ?? null} color={type?.color} label={place.name} pending={place.status === 'pending'} />
        </AdvancedMarker>
      </Map>
    </div>
  )
}
