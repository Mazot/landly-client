import apiClient from '@/lib/axios'
import type {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
} from '@/types/api'

export const authApi = {
  // Sign in user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/user/signin', credentials)
    return response.data
  },

  // Sign up new user
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/user/signup', credentials)
    return response.data
  },
}
