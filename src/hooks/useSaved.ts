import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { savedApi } from '@/services/saved.service'
import { useAuthStore } from '@/stores/authStore'
import type { CreateSavedRequest, SavedListQuery, Uuid } from '@/types/api'

export const useSavedItems = (query?: SavedListQuery) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.saved.list(query),
    queryFn: () => savedApi.list(query),
    enabled: isAuthenticated,
  })
}

export const useSavedCounts = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.saved.counts,
    queryFn: savedApi.counts,
    enabled: isAuthenticated,
  })
}

const useInvalidateSaved = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.saved.all })
}

export const useSaveItem = () => {
  const invalidate = useInvalidateSaved()
  return useMutation({
    mutationFn: (body: CreateSavedRequest) => savedApi.create(body),
    onSuccess: invalidate,
  })
}

/** Takes the saved-item id (`SavedItem.id`), not the target id. */
export const useDeleteSavedItem = () => {
  const invalidate = useInvalidateSaved()
  return useMutation({
    mutationFn: (id: Uuid) => savedApi.remove(id),
    onSuccess: invalidate,
  })
}
