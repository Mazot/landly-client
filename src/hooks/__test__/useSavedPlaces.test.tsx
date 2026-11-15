import { act, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser, list, savedItem } from '@/test/factories'
import { renderQueryHook } from '@/test/render'
import { API, capture, server } from '@/test/server'
import { useSavedPeople, useSavedPlaces } from '../useSavedPlaces'

describe('useSavedPlaces', () => {
  it('knows nothing for a guest: the saved list is not requested', () => {
    const { result } = renderQueryHook(() => useSavedPlaces())
    expect(result.current.isSaved('org-1')).toBe(false)
  })

  it('knows which organisations are saved, from the saved organisations list', async () => {
    useAuthStore.getState().setAuth(authUser())
    const requests = capture('get', '/api/saved/list', list([savedItem({ id: 'saved-1', kind: 'org', targetId: 'org-1' })]))
    const { result } = renderQueryHook(() => useSavedPlaces())
    await waitFor(() => expect(result.current.isSaved('org-1')).toBe(true))
    expect(result.current.isSaved('org-2')).toBe(false)
    expect(requests[0].query.get('kind')).toBe('org')
  })

  it('saves an organisation that is not saved yet', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/saved/list', list([]))
    const created = capture('post', '/api/saved/create', savedItem())
    const { result } = renderQueryHook(() => useSavedPlaces())
    act(() => result.current.toggle('org-9'))
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toEqual({ kind: 'org', target_id: 'org-9' })
  })

  it('removes a saved organisation by the id of its saved item', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/saved/list', list([savedItem({ id: 'saved-1', kind: 'org', targetId: 'org-1' })]))
    const removed = capture('delete', '/api/saved/delete/saved-1')
    const { result } = renderQueryHook(() => useSavedPlaces())
    await waitFor(() => expect(result.current.isSaved('org-1')).toBe(true))
    act(() => result.current.toggle('org-1'))
    await waitFor(() => expect(removed).toHaveLength(1))
  })

  it('does not send a second save while the first one is on its way', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/saved/list', list([]))
    let creates = 0
    server.use(
      http.post(`${API}/api/saved/create`, async () => {
        creates += 1
        await delay(50)
        return HttpResponse.json(savedItem())
      }),
    )
    const { result } = renderQueryHook(() => useSavedPlaces())
    act(() => result.current.toggle('org-9'))
    await waitFor(() => expect(creates).toBe(1))
    act(() => result.current.toggle('org-9'))
    await delay(100)
    expect(creates).toBe(1)
  })
})

describe('useSavedTargets', () => {
  it('does not send a second removal while the first one is on its way', async () => {
    useAuthStore.getState().setAuth(authUser())
    capture('get', '/api/saved/list', list([savedItem({ id: 'saved-1', kind: 'person', targetId: 'p1' })]))
    let removals = 0
    server.use(
      http.delete(`${API}/api/saved/delete/saved-1`, async () => {
        removals += 1
        await delay(50)
        return HttpResponse.json(null)
      }),
    )
    const { result } = renderQueryHook(() => useSavedPeople())
    await waitFor(() => expect(result.current.isSaved('p1')).toBe(true))
    act(() => result.current.toggle('p1'))
    await waitFor(() => expect(removals).toBe(1))
    act(() => result.current.toggle('p1'))
    await delay(100)
    expect(removals).toBe(1)
  })
})

describe('useSavedPeople', () => {
  it('works on the saved helpers: asks for the person kind and saves with it', async () => {
    useAuthStore.getState().setAuth(authUser())
    const lists = capture('get', '/api/saved/list', list([savedItem({ id: 'saved-1', kind: 'person', targetId: 'p1' })]))
    const created = capture('post', '/api/saved/create', savedItem())
    const { result } = renderQueryHook(() => useSavedPeople())
    await waitFor(() => expect(result.current.isSaved('p1')).toBe(true))
    expect(lists[0].query.get('kind')).toBe('person')
    act(() => result.current.toggle('p2'))
    await waitFor(() => expect(created).toHaveLength(1))
    expect(created[0].body).toEqual({ kind: 'person', target_id: 'p2' })
  })
})

