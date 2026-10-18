import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { corridorApi } from '@/services/corridor.service'
import { useAuthStore } from '@/stores/authStore'
import type { CreateCorridorRequest, Uuid } from '@/types/api'

/** The caller's corridors (server-side); guests use `corridorStore` instead. */
export const useCorridors = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.corridors.list,
    queryFn: corridorApi.list,
    enabled: isAuthenticated,
  })
}

/** Needs a session: stats exist only for the caller's own corridors. */
export const useCorridorStats = (id: Uuid | undefined) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.corridors.stats(id ?? ''),
    queryFn: () => corridorApi.stats(id!),
    enabled: isAuthenticated && !!id,
  })
}

const useInvalidateCorridors = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.corridors.all })
}

export const useCreateCorridor = () => {
  const invalidate = useInvalidateCorridors()
  return useMutation({
    mutationFn: (body: CreateCorridorRequest) => corridorApi.create(body),
    onSuccess: invalidate,
  })
}

export const useSetDefaultCorridor = () => {
  const invalidate = useInvalidateCorridors()
  return useMutation({
    mutationFn: (id: Uuid) => corridorApi.setDefault(id),
    onSuccess: invalidate,
  })
}

export const useDeleteCorridor = () => {
  const invalidate = useInvalidateCorridors()
  return useMutation({
    mutationFn: (id: Uuid) => corridorApi.remove(id),
    onSuccess: invalidate,
  })
}
