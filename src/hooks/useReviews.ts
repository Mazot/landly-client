import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { reviewApi } from '@/services/review.service'
import type { CreateReviewRequest, ReviewsListQuery, Uuid } from '@/types/api'

export const useReviews = (query: ReviewsListQuery | undefined) =>
  useQuery({
    queryKey: queryKeys.reviews.list(query!),
    queryFn: () => reviewApi.list(query!),
    enabled: !!query,
  })

/** A review changes its target's `ratingAvg` / `reviewsCount`. */
const useInvalidateReviews = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.organisations.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.people.all })
  }
}

export const useCreateReview = () => {
  const invalidate = useInvalidateReviews()
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => reviewApi.create(body),
    onSuccess: invalidate,
  })
}

export const useDeleteReview = () => {
  const invalidate = useInvalidateReviews()
  return useMutation({
    mutationFn: (id: Uuid) => reviewApi.remove(id),
    onSuccess: invalidate,
  })
}
