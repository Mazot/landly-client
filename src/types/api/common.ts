// Reference data — server feature `common` (`/api/common/*`).
import type { CountryGeometry, PaginationParams, Uuid } from './shared'

/** `GET /api/common/countries` item. */
export interface Country {
  id: Uuid
  /** English name, e.g. "Germany". */
  name: string
  capitalCity: string | null
  description: string | null
  /** Flag emoji, e.g. "🇩🇪". */
  flag: string | null
  /** Country border for map rendering. */
  geoJson: CountryGeometry | null
  /** Local currency, e.g. "EUR" (free text). */
  currency: string | null
  /** International dialling prefix, e.g. "+49". */
  phoneCode: string | null
  /** Stored JSON, typically an array of city names. */
  topCities: unknown
}

/** Places on the map (live + pending) of one org type (`slug` is `"other"` for types without a slug). */
export interface PlacesByType {
  slug: string
  count: number
}

/** `GET /api/common/countries/{id}` — the country plus the breakdown of its places on the map (live + pending). */
export interface CountryDetail extends Country {
  totalPlaces: number
  placesByType: PlacesByType[]
}

/** Query of `GET /api/common/countries` (limit default 20, max 250; offset max 150). */
export interface CountriesQuery extends PaginationParams {
  /** Case-insensitive substring filter on the name. */
  name?: string
  /** Leave out `geoJson` (it comes back `null`): the full list with borders is ~12 MB. For pickers. */
  brief?: boolean
}

/**
 * `GET /api/common/languages` item. `id` is what `language_ids` (people) and
 * `languages_ids` / `languageIds` (users) reference. Organisations list
 * languages by `name` instead.
 */
export interface Language {
  id: Uuid
  /** English name, e.g. "Russian". */
  name: string
  /** ISO 639-3 code, e.g. "rus". */
  symbol: string | null
}

/** Query of `GET /api/common/languages` — ordered by name (limit default 100, max 500; offset unbounded). */
export interface LanguagesQuery extends PaginationParams {
  /** Case-insensitive substring filter on the name. */
  name?: string
  /** Only the official languages of these countries (sent comma-separated). */
  country_ids?: Uuid[]
}

/** `GET /api/common/timezone?lat&lng` — the IANA time zone a point lies in. */
export interface TimeZoneQuery {
  lat: number
  lng: number
}

export interface TimeZoneAnswer {
  /** e.g. "Europe/Belgrade"; null where no zone is known (open sea). */
  timezone: string | null
}

/** Stable org-type keys used by search filters and stats. */
export const ORGANISATION_TYPE_SLUGS = [
  'embassy',
  'business',
  'helper',
  'community',
  'volunteer',
] as const
export type KnownOrganisationTypeSlug = (typeof ORGANISATION_TYPE_SLUGS)[number]

/** `GET /api/common/org_types` item. */
export interface OrganisationType {
  id: Uuid
  /** Type key, e.g. "embassy". */
  type: string
  /** Stable machine key for filters/stats; unique when set. */
  slug: string | null
  /** Human-readable name, e.g. "Embassy". */
  title: string | null
  /** Hex colour for map pins and badges, e.g. "#4A6D8C". */
  color: string | null
}

/** `POST /api/common/org_types` — admin only. */
export interface CreateOrganisationTypeRequest {
  org_type: string
  title: string
  color: string
  slug?: string
}
