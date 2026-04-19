import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { referenceApi } from '@/services/reference.service'

const COUNTRIES_PAGE_SIZE = 20

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: () => referenceApi.getCountries(),
    staleTime: Infinity, // Reference data rarely changes
  })
}

export const useCountriesInfinite = (search: string) => {
  return useInfiniteQuery({
    queryKey: ['countries-infinite', search],
    queryFn: ({ pageParam = 0 }) =>
      referenceApi.getCountries({
        limit: COUNTRIES_PAGE_SIZE,
        offset: pageParam,
        name: search || undefined,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < COUNTRIES_PAGE_SIZE) return undefined
      return allPages.flat().length
    },
    initialPageParam: 0,
    staleTime: 30_000,
  })
}

export const useOrganizationTypes = () => {
  return useQuery({
    queryKey: ['organizationTypes'],
    queryFn: referenceApi.getOrganizationTypes,
    staleTime: Infinity,
  })
}
