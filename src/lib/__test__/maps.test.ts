import { describe, expect, it, vi } from 'vitest'
import {
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_MAP_ID,
  boundsToSearchBox,
  organisationPosition,
  placeToOrganisationLocation,
} from '../maps'

describe('config', () => {
  it('falls back to Google’s development map id', () => {
    expect(GOOGLE_MAPS_MAP_ID).toBe('DEMO_MAP_ID')
  })

  it('reads the map id and key from the environment', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'prod-map')
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'browser-key')
    vi.resetModules()
    const fresh = await import('../maps')
    expect(fresh.GOOGLE_MAPS_MAP_ID).toBe('prod-map')
    expect(fresh.GOOGLE_MAPS_API_KEY).toBe('browser-key')
  })

  it('preloads the marker and places libraries', () => {
    expect(GOOGLE_MAPS_LIBRARIES).toEqual(['marker', 'places'])
  })
})

describe('boundsToSearchBox', () => {
  it('maps a bounds literal to the search bbox', () => {
    expect(boundsToSearchBox({ south: 52.3, west: 13.1, north: 52.7, east: 13.8 })).toEqual({
      min_lat: 52.3,
      max_lat: 52.7,
      min_lng: 13.1,
      max_lng: 13.8,
    })
  })

  it('accepts a google.maps.LatLngBounds (anything with toJSON)', () => {
    const bounds = { toJSON: () => ({ south: 1, west: 2, north: 3, east: 4 }) } as unknown as google.maps.LatLngBounds
    expect(boundsToSearchBox(bounds)).toEqual({ min_lat: 1, max_lat: 3, min_lng: 2, max_lng: 4 })
  })

  it('widens a viewport crossing the antimeridian to all longitudes', () => {
    expect(boundsToSearchBox({ south: -20, west: 170, north: 10, east: -170 })).toEqual({
      min_lat: -20,
      max_lat: 10,
      min_lng: -180,
      max_lng: 180,
    })
  })

  it('clamps to the ranges the server validates', () => {
    expect(boundsToSearchBox({ south: -95, west: -190, north: 95, east: 185 })).toEqual({
      min_lat: -90,
      max_lat: 90,
      min_lng: -180,
      max_lng: 180,
    })
  })
})

describe('organisationPosition', () => {
  it('returns a LatLngLiteral for a point', () => {
    expect(organisationPosition({ latitude: 52.5, longitude: 13.4 })).toEqual({ lat: 52.5, lng: 13.4 })
  })

  it('keeps 0 coordinates (equator / Greenwich)', () => {
    expect(organisationPosition({ latitude: 0, longitude: 0 })).toEqual({ lat: 0, lng: 0 })
  })

  it('is null without a full point', () => {
    expect(organisationPosition({ latitude: null, longitude: 13.4 })).toBeNull()
    expect(organisationPosition({ latitude: 52.5, longitude: null })).toBeNull()
  })
})

describe('placeToOrganisationLocation', () => {
  it('takes the place id, point and address of a fetched place', () => {
    const place = {
      id: 'ChIJAVkDPzdOqEcRcDteW0YgIQQ',
      location: { lat: () => 52.52, lng: () => 13.405 },
      formattedAddress: 'Unter den Linden 63–65, Berlin',
    } as unknown as google.maps.places.Place

    expect(placeToOrganisationLocation(place)).toEqual({
      google_place_id: 'ChIJAVkDPzdOqEcRcDteW0YgIQQ',
      latitude: 52.52,
      longitude: 13.405,
      address: 'Unter den Linden 63–65, Berlin',
    })
  })

  it('leaves point and address undefined when those fields were not fetched', () => {
    const place = { id: 'place-1', location: null, formattedAddress: null } as unknown as google.maps.places.Place
    expect(placeToOrganisationLocation(place)).toEqual({
      google_place_id: 'place-1',
      latitude: undefined,
      longitude: undefined,
      address: undefined,
    })
  })
})
