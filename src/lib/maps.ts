// Google Maps Platform configuration and helpers between Google types and the
// landly-server contracts. Rendering goes through `@vis.gl/react-google-maps`
// (`<Map>`, `<AdvancedMarker>`, `useMap`, `useMapsLibrary`) under the
// `<APIProvider>` mounted in `main.tsx`.
//
// Google's terms: the server stores only `google_place_id` (+ a refreshable
// copy of the point). Hours, photos and the Google rating are fetched live
// (`usePlaceDetails`) and must be shown on a Google map with Google's attribution.
import type { CountryGeometry, CreateOrganisationRequest, GeoJsonPosition, Organisation, SearchOrganisationsQuery } from '@/types/api'

/** Browser key (Maps JavaScript API + Places), restricted by HTTP referrer. */
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

/**
 * Map ID — required by `<AdvancedMarker>` and cloud-based styling.
 * `DEMO_MAP_ID` is Google's development-only fallback.
 */
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

/** Libraries preloaded by `<APIProvider>`. */
export const GOOGLE_MAPS_LIBRARIES = ['marker', 'places']

/** Whole-world view, used until a country gives the map a viewport. */
export const WORLD_VIEW = { center: { lat: 20, lng: 0 }, zoom: 2 } as const

/** Fixed view of the world map behind the landing and sign-in screens (fractional zoom). */
export const BACKDROP_VIEW = { center: { lat: 44.8, lng: -12.23 }, zoom: 4.5 } as const

/** Places requested per viewport (`GET /organisation/search` allows up to 200 per page; the list is easier to scan with 100). */
export const MAP_SEARCH_LIMIT = 100

export type SearchBox = Required<Pick<SearchOrganisationsQuery, 'min_lat' | 'min_lng' | 'max_lat' | 'max_lng'>>

/**
 * Bounding box of a country border (`Country.geoJson`, positions are `[lng, lat]`),
 * or null without a border. A country crossing the antimeridian (Russia, Fiji)
 * yields the full longitude range — the map then simply shows the world.
 */
export function geometryBounds(geometry: CountryGeometry | null | undefined): google.maps.LatLngBoundsLiteral | null {
  if (!geometry) return null
  const rings: GeoJsonPosition[][] = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat()
  const positions = rings.flat()
  if (positions.length === 0) return null
  const lngs = positions.map(([lng]) => lng)
  const lats = positions.map(([, lat]) => lat)
  return { west: Math.min(...lngs), east: Math.max(...lngs), south: Math.min(...lats), north: Math.max(...lats) }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Map viewport → bbox of `GET /api/organisation/search`.
 * The server filters longitude with a plain BETWEEN, so a viewport crossing the
 * antimeridian (west > east) is widened to the full longitude range.
 */
export function boundsToSearchBox(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral): SearchBox {
  const { south, west, north, east } = 'toJSON' in bounds ? bounds.toJSON() : bounds
  const crossesAntimeridian = west > east
  return {
    min_lat: clamp(south, -90, 90),
    max_lat: clamp(north, -90, 90),
    min_lng: crossesAntimeridian ? -180 : clamp(west, -180, 180),
    max_lng: crossesAntimeridian ? 180 : clamp(east, -180, 180),
  }
}

/** Marker position of an organisation, or null when it has no point. */
export function organisationPosition(
  organisation: Pick<Organisation, 'latitude' | 'longitude'>,
): google.maps.LatLngLiteral | null {
  const { latitude, longitude } = organisation
  return latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null
}

/**
 * Location fields of a create request from a Google place picked in Places
 * Autocomplete. Fetch at least `id`, `location` and `formattedAddress` first.
 * The server re-resolves the point from the place id when it has a Places key.
 */
export function placeToOrganisationLocation(
  place: google.maps.places.Place,
): Pick<CreateOrganisationRequest, 'google_place_id' | 'latitude' | 'longitude' | 'address'> {
  const location = place.location
  return {
    google_place_id: place.id,
    latitude: location?.lat(),
    longitude: location?.lng(),
    address: place.formattedAddress ?? undefined,
  }
}
