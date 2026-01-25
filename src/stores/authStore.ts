import { create } from 'zustand'
import type { AuthResponse } from '@/types/api'

interface AuthState {
  user: {
    id: string
    username: string
    email: string
  } | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (authResponse: AuthResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  setAuth: (authResponse) => {
    const { id, username, email, token } = authResponse
    set({
      user: { id, username, email },
      token,
      isAuthenticated: true,
    })
  },
  clearAuth: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),
}))
