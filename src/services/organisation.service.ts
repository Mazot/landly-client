import apiClient from '@/lib/axios'
import type {
  CheckinRequest,
  CreateOrganisationRequest,
  FindDuplicatesQuery,
  ListResponse,
  MyOrganisation,
  MyOrganisationsQuery,
  Organisation,
  OrganisationsListQuery,
  OrganisationVisits,
  SearchOrganisationsQuery,
  UpdateOrganisationRequest,
  Uuid,
} from '@/types/api'

export const organisationApi = {
  /** Live organisations, filtered by substrings / ids. */
  list: async (query?: OrganisationsListQuery): Promise<ListResponse<Organisation>> =>
    (await apiClient.get('/api/organisation/list', { params: query })).data,

  /** Auth; the caller's own places in every moderation status, with the moderator's note. */
  mine: async (query?: MyOrganisationsQuery): Promise<ListResponse<MyOrganisation>> =>
    (await apiClient.get('/api/organisation/mine', { params: query })).data,

  /** Map search by bbox or origin. */
  search: async (query: SearchOrganisationsQuery): Promise<ListResponse<Organisation>> =>
    (await apiClient.get('/api/organisation/search', { params: query })).data,

  /** Live places near a point with a like name — the add-a-place duplicate hint. */
  duplicates: async (query: FindDuplicatesQuery): Promise<ListResponse<Organisation>> =>
    (await apiClient.get('/api/organisation/duplicates', { params: query })).data,

  /** Detail payload, including `community` signals. */
  fetch: async (id: Uuid): Promise<Organisation> =>
    (await apiClient.get(`/api/organisation/fetch/${id}`)).data,

  /** Auth; created as `pending`. */
  create: async (body: CreateOrganisationRequest): Promise<Organisation> =>
    (await apiClient.post('/api/organisation/create', body)).data,

  /** Auth; creator or moderator/admin. */
  update: async (id: Uuid, body: UpdateOrganisationRequest): Promise<Organisation> =>
    (await apiClient.put(`/api/organisation/update/${id}`, body)).data,

  /** Auth; creator or moderator/admin. */
  remove: async (id: Uuid): Promise<void> => {
    await apiClient.delete(`/api/organisation/delete/${id}`)
  },

  /** Auth; answers the fresh detail payload. */
  /** Auth; one per user — a repeat updates the earlier check-in. */
  checkin: async (id: Uuid, body: CheckinRequest = {}): Promise<Organisation> =>
    (await apiClient.post(`/api/organisation/checkin/${id}`, body)).data,

  /** Public detail-page visit counter. */
  visit: async (id: Uuid): Promise<OrganisationVisits> =>
    (await apiClient.post(`/api/organisation/visit/${id}`)).data,
}
