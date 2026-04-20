import apiClient from '@/lib/axios'
import type { OrgImage, MultipleImagesResponse } from '@/types/api'

export const imageApi = {
  listImages: async (organisationId: string): Promise<MultipleImagesResponse> => {
    const response = await apiClient.get(`/api/images/list/${organisationId}`)
    return response.data
  },

  uploadImage: async (
    organisationId: string,
    file: File,
    isPrimary = false
  ): Promise<OrgImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('is_primary', isPrimary ? 'true' : 'false')
    const response = await apiClient.post(
      `/api/images/upload/${organisationId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  deleteImage: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/images/delete/${id}`)
  },

  setPrimaryImage: async (id: string): Promise<OrgImage> => {
    const response = await apiClient.put(`/api/images/set-primary/${id}`)
    return response.data
  },
}
