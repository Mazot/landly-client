import apiClient from '@/lib/axios'

export const healthcheckApi = {
  /** Answers the JSON string `"Healthcheck"`. */
  check: async (): Promise<string> => (await apiClient.get('/api/healthcheck')).data,
}
