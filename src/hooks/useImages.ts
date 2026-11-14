import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
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
const invalidateImages = (queryClient: QueryClient, organisationId: Uuid) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.images.byOrganisation(organisationId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.images.details })
}

const useInvalidateImages = (organisationId: Uuid) => {
  const queryClient = useQueryClient()
  return () => invalidateImages(queryClient, organisationId)
}

export const useUploadImage = (organisationId: Uuid) => {
  const invalidate = useInvalidateImages(organisationId)
  return useMutation({
    mutationFn: (input: UploadImageInput) => imageApi.upload(organisationId, input),
    onSuccess: invalidate,
  })
}

/** Progress of `useUploadImages`: the file being sent and how many went before it. */
export interface UploadProgress {
  name: string
  done: number
  total: number
}

/**
 * Sends several photos one after another (`POST /images/upload`). The first that arrives is the cover
 * unless the place already has one; a refused file is counted, not fatal. Answers how many made it.
 */
export const useUploadImages = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ organisationId, files, hasPrimary = false, onProgress }: { organisationId: Uuid; files: File[]; hasPrimary?: boolean; onProgress?: (progress: UploadProgress) => void }) => {
      let covered = hasPrimary
      let uploaded = 0
      let failed = 0
      for (const [index, file] of files.entries()) {
        onProgress?.({ name: file.name, done: index, total: files.length })
        try {
          await imageApi.upload(organisationId, { file, isPrimary: !covered })
          covered = true
          uploaded += 1
        } catch {
          failed += 1
        }
      }
      return { uploaded, failed }
    },
    onSettled: (_result, _error, { organisationId }) => invalidateImages(queryClient, organisationId),
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
