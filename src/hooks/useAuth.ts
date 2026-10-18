import { useMutation } from '@tanstack/react-query'
import { endSession, startSession } from '@/lib/session'
import { userApi } from '@/services/user.service'
import type { OAuthExchangeRequest, SignInRequest, SignUpRequest } from '@/types/api'

export const useSignIn = () =>
  useMutation({
    mutationFn: (body: SignInRequest) => userApi.signIn(body),
    onSuccess: startSession,
  })

export const useSignUp = () =>
  useMutation({
    mutationFn: (body: SignUpRequest) => userApi.signUp(body),
    onSuccess: startSession,
  })

/** Trades the `code` of the Google callback redirect for a session. */
export const useGoogleExchange = () =>
  useMutation({
    mutationFn: (body: OAuthExchangeRequest) => userApi.exchangeGoogleCode(body),
    onSuccess: startSession,
  })

/** JWTs are stateless: signing out forgets the token and every cached query client-side. */
export const useSignOut = () => endSession
