import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationApi, type OrganizationFilters } from '@/services/organization.service'
import type { Organization } from '@/types/api'

export const useOrganizations = (filters?: OrganizationFilters) => {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: () => organizationApi.getOrganizations(filters),
    enabled: !!filters,
  })
}

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationApi.getOrganization(id),
    enabled: !!id,
  })
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) =>
      organizationApi.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Organization> }) =>
      organizationApi.updateOrganization(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] })
    },
  })
}

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}
