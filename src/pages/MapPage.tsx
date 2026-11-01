import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps'
import { LanguageSelect } from '@/components/layout/LanguageSelect'
import { PlaceList } from '@/components/map/PlaceList'
import { Button, InlineStatus, Logo, MapLayout, MapPin, TextLink, TopBar } from '@/components/ui'
import { useCountry, useOrganisationTypes } from '@/hooks/useCommon'
import { useGuestCorridor } from '@/hooks/useGuestCorridor'
import { useSearchOrganisations } from '@/hooks/useOrganisations'
import { boundsToSearchBox, geometryBounds, GOOGLE_MAPS_MAP_ID, MAP_SEARCH_LIMIT, organisationPosition, WORLD_VIEW, type SearchBox } from '@/lib/maps'
import { ROUTES } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'
import type { Organisation } from '@/types/api'

/** Pans the map to the selected place (rendered inside `<Map>`, where `useMap` has a map). */
function PanToPlace({ position }: { position: google.maps.LatLngLiteral | null }) {
  const map = useMap()
  const lat = position?.lat
  const lng = position?.lng
  useEffect(() => {
    if (map && lat !== undefined && lng !== undefined) map.panTo({ lat, lng })
  }, [map, lat, lng])
  return null
}

/**
 * World map with the places of the current viewport (public: guests browse too).
 * The viewport starts on the corridor's destination country (world view without a border); every pan or zoom
 * that settles (`idle`) re-runs `GET /api/organisation/search` for the new bounds.
 */
export default function MapPage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const corridor = useGuestCorridor()
  // The country list is brief (no borders); the destination's detail carries its border.
  const destination = useCountry(corridor.to?.id)
  const orgTypes = useOrganisationTypes()
  const [box, setBox] = useState<SearchBox>()
  const [selectedId, setSelectedId] = useState<string>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const search = useSearchOrganisations(box && { ...box, limit: MAP_SEARCH_LIMIT })

  const places = search.data?.items ?? []
  const types = orgTypes.data ?? []
  const selected = places.find((place) => place.id === selectedId)
  const start = geometryBounds(destination.data?.geoJson)
  const preparing = corridor.isPending || (!!corridor.to && destination.isPending)
  const loading = search.isPending

  const select = (place: Organisation) => {
    setSelectedId(place.id)
    setSheetOpen(false)
  }

  return (
    <MapLayout
      topBar={
        <TopBar
          brand={<Logo to={ROUTES.map} size="sm" />}
          actions={
            isAuthenticated ? (
              <LanguageSelect />
            ) : (
              <>
                <div className="md:hidden">
                  <TextLink to={ROUTES.signIn} tone="strong" size="md">
                    {t('auth.signIn.submit')}
                  </TextLink>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <LanguageSelect />
                  <Button to={ROUTES.signIn} variant="secondary" size="sm">
                    {t('auth.signIn.submit')}
                  </Button>
                  <Button to={ROUTES.signUp} variant="accent" size="sm">
                    {t('auth.signUp.action')}
                  </Button>
                </div>
              </>
            )
          }
        />
      }
      map={
        preparing ? (
          <div className="flex size-full items-center justify-center">
            <InlineStatus>{t('map.loadingMap')}</InlineStatus>
          </div>
        ) : (
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            {...(start ? { defaultBounds: start } : { defaultCenter: WORLD_VIEW.center, defaultZoom: WORLD_VIEW.zoom })}
            gestureHandling="greedy"
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            onIdle={(event) => {
              const bounds = event.map.getBounds()
              if (bounds) setBox(boundsToSearchBox(bounds))
            }}
            onClick={() => setSelectedId(undefined)}
          >
            {places.map((place) => {
              const position = organisationPosition(place)
              if (!position) return null
              const type = types.find((candidate) => candidate.id === place.organisationTypeId)
              return (
                <AdvancedMarker key={place.id} position={position} zIndex={place.id === selectedId ? 1 : 0} title={place.name} onClick={() => setSelectedId(place.id)}>
                  <MapPin slug={type?.slug ?? null} color={type?.color} label={place.name} selected={place.id === selectedId} />
                </AdvancedMarker>
              )
            })}
            <PanToPlace position={selected ? organisationPosition(selected) : null} />
          </Map>
        )
      }
      title={t('map.panelTitle')}
      panel={<PlaceList places={places} orgTypes={types} selectedId={selectedId} onSelect={select} loading={loading} error={search.isError} />}
      summary={loading ? t('map.loading') : t('map.inView', { count: places.length })}
      sheetOpen={sheetOpen}
      onSheetOpenChange={setSheetOpen}
    />
  )
}
