// The people list's filters ↔ the page URL (`/people?city=…&skills=…&lang=…`) and the list request.
import { compact } from 'es-toolkit'
import type { PeopleListQuery, Uuid } from '@/types/api'

export interface PeopleFilters {
  /** Case-insensitive substring of the city; `''` = any. */
  city: string
  /** Skill names, as `GET /person/skills` names them. */
  skills: string[]
  /** `GET /common/languages` ids. */
  languageIds: Uuid[]
}

export const DEFAULT_PEOPLE_FILTERS: PeopleFilters = { city: '', skills: [], languageIds: [] }

const list = (value: string | null) => (value ? compact(value.split(',')) : [])

/** Filters from the URL; whatever is missing falls back to the defaults. */
export function parsePeopleFilters(params: URLSearchParams): PeopleFilters {
  return { city: params.get('city') ?? '', skills: list(params.get('skills')), languageIds: list(params.get('lang')) }
}

/** URL parameters of `filters`: only what differs from the defaults. */
export function serializePeopleFilters(filters: PeopleFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.city.trim()) params.set('city', filters.city.trim())
  if (filters.skills.length) params.set('skills', filters.skills.join(','))
  if (filters.languageIds.length) params.set('lang', filters.languageIds.join(','))
  return params
}

/** Filter groups switched on — the number on the filters button. */
export const countActivePeopleFilters = (filters: PeopleFilters) => compact([filters.city.trim(), filters.skills.length > 0, filters.languageIds.length > 0]).length

/** The list request: the filters (empty groups left out) and the country the corridor leads to. */
export function toPeopleQuery(filters: PeopleFilters, countryId?: Uuid): PeopleListQuery {
  return {
    ...(filters.city.trim() && { city: filters.city.trim() }),
    ...(filters.skills.length > 0 && { skills: filters.skills }),
    ...(filters.languageIds.length > 0 && { language_ids: filters.languageIds }),
    ...(countryId && { location_country_id: countryId }),
  }
}
