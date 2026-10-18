// Embassy/consulate links per country — server feature `country_connection`.
// Reads are public; create/update/delete are admin only.
import type { PaginationParams, Uuid } from './shared'

/** `CountryConnectionContent`. */
export interface CountryConnection {
  id: Uuid
  /** Free-text notes about consular services. */
  commonInfo: string | null
  consulateOrgId: Uuid | null
  embassyOrgId: Uuid | null
  /** Country the embassy/consulate is located in. */
  locationCountryId: Uuid | null
}

/** `POST /api/country-connection/create`. */
export interface CreateCountryConnectionRequest {
  common_info?: string
  consulate_org_id?: Uuid
  embassy_org_id?: Uuid
  location_country_id?: Uuid
}

/** `PUT /api/country-connection/update/{id}` — omitted fields keep their value. */
export type UpdateCountryConnectionRequest = CreateCountryConnectionRequest

/** `GET /api/country-connection/list` (limit default 20, max 100; offset max 150). */
export interface CountryConnectionsQuery extends PaginationParams {
  embassy_org_id?: Uuid
  consulate_org_id?: Uuid
  location_country_id?: Uuid
}
