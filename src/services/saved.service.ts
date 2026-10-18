import apiClient from '@/lib/axios'
import type { CreateSavedRequest, ListResponse, SavedCounts, SavedItem, SavedListQuery, Uuid } from '@/types/api'

/** All routes need auth and act on the caller's own items. */
export const savedApi = {
  list: async (query?: SavedListQuery): Promise<ListResponse<SavedItem>> =>
    (await apiClient.get('/api/saved/list', { params: query })).data,

  counts: async (): Promise<SavedCounts> => (await apiClient.get('/api/saved/counts')).data,

  create: async (body: CreateSavedRequest): Promise<SavedItem> =>
    (await apiClient.post('/api/saved/create', body)).data,

  /** By saved-item id, not target id. */
  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/saved/delete/${id}`)
  },
}
