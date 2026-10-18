// A user's "from → to" country pair — server feature `corridor` (all routes need auth).
import type { PlacesByType } from './common'
import type { ServerDateTime, Uuid } from './shared'

/** `CorridorContent`. */
export interface Corridor {
  id: Uuid
  /** Home country the user comes from. */
  fromCountryId: Uuid
  /** Destination country the map opens to. */
  toCountryId: Uuid
  /** At most one default corridor per user. */
  isDefault: boolean
  createdAt: ServerDateTime
}

/** `POST /api/corridor/create`; the two countries must differ. */
export interface CreateCorridorRequest {
  from_country_id: Uuid
  to_country_id: Uuid
  /** Replace the current default. Defaults to false. */
  is_default?: boolean
}

/** `GET /api/corridor/stats/{id}` — live places in the destination country. */
export interface CorridorStats {
  corridorId: Uuid
  fromCountryId: Uuid
  toCountryId: Uuid
  totalPlaces: number
  /** Of those, created during the last 7 days. */
  newThisWeek: number
  byType: PlacesByType[]
}
