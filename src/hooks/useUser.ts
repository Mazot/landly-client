import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { userApi } from '@/services/user.service'
import { useAuthStore } from '@/stores/authStore'
import type {
  AddLanguagesRequest,
  DeleteLanguageRequest,
  UpdateNotificationSettingsRequest,
  UpdateProfileRequest,
  UserProfile,
  Uuid,
} from '@/types/api'

/** The caller's profile (role, stats, settings); disabled while signed out. */
export const useMe = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: userApi.getMe,
    enabled: isAuthenticated,
  })
}

const useSetMe = () => {
  const queryClient = useQueryClient()
  return (profile: UserProfile) => queryClient.setQueryData(queryKeys.me, profile)
}

export const useUpdateMe = () => {
  const setMe = useSetMe()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => userApi.updateMe(body),
    onSuccess: setMe,
  })
}

export const useUpdateNotifications = () => {
  const setMe = useSetMe()
  return useMutation({
    mutationFn: (body: UpdateNotificationSettingsRequest) => userApi.updateNotifications(body),
    onSuccess: setMe,
  })
}

export const useUserLanguages = (userId: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.userLanguages(userId ?? ''),
    queryFn: () => userApi.getLanguages(userId!),
    enabled: !!userId,
  })

export const useAddLanguages = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddLanguagesRequest) => userApi.addLanguages(body),
    onSuccess: (languages) => queryClient.setQueryData(queryKeys.userLanguages(languages.userId), languages),
  })
}

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: (body: DeleteLanguageRequest) => userApi.deleteLanguage(body),
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.userLanguages(userId) })
    },
  })
}
