import apiClient from '@/lib/axios'
import type { CreateReviewRequest, ListResponse, Review, ReviewsListQuery, ReviewSummary, ReviewSummaryQuery, Uuid } from '@/types/api'

export const reviewApi = {
  /** Newest first; give exactly one target. */
  list: async (query: ReviewsListQuery): Promise<ListResponse<Review>> =>
    (await apiClient.get('/api/review/list', { params: query })).data,

  /** Count, average and the per-rating breakdown; give exactly one target. */
  summary: async (query: ReviewSummaryQuery): Promise<ReviewSummary> =>
    (await apiClient.get('/api/review/summary', { params: query })).data,

  /** Auth; refreshes the target's `ratingAvg` / `reviewsCount`. 403 for your own submission or a person you recommended / are. */
  create: async (body: CreateReviewRequest): Promise<Review> =>
    (await apiClient.post('/api/review/create', body)).data,

  /** Auth; own review or moderator/admin. */
  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/review/delete/${id}`)
  },
}
