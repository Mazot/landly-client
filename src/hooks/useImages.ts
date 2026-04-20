import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { imageApi } from '@/services/image.service'

export const useOrgImages = (organisationId: string) => {
  return useQuery({
    queryKey: ['images', organisationId],
    queryFn: () => imageApi.listImages(organisationId),
    enabled: !!organisationId,
  })
}

export const useUploadImage = (organisationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, isPrimary }: { file: File; isPrimary?: boolean }) =>
      imageApi.uploadImage(organisationId, file, isPrimary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', organisationId] })
    },
  })
}

export const useDeleteImage = (organisationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => imageApi.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', organisationId] })
    },
  })
}
