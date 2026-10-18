import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { imageApi } from '@/services/image.service'
import type { PaginationParams, UploadImageInput, Uuid } from '@/types/api'

export const useOrganisationImages = (organisationId: Uuid | undefined, query?: PaginationParams) =>
  useQuery({
    queryKey: queryKeys.images.list(organisationId ?? '', query),
    queryFn: () => imageApi.list(organisationId!, query),
    enabled: !!organisationId,
  })

export const useImage = (id: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.images.detail(id ?? ''),
    queryFn: () => imageApi.fetch(id!),
    enabled: !!id,
  })

/**
 * Refreshes the organisation's lists and every cached image detail: setting a
 * primary flips `isPrimary` on the previous primary too.
 */
const useInvalidateImages = (organisationId: Uuid) => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.images.byOrganisation(organisationId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.images.details })
  }
}

export const useUploadImage = (organisationId: Uuid) => {
  const invalidate = useInvalidateImages(organisationId)
  return useMutation({
    mutationFn: (input: UploadImageInput) => imageApi.upload(organisationId, input),
    onSuccess: invalidate,
  })
}

export const useSetPrimaryImage = (organisationId: Uuid) => {
  const invalidate = useInvalidateImages(organisationId)
  return useMutation({
    mutationFn: (id: Uuid) => imageApi.setPrimary(id),
    onSuccess: invalidate,
  })
}

export const useDeleteImage = (organisationId: Uuid) => {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateImages(organisationId)
  return useMutation({
    mutationFn: (id: Uuid) => imageApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.images.detail(id) })
      invalidate()
    },
  })
}
