import apiClient from '@/lib/axios'
import type {
  ListResponse,
  ModerationDecisionRequest,
  ModerationQueueItem,
  ModerationQueueQuery,
} from '@/types/api'

/** Moderator/admin only. */
export const moderationApi = {
  queue: async (query?: ModerationQueueQuery): Promise<ListResponse<ModerationQueueItem>> =>
    (await apiClient.get('/api/moderation/queue', { params: query })).data,

  /** org → `live`, person → `awaiting`. */
  approve: async (body: ModerationDecisionRequest): Promise<void> => {
    await apiClient.post('/api/moderation/approve', body)
  },

  /** `note` is required; the item stays pending. */
  requestChanges: async (body: ModerationDecisionRequest & { note: string }): Promise<void> => {
    await apiClient.post('/api/moderation/request-changes', body)
  },

  reject: async (body: ModerationDecisionRequest): Promise<void> => {
    await apiClient.post('/api/moderation/reject', body)
  },
}
