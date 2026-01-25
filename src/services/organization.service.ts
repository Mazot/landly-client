import apiClient from '@/lib/axios'
import type {
  Organization,
  PaginatedResponse,
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
} from '@/types/api'

export interface OrganizationFilters {
  name?: string
  tel?: string
  email?: string
  address?: string
  location_country_id?: string
  organisation_type_id?: string
  founder_country_id?: string
  limit?: number
  offset?: number
}

export const organizationApi = {
  // Get all organizations with filters
  getOrganizations: async (
    filters?: OrganizationFilters
  ): Promise<PaginatedResponse<Organization>> => {
    const response = await apiClient.get('/api/organisation/list', {
      params: filters,
    })
    return response.data
  },

  // Get organization by ID
  getOrganization: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`/api/organisation/fetch/${id}`)
    return response.data
  },

  // Create organization
  createOrganization: async (
    data: CreateOrganisationRequest
  ): Promise<Organization> => {
    const response = await apiClient.post('/api/organisation/create', data)
    return response.data
  },

  // Update organization
  updateOrganization: async (
    id: string,
    data: UpdateOrganisationRequest
  ): Promise<Organization> => {
    const response = await apiClient.put(`/api/organisation/update/${id}`, data)
    return response.data
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/organisation/delete/${id}`)
  },
}
