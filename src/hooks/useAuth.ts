import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'
import type { AuthUser, OAuthExchangeRequest, SignInRequest, SignUpRequest } from '@/types/api'

/** Stores the session and drops every cached query of the previous one. */
function useStartSession() {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  return (authUser: AuthUser) => {
    queryClient.clear()
    setAuth(authUser)
  }
}

export const useSignIn = () => {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: (body: SignInRequest) => userApi.signIn(body),
    onSuccess: startSession,
  })
}

export const useSignUp = () => {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: (body: SignUpRequest) => userApi.signUp(body),
    onSuccess: startSession,
  })
}

/** Trades the `code` of the Google callback redirect for a session. */
export const useGoogleExchange = () => {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: (body: OAuthExchangeRequest) => userApi.exchangeGoogleCode(body),
    onSuccess: startSession,
  })
}

/** JWTs are stateless: signing out only forgets the token client-side. */
export const useSignOut = () => {
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  return () => {
    clearAuth()
    queryClient.clear()
  }
}
