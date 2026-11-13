import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from '@/components/ui'
import { GOOGLE_MAPS_MAP_ID, WORLD_VIEW } from '@/lib/maps'

const MAP_ID = 'landly-add-place'
/** How close the map comes to a point that was picked or found. */
export const PICKED_ZOOM = 16

export interface LocationPickerProps {
  /** The pin; `null` until the user sets it. */
  value: google.maps.LatLngLiteral | null
  onChange: (point: google.maps.LatLngLiteral) => void
  /** The map's start view without a pin: the destination country. */
  start?: google.maps.LatLngBoundsLiteral | null
  /** The pin's label (the name typed so far). */
  label: string
}

/**
 * A Google map to set the place's point: a click puts the pin there, the pin can be dragged. A
 * point that comes from outside (a Google pick) is centred on.
 */
export function LocationPicker({ value, onChange, start, label }: LocationPickerProps) {
  const { t } = useTranslation()
  const map = useMap(MAP_ID)
  const lat = value?.lat
  const lng = value?.lng
  useEffect(() => {
    if (!map || lat === undefined || lng === undefined) return
    map.panTo({ lat, lng })
    if ((map.getZoom() ?? 0) < PICKED_ZOOM) map.setZoom(PICKED_ZOOM)
  }, [map, lat, lng])
  // The country's border arrives after the map: show it once it does (and when the country changes).
  useEffect(() => {
    if (map && start && !value) map.fitBounds(start)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new country moves the map, not the pin
  }, [map, start?.north, start?.south, start?.east, start?.west])

  const toPoint = (latLng: google.maps.LatLng | null | undefined) => latLng && onChange(latLng.toJSON())
  return (
    <Map
      id={MAP_ID}
      mapId={GOOGLE_MAPS_MAP_ID}
      {...(value ? { defaultCenter: value, defaultZoom: PICKED_ZOOM } : start ? { defaultBounds: start } : { defaultCenter: WORLD_VIEW.center, defaultZoom: WORLD_VIEW.zoom })}
      gestureHandling="cooperative"
      disableDefaultUI
      zoomControl
      clickableIcons={false}
      onClick={(event) => event.detail.latLng && onChange(event.detail.latLng)}
    >
      {value && (
        <AdvancedMarker position={value} draggable title={t('addPlace.location.pin')} onDragEnd={(event) => toPoint(event.latLng)}>
          <MapPin slug={null} label={label || t('addPlace.location.pin')} selected />
        </AdvancedMarker>
      )}
    </Map>
  )
}
