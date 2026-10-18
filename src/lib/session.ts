import { useAuthStore } from '@/stores/authStore'
import type { AuthUser } from '@/types/api'
import { queryClient } from './queryClient'

/**
 * Drops everything cached for the previous account: a disabled query still
 * serves its cached data, so `me`, saved items, corridors or a moderator role
 * would otherwise outlive the session.
 */
function resetQueries() {
  void queryClient.cancelQueries()
  queryClient.clear()
}

/** Starts a session from a signin/signup/OAuth answer. */
export function startSession(authUser: AuthUser) {
  resetQueries()
  useAuthStore.getState().setAuth(authUser)
}

/** Ends the session — explicit sign-out and an expired/revoked JWT alike. */
export function endSession() {
  useAuthStore.getState().clearAuth()
  resetQueries()
}
