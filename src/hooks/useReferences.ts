import { useQuery } from '@tanstack/react-query'
import { referenceApi } from '@/services/reference.service'

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => referenceApi.getCountries(),
    staleTime: Infinity, // Reference data rarely changes
  })
}

export const useOrganizationTypes = () => {
  return useQuery({
    queryKey: ['organizationTypes'],
    queryFn: referenceApi.getOrganizationTypes,
    staleTime: Infinity,
  })
}
