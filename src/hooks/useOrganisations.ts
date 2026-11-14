import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidatePlaceSummaries } from '@/lib/invalidation'
import { nextOffset } from '@/lib/query'
import { queryKeys } from '@/lib/queryKeys'
import { organisationApi } from '@/services/organisation.service'
import { useAuthStore } from '@/stores/authStore'
import type {
  CheckinRequest,
  CreateOrganisationRequest,
  FindDuplicatesQuery,
  Organisation,
  OrganisationsListQuery,
  SearchOrganisationsQuery,
  UpdateOrganisationRequest,
  Uuid,
} from '@/types/api'
import { MINE_DEFAULT_LIMIT } from '@/types/api'

export const useOrganisations = (query?: OrganisationsListQuery) =>
  useQuery({
    queryKey: queryKeys.organisations.list(query),
    queryFn: () => organisationApi.list(query),
  })

/**
 * Map search. Pass `undefined` until the map knows its bounds; the previous
 * result stays on screen while the next viewport loads.
 */
export const useSearchOrganisations = (query: SearchOrganisationsQuery | undefined) =>
  useQuery({
    queryKey: queryKeys.organisations.search(query ?? {}),
    queryFn: () => organisationApi.search(query!),
    enabled: !!query,
    placeholderData: keepPreviousData,
  })

/**
 * Live places like the one being added (same spot, like name). Pass `undefined` until there
 * are a name and a point; the answer for the previous name stays while the next loads.
 */
export const useDuplicates = (query: FindDuplicatesQuery | undefined) =>
  useQuery({
    queryKey: queryKeys.organisations.duplicates(query ?? { name: '', lat: 0, lng: 0 }),
    queryFn: () => organisationApi.duplicates(query!),
    enabled: !!query,
    placeholderData: keepPreviousData,
    select: (answer) => answer.items,
  })

/**
 * The caller's own places in every moderation status, `pageSize` at a time (`fetchNextPage` for
 * more); disabled while signed out. Never served stale: the server does not cache it either, so
 * the owner sees a moderator's decision as soon as the screen is opened again.
 */
export const useMyOrganisations = (pageSize = MINE_DEFAULT_LIMIT) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useInfiniteQuery({
    queryKey: queryKeys.organisations.mine({ limit: pageSize }),
    queryFn: ({ pageParam }) => organisationApi.mine({ limit: pageSize, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: nextOffset(pageSize),
    select: (data) => data.pages.flatMap((page) => page.items),
    enabled: isAuthenticated,
    staleTime: 0,
  })
}

export const useOrganisation = (id: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.organisations.detail(id ?? ''),
    queryFn: () => organisationApi.fetch(id!),
    enabled: !!id,
  })

/**
 * Lists, search results, the creator's stats and the country/corridor place
 * counts change with any write (delete, country change, live → pending).
 */
const useInvalidateOrganisations = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.organisations.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.me })
    invalidatePlaceSummaries(queryClient)
  }
}

export const useCreateOrganisation = () => {
  const invalidate = useInvalidateOrganisations()
  return useMutation({
    mutationFn: (body: CreateOrganisationRequest) => organisationApi.create(body),
    onSuccess: invalidate,
  })
}

export const useUpdateOrganisation = () => {
  const invalidate = useInvalidateOrganisations()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body: UpdateOrganisationRequest }) => organisationApi.update(id, body),
    onSuccess: invalidate,
  })
}

export const useDeleteOrganisation = () => {
  const invalidate = useInvalidateOrganisations()
  return useMutation({
    mutationFn: (id: Uuid) => organisationApi.remove(id),
    onSuccess: invalidate,
  })
}

/** Answers the fresh detail payload, which replaces the cached one. */
export const useCheckin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body?: CheckinRequest }) => organisationApi.checkin(id, body),
    onSuccess: (organisation) =>
      queryClient.setQueryData(queryKeys.organisations.detail(organisation.id), organisation),
  })
}

/** Call once per detail-page view. */
/**
 * Counts one visit of a place's page while it is open (`POST /organisation/visit/{id}`) and puts the
 * new count on the cached detail. A query rather than an effect: mounts at the same time (StrictMode)
 * share one request, and `gcTime: 0` forgets it on leaving, so the next opening counts again.
 */
export const useCountVisit = (id: Uuid | undefined) => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.organisations.visit(id ?? ''),
    queryFn: async () => {
      const { visitsCount } = await organisationApi.visit(id!)
      queryClient.setQueryData<Organisation>(queryKeys.organisations.detail(id!), (cached) => (cached ? { ...cached, visitsCount } : cached))
      return visitsCount
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  })
}

export const useRecordVisit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Uuid) => organisationApi.visit(id),
    onSuccess: ({ visitsCount }, id) =>
      queryClient.setQueryData<Organisation>(queryKeys.organisations.detail(id), (cached) =>
        cached ? { ...cached, visitsCount } : cached,
      ),
  })
}
