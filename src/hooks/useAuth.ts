import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services/auth.service'
import { useAuthStore } from '@/stores/authStore'
import type { LoginCredentials, SignupCredentials } from '@/types/api'

export const useLogin = () => {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token)
      setAuth(data)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useSignup = () => {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      authApi.signup(credentials),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token)
      setAuth(data)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return {
    mutate: () => {
      localStorage.removeItem('auth_token')
      clearAuth()
      queryClient.clear()
    },
  }
}
