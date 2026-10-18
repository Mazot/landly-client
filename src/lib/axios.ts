import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toQueryString } from './query'

/**
 * Backend origin without a trailing slash and without `/api`
 * (e.g. `http://localhost:8080`). Empty means same origin — in dev the Vite
 * proxy forwards `/api/*` to `VITE_API_URL`.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Arrays go out comma-separated and empty values are dropped — the format
  // every landly-server list/search endpoint expects.
  paramsSerializer: { serialize: (params) => toQueryString(params) },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on a request that carried our token means the JWT expired or was
    // revoked. A 401 without one (e.g. a wrong password on signin) is left to
    // the caller.
    if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.headers?.Authorization) {
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  },
)

export default apiClient
