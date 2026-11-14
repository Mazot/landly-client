// Map filters: one value object shared by the filter bar, the type rail, the filters sheet and the
// results list. It lives in the URL (`/map?types=embassy&open=1`), so a reload or a shared link
// keeps the view, and it maps 1:1 onto the query of `GET /api/organisation/search`.
import { compact } from 'es-toolkit'
import type { AddedBy, SearchOrganisationsQuery, SearchSort } from '@/types/api'
import { ADDED_BY, SEARCH_SORTS } from '@/types/api'

/** Minimum-rating choices; `null` is "Any". */
export const RATING_FILTERS = [3.5, 4, 4.5] as const

export interface MapFilters {
  /** Org type slugs (`types`). */
  types: string[]
  /** Language names (`languages`). */
  languages: string[]
  openNow: boolean
  verified: boolean
  minRating: number | null
  addedBy: AddedBy | null
  sort: SearchSort
}

export const DEFAULT_FILTERS: MapFilters = {
  types: [],
  languages: [],
  openNow: false,
  verified: false,
  minRating: null,
  addedBy: null,
  sort: 'nearest',
}

const list = (value: string | null) => (value ? compact(value.split(',')) : [])
const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | null => allowed.find((candidate) => candidate === value) ?? null

/** Filters from the URL; unknown or malformed values fall back to the defaults. */
export function parseFilters(params: URLSearchParams): MapFilters {
  const rating = Number(params.get('rating'))
  return {
    types: list(params.get('types')),
    languages: list(params.get('lang')),
    openNow: params.get('open') === '1',
    verified: params.get('verified') === '1',
    minRating: RATING_FILTERS.find((candidate) => candidate === rating) ?? null,
    addedBy: oneOf(ADDED_BY, params.get('by')),
    sort: oneOf(SEARCH_SORTS, params.get('sort')) ?? DEFAULT_FILTERS.sort,
  }
}

/** URL parameters of `filters`: only what differs from the defaults. */
export function serializeFilters(filters: MapFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.types.length) params.set('types', filters.types.join(','))
  if (filters.languages.length) params.set('lang', filters.languages.join(','))
  if (filters.openNow) params.set('open', '1')
  if (filters.verified) params.set('verified', '1')
  if (filters.minRating !== null) params.set('rating', String(filters.minRating))
  if (filters.addedBy) params.set('by', filters.addedBy)
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  return params
}

/** Filter groups that are switched on — the number on "More filters · 4". The sort order is not a filter. */
export function countActiveFilters(filters: MapFilters): number {
  return compact([filters.types.length > 0, filters.languages.length > 0, filters.openNow, filters.verified, filters.minRating !== null, filters.addedBy !== null]).length
}

/** The filters part of a search request; empty groups are left out. */
export function filtersToQuery(filters: MapFilters): SearchOrganisationsQuery {
  return {
    ...(filters.types.length && { types: filters.types }),
    ...(filters.languages.length && { languages: filters.languages }),
    ...(filters.openNow && { open_now: true }),
    ...(filters.verified && { verified: true }),
    ...(filters.minRating !== null && { min_rating: filters.minRating }),
    ...(filters.addedBy && { added_by: filters.addedBy }),
    sort: filters.sort,
  }
}
