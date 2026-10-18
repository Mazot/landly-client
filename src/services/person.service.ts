import apiClient from '@/lib/axios'
import type {
  ClaimConfirmRequest,
  ClaimPreview,
  CreatePersonRequest,
  ListResponse,
  PeopleListQuery,
  Person,
  PersonCreated,
  Uuid,
  VouchPersonRequest,
} from '@/types/api'

const claimPath = (token: string) => `/api/person/claim/${encodeURIComponent(token)}`

export const personApi = {
  /** Public (confirmed/claimed) people only. */
  list: async (query?: PeopleListQuery): Promise<ListResponse<Person>> =>
    (await apiClient.get('/api/person/list', { params: query })).data,

  fetch: async (id: Uuid): Promise<Person> => (await apiClient.get(`/api/person/fetch/${id}`)).data,

  /** Auth; recommends someone (status `pending`) and returns the claim link to send. */
  create: async (body: CreatePersonRequest): Promise<PersonCreated> =>
    (await apiClient.post('/api/person/create', body)).data,

  /** Auth. */
  vouch: async (id: Uuid, body: VouchPersonRequest = {}): Promise<Person> =>
    (await apiClient.post(`/api/person/vouch/${id}`, body)).data,

  /** Public — the token is the credential. */
  getClaim: async (token: string): Promise<ClaimPreview> => (await apiClient.get(claimPath(token))).data,

  /** Public; a valid Bearer token, when sent, links the person to that account (`claimed`). */
  confirmClaim: async (token: string, body: ClaimConfirmRequest = {}): Promise<ClaimPreview> =>
    (await apiClient.post(`${claimPath(token)}/confirm`, body)).data,

  /** Public. */
  declineClaim: async (token: string): Promise<void> => {
    await apiClient.post(`${claimPath(token)}/decline`)
  },
}
