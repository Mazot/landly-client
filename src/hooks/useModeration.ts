import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidatePlaceSummaries } from '@/lib/invalidation'
import { queryKeys } from '@/lib/queryKeys'
import { moderationApi } from '@/services/moderation.service'
import type { ModerationDecisionRequest, ModerationQueueQuery } from '@/types/api'
import { useMe } from './useUser'

/** Enabled only for moderators/admins (the server answers 403 to everyone else). */
export const useModerationQueue = (query?: ModerationQueueQuery) => {
  const { data: me } = useMe()
  const canModerate = me?.role === 'moderator' || me?.role === 'admin'
  return useQuery({
    queryKey: queryKeys.moderation.queue(query),
    queryFn: () => moderationApi.queue(query),
    enabled: canModerate,
  })
}

/**
 * A decision changes the queue and makes the item (in)visible in lists; an
 * approved organisation also changes the country/corridor place counts.
 */
const useInvalidateAfterDecision = () => {
  const queryClient = useQueryClient()
  return (_: void, { kind }: ModerationDecisionRequest) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.moderation.all })
    if (kind === 'org') {
      queryClient.invalidateQueries({ queryKey: queryKeys.organisations.all })
      invalidatePlaceSummaries(queryClient)
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all })
    }
  }
}

export const useApprove = () => {
  const onSuccess = useInvalidateAfterDecision()
  return useMutation({
    mutationFn: (body: ModerationDecisionRequest) => moderationApi.approve(body),
    onSuccess,
  })
}

export const useRequestChanges = () => {
  const onSuccess = useInvalidateAfterDecision()
  return useMutation({
    mutationFn: (body: ModerationDecisionRequest & { note: string }) => moderationApi.requestChanges(body),
    onSuccess,
  })
}

export const useReject = () => {
  const onSuccess = useInvalidateAfterDecision()
  return useMutation({
    mutationFn: (body: ModerationDecisionRequest) => moderationApi.reject(body),
    onSuccess,
  })
}
