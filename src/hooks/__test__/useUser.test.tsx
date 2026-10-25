import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/authStore'
import { authUser, userProfile } from '@/test/factories'
import { isInvalidated, renderQueryHook, seed } from '@/test/render'
import { capture } from '@/test/server'
import {
  useAddLanguages,
  useDeleteLanguage,
  useMe,
  useUpdateMe,
  useUpdateNotifications,
  useUserLanguages,
} from '../useUser'

describe('useMe', () => {
  it('stays idle while signed out', () => {
    expect(renderQueryHook(() => useMe()).result.current.fetchStatus).toBe('idle')
  })

  it('loads the profile when signed in', async () => {
    useAuthStore.getState().setAuth(authUser())
    const me = userProfile({ role: 'moderator' })
    capture('get', '/api/user/me', me)
    const { result } = renderQueryHook(() => useMe())
    await waitFor(() => expect(result.current.data).toEqual(me))
  })
})

describe('profile writes', () => {
  it('useUpdateMe stores the returned profile', async () => {
    const updated = userProfile({ city: 'Berlin' })
    const requests = capture('put', '/api/user/me', updated)
    const { result, client } = renderQueryHook(() => useUpdateMe())

    await act(() => result.current.mutateAsync({ city: 'Berlin' }))

    expect(requests[0].body).toEqual({ city: 'Berlin' })
    expect(client.getQueryData(queryKeys.me)).toEqual(updated)
  })

  it('useUpdateNotifications stores the returned profile', async () => {
    const updated = userProfile({ notificationSettings: { email: false } })
    capture('put', '/api/user/me/notifications', updated)
    const { result, client } = renderQueryHook(() => useUpdateNotifications())

    await act(() => result.current.mutateAsync({ notification_settings: { email: false } }))

    expect(client.getQueryData(queryKeys.me)).toEqual(updated)
  })
})

describe('user languages', () => {
  it('useUserLanguages stays idle without a user and loads them with one', async () => {
    expect(renderQueryHook(() => useUserLanguages(undefined)).result.current.fetchStatus).toBe('idle')

    const languages = { userId: 'u1', languageIds: ['l1'] }
    capture('get', '/api/user/u1/languages', languages)
    const { result } = renderQueryHook(() => useUserLanguages('u1'))
    await waitFor(() => expect(result.current.data).toEqual(languages))
  })

  it('useAddLanguages stores the answer under the user it belongs to', async () => {
    const languages = { userId: 'u1', languageIds: ['l1', 'l2'] }
    capture('post', '/api/user/languages', languages)
    const { result, client } = renderQueryHook(() => useAddLanguages())

    await act(() => result.current.mutateAsync({ languages_ids: ['l2'] }))

    expect(client.getQueryData(queryKeys.userLanguages('u1'))).toEqual(languages)
  })

  it('useDeleteLanguage refreshes the signed-in user’s languages', async () => {
    useAuthStore.getState().setAuth(authUser({ id: 'u1' }))
    capture('delete', '/api/user/languages', 'OK')
    const { result, client } = renderQueryHook(() => useDeleteLanguage())
    seed(client, queryKeys.userLanguages('u1'))

    await act(() => result.current.mutateAsync({ language_id: 'l1' }))

    expect(isInvalidated(client, queryKeys.userLanguages('u1'))).toBe(true)
  })

  it('useDeleteLanguage without a known user has nothing to refresh', async () => {
    capture('delete', '/api/user/languages', 'OK')
    const { result, client } = renderQueryHook(() => useDeleteLanguage())
    seed(client, queryKeys.userLanguages('u1'))

    await act(() => result.current.mutateAsync({ language_id: 'l1' }))

    expect(isInvalidated(client, queryKeys.userLanguages('u1'))).toBe(false)
  })
})
