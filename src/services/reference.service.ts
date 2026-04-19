import apiClient from '@/lib/axios'
import type {
  Country,
  OrganizationType,
  CreateOrganisationTypeRequest,
} from '@/types/api'

export const referenceApi = {
  // Get countries with optional pagination and search
  getCountries: async (params?: {
    limit?: number
    offset?: number
    name?: string
  }): Promise<Country[]> => {
    const response = await apiClient.get('/api/common/countries', { params })
    return response.data
  },

  // Get organization types
  getOrganizationTypes: async (): Promise<OrganizationType[]> => {
    const response = await apiClient.get('/api/common/org_types')
    return response.data
  },

  // Create organization type
  createOrganizationType: async (
    data: CreateOrganisationTypeRequest
  ): Promise<OrganizationType> => {
    const response = await apiClient.post('/api/common/org_types', data)
    return response.data
  },
}
