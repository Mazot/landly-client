import apiClient from '@/lib/axios'
import type {
  CountryConnection,
  PaginatedResponse,
  CreateCountryConnectionRequest,
  UpdateCountryConnectionRequest,
} from '@/types/api'

export interface CountryConnectionFilters {
  embassy_org_id?: string
  consulate_org_id?: string
  location_country_id?: string
  limit?: number
  offset?: number
}

export const countryConnectionApi = {
  // Get all country connections with filters
  getCountryConnections: async (
    filters?: CountryConnectionFilters
  ): Promise<PaginatedResponse<CountryConnection>> => {
    const response = await apiClient.get('/api/country-connection/list', {
      params: filters,
    })
    return response.data
  },

  // Get country connection by ID
  getCountryConnection: async (id: string): Promise<CountryConnection> => {
    const response = await apiClient.get(`/api/country-connection/fetch/${id}`)
    return response.data
  },

  // Create country connection
  createCountryConnection: async (
    data: CreateCountryConnectionRequest
  ): Promise<CountryConnection> => {
    const response = await apiClient.post(
      '/api/country-connection/create',
      data
    )
    return response.data
  },

  // Update country connection
  updateCountryConnection: async (
    id: string,
    data: UpdateCountryConnectionRequest
  ): Promise<CountryConnection> => {
    const response = await apiClient.put(
      `/api/country-connection/update/${id}`,
      data
    )
    return response.data
  },

  // Delete country connection
  deleteCountryConnection: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/country-connection/delete/${id}`)
  },
}
