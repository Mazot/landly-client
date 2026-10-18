import apiClient from '@/lib/axios'
import type { CreateReviewRequest, ListResponse, Review, ReviewsListQuery, Uuid } from '@/types/api'

export const reviewApi = {
  /** Newest first; give exactly one target. */
  list: async (query: ReviewsListQuery): Promise<ListResponse<Review>> =>
    (await apiClient.get('/api/review/list', { params: query })).data,

  /** Auth; refreshes the target's `ratingAvg` / `reviewsCount`. */
  create: async (body: CreateReviewRequest): Promise<Review> =>
    (await apiClient.post('/api/review/create', body)).data,

  /** Auth; own review or moderator/admin. */
  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/review/delete/${id}`)
  },
}
