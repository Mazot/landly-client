import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { personApi } from '@/services/person.service'
import type { ClaimConfirmRequest, CreatePersonRequest, PeopleListQuery, Uuid, VouchPersonRequest } from '@/types/api'

export const usePeople = (query?: PeopleListQuery) =>
  useQuery({
    queryKey: queryKeys.people.list(query),
    queryFn: () => personApi.list(query),
  })

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.people.all }),
  })
}

export const useVouchPerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body?: VouchPersonRequest }) => personApi.vouch(id, body),
    onSuccess: (person) => queryClient.setQueryData(queryKeys.people.detail(person.id), person),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all })
    },
  })
}

export const useDeclineClaim = (token: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => personApi.declineClaim(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.people.claim(token) }),
  })
}
