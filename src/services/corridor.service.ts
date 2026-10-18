import apiClient from '@/lib/axios'
import type { Corridor, CorridorStats, CreateCorridorRequest, ListResponse, Uuid } from '@/types/api'

/** All routes need auth and act on the caller's own corridors. */
export const corridorApi = {
  /** Default first, then oldest first. */
  list: async (): Promise<ListResponse<Corridor>> => (await apiClient.get('/api/corridor/list')).data,

  create: async (body: CreateCorridorRequest): Promise<Corridor> =>
    (await apiClient.post('/api/corridor/create', body)).data,

  setDefault: async (id: Uuid): Promise<Corridor> =>
    (await apiClient.put(`/api/corridor/set-default/${id}`)).data,

  stats: async (id: Uuid): Promise<CorridorStats> => (await apiClient.get(`/api/corridor/stats/${id}`)).data,

  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/corridor/delete/${id}`)
  },
}
