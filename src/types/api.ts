// API Types based on OpenAPI Specification

// ============================================================================
// Entity Types
// ============================================================================

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
  type: string // org_type from OpenAPI
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

export interface OrgImage {
  id: string
  organisationId: string
  fileName: string
  contentType: string
  fileSize: number
  width?: number
  height?: number
  isPrimary?: boolean
  url: string
  createdAt: string
  updatedAt: string
}

export interface MultipleImagesResponse {
  items: OrgImage[]
  total: number
}
