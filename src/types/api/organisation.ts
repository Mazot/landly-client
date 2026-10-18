// Organisations (places on the map) — server feature `organisation`.
import type { PaginationParams, ServerDateTime, Uuid } from './shared'

/** Moderation status. Only `live` rows appear in list/search. */
export const ORGANISATION_STATUSES = ['pending', 'live', 'rejected'] as const
export type OrganisationStatus = (typeof ORGANISATION_STATUSES)[number]

/** Who added the place. */
export const ADDED_BY = ['official', 'community', 'volunteer'] as const
export type AddedBy = (typeof ADDED_BY)[number]

export const COSTS = ['free', 'paid'] as const
export type Cost = (typeof COSTS)[number]

/** Where the point came from. */
export const LOCATION_SOURCES = ['google', 'user_pin', 'moderator'] as const
export type LocationSource = (typeof LOCATION_SOURCES)[number]

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Weekday = (typeof WEEKDAYS)[number]

/**
 * One opening interval in the place's local time, 24-hour `"HH:MM"`:
 * `["09:00", "13:00"]`. The close time is exclusive, so a full day is
 * `["00:00", "24:00"]`. The server compares the strings, so an interval must
 * not cross midnight — split it across two days. Hours are not validated on write.
 */
export type OpeningInterval = [open: string, close: string]

/** Weekly hours: `{ "mon": [["09:00","13:00"], ["14:00","18:00"]], … }`. */
export type OpeningHours = Partial<Record<Weekday, OpeningInterval[]>>

/** Community check-in signals — only on the detail (`fetch` / `checkin`) payload. */
export interface CommunitySignals {
  /** Number of community check-ins. */
  peopleCame: number
  /** Share of check-ins confirming "still active", 0–100; null without data. */
  stillActivePct: number | null
  lastCheckinAt: ServerDateTime | null
  /** Up to 5 latest tips, newest first. */
  tips: string[]
}

/** `OrganisationContent` — list, search, fetch, create, update and check-in payload. */
export interface Organisation {
  id: Uuid
  name: string
  status: OrganisationStatus
  description: string | null
  address: string | null
  city: string | null
  tel: string | null
  email: string | null
  website: string | null
  telegram: string | null
  whatsapp: string | null
  latitude: number | null
  longitude: number | null
  locationSource: LocationSource | null
  /**
   * Google Places ID. Google's terms allow storing only this id: hours, photos
   * and the Google rating are fetched live by the client (`usePlaceDetails`).
   */
  googlePlaceId: string | null
  /** Country the place is located in (corridor "to"). */
  locationCountryId: Uuid | null
  /** Home country of the founders / community it serves (corridor "from"). */
  founderCountryId: Uuid | null
  organisationTypeId: Uuid | null
  addedBy: AddedBy | null
  cost: Cost | null
  /** Languages spoken, by name (e.g. "Russian"). */
  languages: string[]
  /** Services offered, free-text tags. */
  services: string[]
  openingHours: OpeningHours | null
  /** IANA timezone, e.g. "Europe/Berlin". */
  timezone: string | null
  /** Computed from `openingHours` + `timezone` at response time; null when unknown. */
  openNow: boolean | null
  /** Verified badge (set only in the database). */
  verified: boolean
  /** Average review rating 1–5; null without reviews. */
  ratingAvg: number | null
  reviewsCount: number
  visitsCount: number
  /** Submitter; null for seeded rows or a deleted user. */
  createdBy: Uuid | null
  createdAt: ServerDateTime
  updatedAt: ServerDateTime
  /** Present only in `/search` responses when an origin point was given. */
  distanceKm?: number
  /** Present only on the detail payload. */
  community?: CommunitySignals
}

/**
 * `POST /api/organisation/create` — the place is created as `pending`.
 * Location: with `google_place_id` the server re-resolves the point from Google
 * (when it has a Places key), without it `latitude`/`longitude` are a user pin.
 * Give both coordinates or neither.
 */
export interface CreateOrganisationRequest {
  name: string
  description?: string
  address?: string
  city?: string
  tel?: string
  email?: string
  website?: string
  telegram?: string
  whatsapp?: string
  latitude?: number
  longitude?: number
  google_place_id?: string
  location_country_id?: Uuid
  founder_country_id?: Uuid
  organisation_type_id?: Uuid
  added_by?: AddedBy
  cost?: Cost
  languages?: string[]
  services?: string[]
  opening_hours?: OpeningHours
  timezone?: string
}

/**
 * `PUT /api/organisation/update/{id}` — omitted fields keep their value.
 * Creator or moderator/admin only; a creator's edit of a `live` place sends it
 * back to `pending`.
 */
export type UpdateOrganisationRequest = Partial<
  Omit<CreateOrganisationRequest, 'google_place_id' | 'added_by'>
>

/** `GET /api/organisation/list` (limit default 20, max 100; offset max 150). */
export interface OrganisationsListQuery extends PaginationParams {
  /** Case-insensitive substring filters. */
  name?: string
  tel?: string
  email?: string
  address?: string
  location_country_id?: Uuid
  organisation_type_id?: Uuid
  founder_country_id?: Uuid
}

export const SEARCH_SORTS = ['nearest', 'recent', 'verified'] as const
export type SearchSort = (typeof SEARCH_SORTS)[number]

/**
 * `GET /api/organisation/search` — map search. Give all four bbox edges or an
 * origin (`lat` + `lng`, optionally `radius_km`).
 * Limit default 50, max 200; at most 500 rows are scanned per search.
 * Array fields are sent comma-separated.
 */
export interface SearchOrganisationsQuery extends PaginationParams {
  min_lat?: number
  min_lng?: number
  max_lat?: number
  max_lng?: number
  /** Origin; enables `distanceKm` and `sort=nearest`. */
  lat?: number
  lng?: number
  radius_km?: number
  /** Org type slugs, e.g. `['embassy', 'community']`. */
  types?: string[]
  /** Language names, e.g. `['Russian', 'English']`. */
  languages?: string[]
  open_now?: boolean
  verified?: boolean
  /** Minimum average rating, 1–5. */
  min_rating?: number
  added_by?: AddedBy
  cost?: Cost
  /** Defaults to `nearest` with an origin, else `recent`; `nearest` without an origin is a 422. */
  sort?: SearchSort
}

/** `POST /api/organisation/checkin/{id}` — answers the fresh detail payload. */
export interface CheckinRequest {
  /** "The place is still active"; defaults to true. */
  still_active?: boolean
  /** Community tip shown on the detail page. */
  tip?: string
}

/** `POST /api/organisation/visit/{id}` — public visit counter. */
export interface OrganisationVisits {
  visitsCount: number
}
