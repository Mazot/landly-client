import axios from 'axios'
import type { ApiErrorBody } from '@/types/api'

/** HTTP status of a failed API call, if the server answered at all. */
export function apiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

/** Human-readable message from a landly-server error body (see `ApiErrorBody`). */
export function apiErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return undefined
  const body = error.response?.data
  if (typeof body === 'string') return body || undefined
  if (body && typeof body.error === 'string') return body.error
  return error.message
}

/** DB constraint name of a 422 caused by a unique/FK/CHECK violation. */
export function apiErrorConstraint(error: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return undefined
  const body = error.response?.data
  return body && typeof body === 'object' ? body.constraint : undefined
}
