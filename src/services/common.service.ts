import apiClient from '@/lib/axios'
import type {
  CountriesQuery,
  Country,
  CountryDetail,
  CreateOrganisationTypeRequest,
  Language,
  LanguagesQuery,
  OrganisationType,
  TimeZoneAnswer,
  TimeZoneQuery,
  Uuid,
} from '@/types/api'

export const commonApi = {
  /** Plain array (no list envelope). */
  getCountries: async (query?: CountriesQuery): Promise<Country[]> =>
    (await apiClient.get('/api/common/countries', { params: query })).data,

  getCountry: async (id: Uuid): Promise<CountryDetail> =>
    (await apiClient.get(`/api/common/countries/${id}`)).data,

  /** Plain array (no list envelope), ordered by name. */
  getLanguages: async (query?: LanguagesQuery): Promise<Language[]> =>
    (await apiClient.get('/api/common/languages', { params: query })).data,

  /** The time zone of a point (the add-a-place form's hours). */
  getTimeZone: async (query: TimeZoneQuery): Promise<TimeZoneAnswer> =>
    (await apiClient.get('/api/common/timezone', { params: query })).data,

  /** Plain array (no list envelope). */
  getOrganisationTypes: async (): Promise<OrganisationType[]> =>
    (await apiClient.get('/api/common/org_types')).data,

  /** Admin only. */
  createOrganisationType: async (body: CreateOrganisationTypeRequest): Promise<OrganisationType> =>
    (await apiClient.post('/api/common/org_types', body)).data,
}
