import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import { image, list } from '@/test/factories'
import { isInvalidated, renderQueryHook, seed } from '@/test/render'
import { capture } from '@/test/server'
import { useDeleteImage, useImage, useOrganisationImages, useSetPrimaryImage, useUploadImage } from './useImages'

describe('image queries', () => {
  it('useOrganisationImages stays idle without an organisation and pages with one', async () => {
    expect(renderQueryHook(() => useOrganisationImages(undefined)).result.current.fetchStatus).toBe('idle')

    const photo = image({ organisationId: 'o1' })
    const requests = capture('get', '/api/images/list/o1', list([photo]))
    const { result } = renderQueryHook(() => useOrganisationImages('o1', { limit: 10 }))
    await waitFor(() => expect(result.current.data?.items).toEqual([photo]))
    expect(requests[0].query.get('limit')).toBe('10')
  })

  it('useImage stays idle without an id and loads one with it', async () => {
    expect(renderQueryHook(() => useImage(undefined)).result.current.fetchStatus).toBe('idle')

    const photo = image({ id: 'i1' })
    capture('get', '/api/images/fetch/i1', photo)
    const { result } = renderQueryHook(() => useImage('i1'))
    await waitFor(() => expect(result.current.data).toEqual(photo))
  })
})

describe('image writes', () => {
  const ownLists = queryKeys.images.list('o1')
  const otherLists = queryKeys.images.list('o2')
  const detail = queryKeys.images.detail('i9')

  it('upload refreshes this organisation’s lists and image details only', async () => {
    capture('post', '/api/images/upload/o1', image())
    const { result, client } = renderQueryHook(() => useUploadImage('o1'))
    seed(client, ownLists, otherLists, detail)

    await act(() => result.current.mutateAsync({ file: new File(['x'], 'a.jpg', { type: 'image/jpeg' }) }))

    expect(isInvalidated(client, ownLists)).toBe(true)
    expect(isInvalidated(client, detail)).toBe(true)
    expect(isInvalidated(client, otherLists)).toBe(false)
  })

  it('set-primary refreshes the lists and every cached detail (the old primary flips too)', async () => {
    capture('put', '/api/images/set-primary/i1', image({ id: 'i1', isPrimary: true }))
    const { result, client } = renderQueryHook(() => useSetPrimaryImage('o1'))
    seed(client, ownLists, detail)

    await act(() => result.current.mutateAsync('i1'))

    expect(isInvalidated(client, ownLists)).toBe(true)
    expect(isInvalidated(client, detail)).toBe(true)
  })

  it('delete drops the deleted image from the cache', async () => {
    capture('delete', '/api/images/delete/i1', 'OK')
    const { result, client } = renderQueryHook(() => useDeleteImage('o1'))
    seed(client, ownLists, queryKeys.images.detail('i1'))

    await act(() => result.current.mutateAsync('i1'))

    expect(client.getQueryState(queryKeys.images.detail('i1'))).toBeUndefined()
    expect(isInvalidated(client, ownLists)).toBe(true)
  })
})
