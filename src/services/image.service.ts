import apiClient from '@/lib/axios'
import type {
  ListResponse,
  OrganisationImage,
  PaginationParams,
  UploadImageInput,
  Uuid,
} from '@/types/api'

export const imageApi = {
  /** Newest first (limit default 20, max 100; offset max 500). */
  list: async (organisationId: Uuid, query?: PaginationParams): Promise<ListResponse<OrganisationImage>> =>
    (await apiClient.get(`/api/images/list/${organisationId}`, { params: query })).data,

  fetch: async (id: Uuid): Promise<OrganisationImage> =>
    (await apiClient.get(`/api/images/fetch/${id}`)).data,

  /** Auth; jpeg/png/webp/gif up to 10 MB. */
  upload: async (organisationId: Uuid, { file, isPrimary = false }: UploadImageInput): Promise<OrganisationImage> => {
    const form = new FormData()
    form.append('file', file)
    form.append('is_primary', isPrimary ? 'true' : 'false')
    // Content-Type must be left to the browser so it adds the multipart boundary.
    const response = await apiClient.post(`/api/images/upload/${organisationId}`, form, {
      headers: { 'Content-Type': undefined },
    })
    return response.data
  },

  /** Auth; clears the flag on the organisation's other images. */
  setPrimary: async (id: Uuid): Promise<OrganisationImage> =>
    (await apiClient.put(`/api/images/set-primary/${id}`)).data,

  /** Auth; own upload, own organisation, or moderator/admin. */
  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/images/delete/${id}`)
  },
}
