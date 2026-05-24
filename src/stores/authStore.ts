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

const storedUser = localStorage.getItem('auth_user')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  setAuth: (authResponse) => {
    const { id, username, email, token } = authResponse
    const user = { id, username, email }
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  clearAuth: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
