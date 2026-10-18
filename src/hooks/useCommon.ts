import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { commonApi } from '@/services/common.service'
import type { CountriesQuery, CreateOrganisationTypeRequest, Uuid } from '@/types/api'

const COUNTRIES_PAGE_SIZE = 20

/** Reference data rarely changes — cached for the whole session. */
export const useCountries = (query?: CountriesQuery) =>
  useQuery({
    queryKey: queryKeys.countries.list(query),
    queryFn: () => commonApi.getCountries(query),
    staleTime: Infinity,
  })

/** Paged country search for pickers (offset is capped at 150 by the server). */
export const useCountriesInfinite = (name: string) =>
  useInfiniteQuery({
    queryKey: queryKeys.countries.infinite(name),
    queryFn: ({ pageParam }) =>
      commonApi.getCountries({ limit: COUNTRIES_PAGE_SIZE, offset: pageParam, name: name || undefined }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < COUNTRIES_PAGE_SIZE ? undefined : allPages.length * COUNTRIES_PAGE_SIZE,
    staleTime: 30_000,
  })

export const useCountry = (id: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.countries.detail(id ?? ''),
    queryFn: () => commonApi.getCountry(id!),
    enabled: !!id,
  })

export const useOrganisationTypes = () =>
  useQuery({
    queryKey: queryKeys.organisationTypes,
    queryFn: commonApi.getOrganisationTypes,
    staleTime: Infinity,
  })

/** Admin only. */
export const useCreateOrganisationType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrganisationTypeRequest) => commonApi.createOrganisationType(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.organisationTypes }),
  })
}
