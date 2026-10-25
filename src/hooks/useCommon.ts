import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { commonApi } from '@/services/common.service'
import type { CountriesQuery, CreateOrganisationTypeRequest, LanguagesQuery, Uuid } from '@/types/api'

// The server clamps `offset` to 150 and `limit` to 250. Pages of 50 land
// exactly on offset 150, and that last reachable page asks for the max limit,
// so up to 400 rows are paged without overlap or a never-ending last page.
const COUNTRIES_PAGE_SIZE = 50
const COUNTRIES_MAX_OFFSET = 150
const COUNTRIES_MAX_LIMIT = 250

const LANGUAGES_MAX_LIMIT = 500

const countriesPageLimit = (offset: number) =>
  offset >= COUNTRIES_MAX_OFFSET ? COUNTRIES_MAX_LIMIT : COUNTRIES_PAGE_SIZE

/** Reference data rarely changes — cached for the whole session. */
export const useCountries = (query?: CountriesQuery) =>
  useQuery({
    queryKey: queryKeys.countries.list(query),
    queryFn: () => commonApi.getCountries(query),
    staleTime: Infinity,
  })

/**
 * Every country in one list, sorted by name — for plain `<select>` pickers
 * (landing, sign-up corridor). Two requests at most: the first page stops at the
 * server's offset cap (150), the second asks for the max limit from there.
 */
export const useAllCountries = () =>
  useQuery({
    queryKey: queryKeys.countries.everything,
    queryFn: async () => {
      const first = await commonApi.getCountries({ limit: COUNTRIES_MAX_OFFSET, offset: 0 })
      if (first.length < COUNTRIES_MAX_OFFSET) return first
      return [...first, ...(await commonApi.getCountries({ limit: COUNTRIES_MAX_LIMIT, offset: COUNTRIES_MAX_OFFSET }))]
    },
    select: (countries) => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    staleTime: Infinity,
  })

/** Paged country search for pickers; `pageParam` is the offset. */
export const useCountriesInfinite = (name: string) =>
  useInfiniteQuery({
    queryKey: queryKeys.countries.infinite(name),
    queryFn: ({ pageParam }) =>
      commonApi.getCountries({ limit: countriesPageLimit(pageParam), offset: pageParam, name: name || undefined }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastOffset) => {
      if (lastOffset >= COUNTRIES_MAX_OFFSET || lastPage.length < countriesPageLimit(lastOffset)) return undefined
      return Math.min(lastOffset + COUNTRIES_PAGE_SIZE, COUNTRIES_MAX_OFFSET)
    },
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

/**
 * Language reference list (no API writes) — resolves the ids in
 * `Person.languageIds` / `UserLanguages.languageIds`. Without a query it asks
 * for the server's max page (500), which covers the whole table.
 */
export const useLanguages = (query: LanguagesQuery = { limit: LANGUAGES_MAX_LIMIT }) =>
  useQuery({
    queryKey: queryKeys.languages(query),
    queryFn: () => commonApi.getLanguages(query),
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
