import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { nextOffset } from '@/lib/query'
import { queryKeys } from '@/lib/queryKeys'
import { personApi } from '@/services/person.service'
import { useAuthStore } from '@/stores/authStore'
import { MINE_DEFAULT_LIMIT, type ClaimConfirmRequest, type ClaimPreview, type CreatePersonRequest, type PeopleListQuery, type Uuid, type VouchPersonRequest } from '@/types/api'

export const usePeople = (query?: PeopleListQuery) =>
  useQuery({
    queryKey: queryKeys.people.list(query),
    queryFn: () => personApi.list(query),
  })

/** Default page of the people list; the server answers at most 100. */
export const PEOPLE_PAGE_SIZE = 20

/** The public people list, `pageSize` at a time ("Show more"); a new filter starts again from the first page. `enabled` waits for what the query depends on (the corridor's country). */
export const useInfinitePeople = (query: PeopleListQuery = {}, pageSize = PEOPLE_PAGE_SIZE, enabled = true) =>
  useInfiniteQuery({
    queryKey: queryKeys.people.list({ ...query, limit: pageSize }),
    queryFn: ({ pageParam }) => personApi.list({ ...query, limit: pageSize, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: nextOffset(pageSize),
    select: (data) => data.pages.flatMap((page) => page.items),
    placeholderData: keepPreviousData,
    enabled,
  })

/** The skills a helper can be recommended for (reference data: the filter and the recommend form). */
export const usePersonSkills = () =>
  useQuery({
    queryKey: queryKeys.people.skills,
    queryFn: personApi.skills,
    staleTime: Infinity,
    select: (data) => data.items,
  })

/** The people the caller recommended, in every status, `pageSize` at a time; never served stale (see `useMyOrganisations`). */
export const useMyPeople = (pageSize = MINE_DEFAULT_LIMIT) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useInfiniteQuery({
    queryKey: queryKeys.people.mine({ limit: pageSize }),
    queryFn: ({ pageParam }) => personApi.mine({ limit: pageSize, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: nextOffset(pageSize),
    select: (data) => data.pages.flatMap((page) => page.items),
    enabled: isAuthenticated,
    staleTime: 0,
  })
}

export const usePerson = (id: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.people.detail(id ?? ''),
    queryFn: () => personApi.fetch(id!),
    enabled: !!id,
  })

/** Recommend someone; the answer carries the `claimUrl` to send them. */
export const useCreatePerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePersonRequest) => personApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all })
      // The profile counts recommendations (`stats.peopleRecommended`).
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export const useVouchPerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body?: VouchPersonRequest }) => personApi.vouch(id, body),
    // Lists carry `vouches` too.
    onSuccess: (person) => {
      queryClient.setQueryData(queryKeys.people.detail(person.id), person)
      queryClient.invalidateQueries({ queryKey: queryKeys.people.lists })
    },
  })
}

/** Claim preview for the holder of the invite token. */
export const useClaim = (token: string | undefined) =>
  useQuery({
    queryKey: queryKeys.people.claim(token ?? ''),
    queryFn: () => personApi.getClaim(token!),
    enabled: !!token,
    retry: false,
  })

export const useConfirmClaim = (token: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body?: ClaimConfirmRequest) => personApi.confirmClaim(token, body),
    onSuccess: (preview) => {
      queryClient.setQueryData(queryKeys.people.claim(token), preview)
      // Not the claim itself: the token is spent, asking for it again would only answer 422.
      queryClient.invalidateQueries({ queryKey: queryKeys.people.lists })
      queryClient.invalidateQueries({ queryKey: queryKeys.people.detail(preview.id) })
      queryClient.invalidateQueries({ queryKey: ['people', 'mine'] })
    },
  })
}

export const useDeclineClaim = (token: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => personApi.declineClaim(token),
    onSuccess: () => {
      // The token is spent: mark the preview declined instead of removing it — the page still watches
      // that query, so a removed one would be fetched again at once (a 422 for the spent token).
      queryClient.setQueryData<ClaimPreview>(queryKeys.people.claim(token), (preview) => preview && { ...preview, status: 'declined' })
      queryClient.invalidateQueries({ queryKey: ['people', 'mine'] })
    },
  })
}
