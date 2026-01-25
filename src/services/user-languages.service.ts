import apiClient from '@/lib/axios'
import type {
  UserLanguages,
  AddLanguagesRequest,
  DeleteLanguageRequest,
} from '@/types/api'

export const userLanguagesApi = {
  // Get user languages
  getUserLanguages: async (userId: string): Promise<UserLanguages> => {
    const response = await apiClient.get(`/api/user/${userId}/languages`)
    return response.data
  },

  // Add languages to user
  addLanguages: async (data: AddLanguagesRequest): Promise<UserLanguages> => {
    const response = await apiClient.post('/api/user/languages', data)
    return response.data
  },

  // Delete language from user
  deleteLanguage: async (data: DeleteLanguageRequest): Promise<void> => {
    await apiClient.delete('/api/user/languages', { data })
  },
}
