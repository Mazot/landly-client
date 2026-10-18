import { create } from 'zustand'
import type { AuthUser } from '@/types/api'

/** The signed-in account as returned by signin/signup/exchange, without the JWT. */
export type SessionUser = Omit<AuthUser, 'token'>

interface AuthState {
  user: SessionUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (authUser: AuthUser) => void
  clearAuth: () => void
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function readStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

const storedToken = localStorage.getItem(TOKEN_KEY)

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: storedToken,
  isAuthenticated: !!storedToken,
  setAuth: ({ token, ...user }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
