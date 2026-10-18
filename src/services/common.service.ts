import apiClient from '@/lib/axios'
import type {
  CountriesQuery,
  Country,
  CountryDetail,
  CreateOrganisationTypeRequest,
  OrganisationType,
  Uuid,
} from '@/types/api'

export const commonApi = {
  /** Plain array (no list envelope). */
  getCountries: async (query?: CountriesQuery): Promise<Country[]> =>
    (await apiClient.get('/api/common/countries', { params: query })).data,

  getCountry: async (id: Uuid): Promise<CountryDetail> =>
    (await apiClient.get(`/api/common/countries/${id}`)).data,

  /** Plain array (no list envelope). */
  getOrganisationTypes: async (): Promise<OrganisationType[]> =>
    (await apiClient.get('/api/common/org_types')).data,

  /** Admin only. */
  createOrganisationType: async (body: CreateOrganisationTypeRequest): Promise<OrganisationType> =>
    (await apiClient.post('/api/common/org_types', body)).data,
}
