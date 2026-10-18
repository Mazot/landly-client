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

/** Live organisations of one org type (`slug` is `"other"` for types without a slug). */
export interface PlacesByType {
  slug: string
  count: number
}

/** `GET /api/common/countries/{id}` — the country plus its live-place breakdown. */
export interface CountryDetail extends Country {
  totalPlaces: number
  placesByType: PlacesByType[]
}

/** Query of `GET /api/common/countries` (limit default 20, max 250; offset max 150). */
export interface CountriesQuery extends PaginationParams {
  /** Case-insensitive substring filter on the name. */
  name?: string
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
