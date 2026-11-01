import { apiErrorConstraint, apiErrorStatus } from '@/lib/errors'
import { SIGNUP_CONFLICT_CONSTRAINTS } from '@/types/api'

/** What a failed sign-in / sign-up request means for the user (i18n key under `auth.errors`). */
export type AuthFailure = 'invalidCredentials' | 'tooManyRequests' | 'network' | 'generic'

export function authFailure(error: unknown): AuthFailure {
  switch (apiErrorStatus(error)) {
    case 401:
      return 'invalidCredentials'
    case 429:
      return 'tooManyRequests'
    case undefined:
      return 'network'
    default:
      return 'generic'
  }
}

/** The signup field a 422 unique violation points at, if any. */
export function signupConflict(error: unknown): 'username' | 'email' | undefined {
  if (apiErrorStatus(error) !== 422) return undefined
  const constraint = apiErrorConstraint(error)
  if (!constraint) return undefined
  if ((SIGNUP_CONFLICT_CONSTRAINTS.username as readonly string[]).includes(constraint)) return 'username'
  if ((SIGNUP_CONFLICT_CONSTRAINTS.email as readonly string[]).includes(constraint)) return 'email'
  return undefined
}
