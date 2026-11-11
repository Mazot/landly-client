import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { useAppShell } from '@/components/layout/appShellContext'
import { FiltersSheet } from '@/components/map/FiltersSheet'
import { MapControls } from '@/components/map/MapControls'
import { MapToolbar } from '@/components/map/MapToolbar'
import { PlaceList } from '@/components/map/PlaceList'
import { ResultsHeader } from '@/components/map/ResultsHeader'
import { Button, CorridorBubble, InlineStatus, MapLayout, MapPin } from '@/components/ui'
import { useCountry, useOrganisationTypes } from '@/hooks/useCommon'
import { useCorridorStats } from '@/hooks/useCorridors'
import { useCurrentCorridor } from '@/hooks/useCurrentCorridor'
import { useSearchOrganisations } from '@/hooks/useOrganisations'
import { useSavedPlaces } from '@/hooks/useSavedPlaces'
import { countActiveFilters, DEFAULT_FILTERS, filtersToQuery, parseFilters, serializeFilters, type MapFilters } from '@/lib/mapFilters'
import { boundsToSearchBox, geometryBounds, GOOGLE_MAPS_MAP_ID, MAP_SEARCH_LIMIT, organisationPosition, WORLD_VIEW, type SearchBox } from '@/lib/maps'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { useAuthStore } from '@/stores/authStore'
import type { Organisation } from '@/types/api'

const MAP_ID = 'landly-map'
/** How far a place is zoomed to when the user asks for their location. */
const LOCATE_ZOOM = 13

/** What the map showed when it last came to rest: the bbox to search and its centre (the origin for distances). */
interface Viewport {
  box: SearchBox
  center: google.maps.LatLngLiteral
  /** The corridor destination it belongs to — a new destination starts a new search. */
  destinationId: string | undefined
}

/** Whether a place matches the name search: name, city, address and services, case-insensitive. */
const matches = (place: Organisation, query: string) => [place.name, place.city, place.address, ...place.services].some((text) => text?.toLowerCase().includes(query))

/**
 * Map screen (public — guests browse too). The map starts on the corridor's destination; the
 * places of the area it shows are searched with `GET /api/organisation/search` and listed next to
 * it. Phones search as the map moves; larger screens offer "Search this area" after a move.
 */
export default function MapPage() {
  return (
    <AppShell>
      <MapScreen />
    </AppShell>
  )
}

function MapScreen() {
  const { t } = useTranslation()
  const size = useBreakpoint()
  const { openCorridors } = useAppShell()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const map = useMap(MAP_ID)

  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const setFilters = (next: MapFilters) => setSearchParams(serializeFilters(next), { replace: true })
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [locateDenied, setLocateDenied] = useState(false)

  const { from, to, corridor, isPending: corridorPending } = useCurrentCorridor()
  // The country list is brief (no borders): the destination's detail carries its border and, for guests, its stats.
  const destination = useCountry(to?.id)
  const corridorStats = useCorridorStats(corridor?.id)
  const orgTypes = useOrganisationTypes()
  const saved = useSavedPlaces()

  // The latest resting view, and the one the list shows. The list follows the map on its own on
  // phones and for the first search; elsewhere the user asks with "Search this area".
  const [latest, setLatest] = useState<Viewport>()
  const [applied, setApplied] = useState<Viewport>()
  const current = applied?.destinationId === to?.id ? applied : undefined
  const moved = !!latest && !!current && latest.destinationId === to?.id && JSON.stringify(latest.box) !== JSON.stringify(current.box)

  const search = useSearchOrganisations(current && { ...current.box, lat: current.center.lat, lng: current.center.lng, ...filtersToQuery(filters), location_country_id: current.destinationId, limit: MAP_SEARCH_LIMIT })
  // The list keeps the previous answer while the next one loads (panning), but not across a new
  // destination or new filters: those results would be wrong, so they count as loading.
  const scope = JSON.stringify([to?.id, filtersToQuery(filters)])
  const [shownScope, setShownScope] = useState(scope)
  if (search.data && !search.isPlaceholderData && shownScope !== scope) setShownScope(scope)
  const stale = search.isPlaceholderData && shownScope !== scope
  const items = stale ? [] : (search.data?.items ?? [])
  const needle = query.trim().toLowerCase()
  const places = needle ? items.filter((place) => matches(place, needle)) : items
  const types = orgTypes.data ?? []
  const activeCount = countActiveFilters(filters)
  const loading = !current || search.isPending || stale
  const capped = !needle && items.length >= MAP_SEARCH_LIMIT

  const start = geometryBounds(destination.data?.geoJson)
  const preparing = corridorPending || (!!to && destination.isPending)

  const onIdle = (event: { map: google.maps.Map }) => {
    const bounds = event.map.getBounds()
    const center = event.map.getCenter()
    if (!bounds || !center) return
    const next = { box: boundsToSearchBox(bounds), center: center.toJSON(), destinationId: to?.id }
    setLatest(next)
    if (size === 'phone' || !current) setApplied(next)
  }

  const select = (place: Organisation) => {
    setSelectedId(place.id)
    setSheetExpanded(false)
    const position = organisationPosition(place)
    if (map && position) map.panTo(position)
  }

  // The two biggest kinds of place in the destination, named as the backend names them.
  const titleOf = (slug: string) => types.find((type) => type.slug === slug)?.title ?? slug
  const typeFigures = [...(corridorStats.data?.byType ?? destination.data?.placesByType ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((entry) => `${titleOf(entry.slug)} ${entry.count}`)

  const bubble = destination.data && from && to && (
    <CorridorBubble
      from={from.flag}
      to={to.flag}
      label={t('corridorSwitcher.label', { from: from.name, to: to.name })}
      title={t('map.corridorPlaces', { count: corridorStats.data?.totalPlaces ?? destination.data.totalPlaces })}
      detail={[...typeFigures, corridorStats.data && t('map.newThisWeek', { count: corridorStats.data.newThisWeek })].filter(Boolean).join(' · ')}
      onClick={openCorridors}
    />
  )

  const locate = !!navigator.geolocation && !locateDenied
  const overlay =
    size === 'phone' ? null : (
      <>
        {moved && (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <div className="pointer-events-auto">
              <Button variant="secondary" size="sm" icon="search" onClick={() => setApplied(latest)}>
                {t('map.searchThisArea')}
              </Button>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-end">
          <div className="pointer-events-auto min-w-0">{bubble}</div>
        </div>
        <div className="absolute right-4 bottom-4">
          <MapControls
            onZoomIn={() => map?.setZoom((map.getZoom() ?? WORLD_VIEW.zoom) + 1)}
            onZoomOut={() => map?.setZoom((map.getZoom() ?? WORLD_VIEW.zoom) - 1)}
            onLocate={
              locate
                ? () =>
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        map?.panTo({ lat: position.coords.latitude, lng: position.coords.longitude })
                        map?.setZoom(LOCATE_ZOOM)
                      },
                      // Permission denied or no fix: the control would only fail again, so it goes away.
                      () => setLocateDenied(true),
                    )
                : undefined
            }
          />
        </div>
      </>
    )

  return (
    <>
      <MapLayout
        toolbar={
          <MapToolbar
            size={size}
            filters={filters}
            onFiltersChange={setFilters}
            orgTypes={types}
            query={query}
            onQueryChange={setQuery}
            activeCount={activeCount}
            onOpenFilters={() => setFiltersOpen(true)}
            destination={to?.name}
            corridor={from && to ? { from: from.flag, to: to.flag, label: t('corridorSwitcher.label', { from: from.name, to: to.name }), name: to.name, onOpen: openCorridors } : undefined}
          />
        }
        map={
          preparing ? (
            <div className="flex size-full items-center justify-center">
              <InlineStatus>{t('map.loadingMap')}</InlineStatus>
            </div>
          ) : (
            <Map
              // A new destination starts a new map: `defaultBounds` only applies on mount.
              key={to?.id}
              id={MAP_ID}
              mapId={GOOGLE_MAPS_MAP_ID}
              {...(start ? { defaultBounds: start } : { defaultCenter: WORLD_VIEW.center, defaultZoom: WORLD_VIEW.zoom })}
              gestureHandling="greedy"
              disableDefaultUI
              clickableIcons={false}
              onIdle={onIdle}
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
            </Map>
          )
        }
        overlay={overlay}
        resultsHeader={<ResultsHeader size={size} count={loading ? null : places.length} capped={capped} sort={filters.sort} onSortChange={(sort) => setFilters({ ...filters, sort })} />}
        results={
          <PlaceList
            places={places}
            orgTypes={types}
            selectedId={selectedId}
            onSelect={select}
            compact={size !== 'desktop'}
            loading={loading}
            error={search.isError}
            narrowed={activeCount > 0 || needle !== ''}
            onResetFilters={() => {
              setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })
              setQuery('')
            }}
            capped={capped}
            isSaved={isAuthenticated ? (place) => saved.isSaved(place.id) : undefined}
            onToggleSaved={isAuthenticated ? (place) => saved.toggle(place.id) : undefined}
          />
        }
        resultsLabel={t('map.panelTitle')}
        sheetExpanded={sheetExpanded}
        onSheetExpandedChange={setSheetExpanded}
        sheetHandleLabel={t(sheetExpanded ? 'map.hideList' : 'map.showList')}
      />
      {filtersOpen && (
        <FiltersSheet
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            setFiltersOpen(false)
          }}
          orgTypes={types}
          area={current}
        />
      )}
    </>
  )
}
