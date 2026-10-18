import apiClient from '@/lib/axios'
import type {
  CountryConnection,
  CountryConnectionsQuery,
  CreateCountryConnectionRequest,
  ListResponse,
  UpdateCountryConnectionRequest,
  Uuid,
} from '@/types/api'

/** Reads are public; writes are admin only. */
export const countryConnectionApi = {
  list: async (query?: CountryConnectionsQuery): Promise<ListResponse<CountryConnection>> =>
    (await apiClient.get('/api/country-connection/list', { params: query })).data,

  fetch: async (id: Uuid): Promise<CountryConnection> =>
    (await apiClient.get(`/api/country-connection/fetch/${id}`)).data,

  create: async (body: CreateCountryConnectionRequest): Promise<CountryConnection> =>
    (await apiClient.post('/api/country-connection/create', body)).data,

  update: async (id: Uuid, body: UpdateCountryConnectionRequest): Promise<CountryConnection> =>
    (await apiClient.put(`/api/country-connection/update/${id}`, body)).data,

  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/country-connection/delete/${id}`)
  },
}
