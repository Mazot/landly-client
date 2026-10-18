// Primitives shared by every landly-server contract.
//
// Field naming follows the server: request bodies and query strings are
// snake_case, response payloads are camelCase.
//
// Nullability follows serde: an `Option` field is sent as `null` (the key is
// always present) unless the server skips it, which is typed as `?:`.

/** UUID string. */
export type Uuid = string

/**
 * Server timestamp: UTC **without** a timezone suffix, e.g.
 * `"2026-10-18T09:12:44.123456"`. Parse it with `parseServerDateTime`
 * (`@/lib/dates`) — `new Date(value)` would read it as local time.
 */
export type ServerDateTime = string

/** `limit` / `offset` pagination; each endpoint documents its own caps. */
export interface PaginationParams {
  limit?: number
  offset?: number
}

/**
 * List envelope used by every paginated endpoint.
 * `total` is the number of items **in this response**, not the total in the
 * database — a page is the last one when `items.length < limit`.
 */
export interface ListResponse<T> {
  items: T[]
  total: number
}

/**
 * Error body of a 401/403/404/422/503 answer. Validation and constraint errors
 * carry `{ error }` (+ `constraint` for DB constraint violations, `details` for
 * a malformed UUID). A 500 answers the bare string `"Internal Server Error"`,
 * and actix extractor failures (400) / the rate limiter (429) answer plain text.
 */
export type ApiErrorBody =
  | {
      error: string
      constraint?: string
      details?: string
    }
  | string

/** GeoJSON geometry of a country border (`Country.geoJson`). */
export type GeoJsonPosition = [longitude: number, latitude: number]

export type CountryGeometry =
  | { type: 'Polygon'; coordinates: GeoJsonPosition[][] }
  | { type: 'MultiPolygon'; coordinates: GeoJsonPosition[][][] }
