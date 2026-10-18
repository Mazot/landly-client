import apiClient, { API_URL } from '@/lib/axios'
import type {
  AddLanguagesRequest,
  AuthUser,
  DeleteLanguageRequest,
  OAuthExchangeRequest,
  SignInRequest,
  SignUpRequest,
  UpdateNotificationSettingsRequest,
  UpdateProfileRequest,
  UserLanguages,
  UserProfile,
  Uuid,
} from '@/types/api'

/**
 * Google sign-in is a top-level navigation, not an XHR: the server sets an
 * HttpOnly state cookie, sends the browser to Google, and finally redirects to
 * `{FRONTEND_ORIGIN}/auth/google/callback?code=…`. That page trades the code
 * via `userApi.exchangeGoogleCode`.
 */
export const GOOGLE_LOGIN_URL = `${API_URL}/api/user/oauth/google/login`

/** Client route the server redirects to after Google sign-in. */
export const GOOGLE_CALLBACK_PATH = '/auth/google/callback'

export const userApi = {
  signIn: async (body: SignInRequest): Promise<AuthUser> =>
    (await apiClient.post('/api/user/signin', body)).data,

  signUp: async (body: SignUpRequest): Promise<AuthUser> =>
    (await apiClient.post('/api/user/signup', body)).data,

  /** Single-use code from the Google callback redirect (valid 60 s). */
  exchangeGoogleCode: async (body: OAuthExchangeRequest): Promise<AuthUser> =>
    (await apiClient.post('/api/user/oauth/google/exchange', body)).data,

  getMe: async (): Promise<UserProfile> => (await apiClient.get('/api/user/me')).data,

  updateMe: async (body: UpdateProfileRequest): Promise<UserProfile> =>
    (await apiClient.put('/api/user/me', body)).data,

  updateNotifications: async (body: UpdateNotificationSettingsRequest): Promise<UserProfile> =>
    (await apiClient.put('/api/user/me/notifications', body)).data,

  getLanguages: async (userId: Uuid): Promise<UserLanguages> =>
    (await apiClient.get(`/api/user/${userId}/languages`)).data,

  addLanguages: async (body: AddLanguagesRequest): Promise<UserLanguages> =>
    (await apiClient.post('/api/user/languages', body)).data,

  deleteLanguage: async (body: DeleteLanguageRequest): Promise<void> => {
    await apiClient.delete('/api/user/languages', { data: body })
  },
}
