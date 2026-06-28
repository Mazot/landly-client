// API Types based on server presenters (serde rename_all = "camelCase").
// See docs/missing-api.md for a full description of endpoints that need to be
// added to landly-server before the corresponding client features can go live.

// ============================================================================
// Entity Types
// ============================================================================

// TODO(server): no GET /api/user/me — can't re-fetch logged-in user after page
// reload. Also missing PUT /api/user/me (edit profile) and DELETE /api/user/me.
// The `organisations` table has no owner column, so "My Orgs" on AccountPage
// needs a schema change + GET /api/user/me/organisations before it can be real.
export interface User {
  id: string
  username: string
  email: string
  created_at: string
  updated_at: string
}

export interface Country {
  id: string
  name: string
  capitalCity?: string
  description?: string
  flag?: string
  geoJson?: any // JSON object from OpenAPI
}

export interface OrganizationType {
  id: string
  type: string // serialised from org_type field
  title?: string
  color?: string
}

export interface Organization {
  id: string
  name: string
  address?: string
  description?: string
  email?: string
  tel?: string
  latitude?: number
  longitude?: number
  founderCountryId?: string
  locationCountryId?: string
  organisationTypeId?: string
  createdAt: string
  updatedAt: string
}

// TODO(server): `countries_connections` table has only `location_country_id`
// (the destination country). There is no `from_country_id` / `founder_country_id`,
// so it's impossible to filter connections by both sides of a corridor (RU → DE).
// Schema needs a second country FK; see docs/missing-api.md §CountryConnection.
export interface CountryConnection {
  id: string
  commonInfo?: string
  consulateOrgId?: string
  embassyOrgId?: string
  locationCountryId?: string
}

export interface UserLanguages {
  userId: string
  languageIds: string[]
}

// TODO(server): The `languages` table exists (id, name, symbol) but there is
// no GET /api/common/languages endpoint. Language IDs needed for
// POST/DELETE /api/user/languages have no source without this endpoint.
export interface Language {
  id: string
  name: string
  symbol?: string
}

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  id: string
  username: string
  email: string
  token: string
}

// ============================================================================
// Organisation Request Types
// ============================================================================

export interface CreateOrganisationRequest {
  name: string
  address?: string
  description?: string
  email?: string
  tel?: string
  latitude?: number
  longitude?: number
  founder_country_id?: string
  location_country_id?: string
  organisation_type_id?: string
}

export interface UpdateOrganisationRequest {
  name?: string
  address?: string
  description?: string
  email?: string
  tel?: string
  latitude?: number
  longitude?: number
  founder_country_id?: string
  location_country_id?: string
  organisation_type_id?: string
}

// ============================================================================
// CountryConnection Request Types
// ============================================================================

export interface CreateCountryConnectionRequest {
  common_info?: string
  consulate_org_id?: string
  embassy_org_id?: string
  location_country_id?: string
}

export interface UpdateCountryConnectionRequest {
  common_info?: string
  consulate_org_id?: string
  embassy_org_id?: string
  location_country_id?: string
}

// ============================================================================
// User Languages Request Types
// ============================================================================

export interface AddLanguagesRequest {
  user_id: string
  languages_ids: string[]
}

export interface DeleteLanguageRequest {
  user_id: string
  language_id: string
}

// ============================================================================
// OrganisationType Request Types
// ============================================================================

export interface CreateOrganisationTypeRequest {
  org_type: string
  color: string
  title: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

// ============================================================================
// Image Types
// ============================================================================

// TODO(client): imageApi.fetchImage(id) is not implemented — the server has
// GET /api/images/fetch/{id} but there is no client service method for it.
export interface OrgImage {
  id: string
  organisationId: string
  fileName: string
  contentType: string
  fileSize: number
  width?: number
  height?: number
  isPrimary: boolean
  url: string
  createdAt: string
  updatedAt: string
}

export interface MultipleImagesResponse {
  items: OrgImage[]
  total: number
}

// ============================================================================
// Messaging Types (server API does not exist yet)
// TODO(server): Needs a full messaging feature — see docs/missing-api.md §Messages
// ============================================================================

export interface Conversation {
  id: string
  participantIds: string[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
  readAt?: string
}

// ============================================================================
// Saved / Bookmarks Types (server API does not exist yet)
// TODO(server): savedStore is client-only (localStorage). Needs server persistence
// — see docs/missing-api.md §Saved
// ============================================================================

export type SavedKind = 'organisation' | 'country' | 'person' | 'corridor'

export interface SavedItem {
  id: string
  userId: string
  kind: SavedKind
  targetId: string
  createdAt: string
}
