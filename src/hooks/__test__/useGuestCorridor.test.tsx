import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCorridorStore } from '@/stores/corridorStore'
import { country } from '@/test/factories'
import { renderQueryHook } from '@/test/render'
import { capture } from '@/test/server'
import { useGuestCorridor } from '../useGuestCorridor'

const russia = country({ name: 'Russia', flag: '🇷🇺' })
const germany = country({ name: 'Germany' })
const ukraine = country({ name: 'Ukraine', flag: '🇺🇦' })

async function load(countries = [russia, germany, ukraine]) {
  capture('get', '/api/common/countries', countries)
  const hook = renderQueryHook(() => useGuestCorridor())
  await waitFor(() => expect(hook.result.current.isPending).toBe(false))
  return hook
}

describe('useGuestCorridor', () => {
  beforeEach(() => useCorridorStore.setState({ fromId: null, toId: null }))

  it('offers Russia → Germany until the guest picks something', async () => {
    const { result } = await load()
    expect(result.current.from).toEqual(russia)
    expect(result.current.to).toEqual(germany)
    expect(result.current.ready).toBe(true)
    expect(result.current.countries.map((c) => c.name)).toEqual(['Germany', 'Russia', 'Ukraine'])
  })

  it('prefers the stored corridor and ignores ids that no longer exist', async () => {
    useCorridorStore.setState({ fromId: ukraine.id, toId: 'deleted-country' })
    const { result } = await load()
    expect(result.current.from).toEqual(ukraine)
    expect(result.current.to).toEqual(germany)
  })

  it('stores a picked side', async () => {
    const { result } = await load()
    act(() => result.current.setTo(ukraine.id))
    expect(useCorridorStore.getState()).toMatchObject({ fromId: null, toId: ukraine.id })
    await waitFor(() => expect(result.current.to).toEqual(ukraine))
  })

  it('swaps the sides instead of making them equal', async () => {
    const { result } = await load()
    act(() => result.current.setFrom(germany.id))
    expect(useCorridorStore.getState()).toMatchObject({ fromId: germany.id, toId: russia.id })
    act(() => result.current.setTo(germany.id))
    expect(useCorridorStore.getState()).toMatchObject({ fromId: russia.id, toId: germany.id })
  })

  it('commit() saves the pair shown on screen', async () => {
    const { result } = await load()
    act(() => result.current.commit())
    expect(useCorridorStore.getState()).toMatchObject({ fromId: russia.id, toId: germany.id })
  })

  it('is not ready, and commits nothing, when a default country is missing', async () => {
    const { result } = await load([ukraine])
    expect(result.current.ready).toBe(false)
    act(() => result.current.commit())
    expect(useCorridorStore.getState()).toMatchObject({ fromId: null, toId: null })
    // Picking works even though the other side is unknown yet.
    act(() => result.current.setFrom(ukraine.id))
    act(() => result.current.setTo(ukraine.id))
    expect(useCorridorStore.getState()).toMatchObject({ fromId: ukraine.id, toId: ukraine.id })
  })

  it('falls back to the first two countries when the default ones are not in the list (renamed data)', async () => {
    const { result } = await load([country({ name: 'Russian Federation' }), country({ name: 'Deutschland' }), country({ name: 'Ukraine' })])
    expect(result.current.countries.map((c) => c.name)).toEqual(['Deutschland', 'Russian Federation', 'Ukraine'])
    expect(result.current.from?.name).toBe('Deutschland')
    expect(result.current.to?.name).toBe('Russian Federation')
    expect(result.current.ready).toBe(true)
  })

  it('never offers the same country on both sides by default', async () => {
    useCorridorStore.setState({ fromId: germany.id, toId: null })
    const { result } = await load()
    expect(result.current.from).toEqual(germany)
    expect(result.current.to).toEqual(russia)
  })

  describe('persist: false (draft)', () => {
    async function loadDraft() {
      capture('get', '/api/common/countries', [russia, germany, ukraine])
      const hook = renderQueryHook(() => useGuestCorridor({ persist: false }))
      await waitFor(() => expect(hook.result.current.isPending).toBe(false))
      return hook
    }

    it('starts from the stored corridor and keeps picks out of the store', async () => {
      useCorridorStore.setState({ fromId: ukraine.id, toId: germany.id })
      const { result } = await loadDraft()
      expect(result.current.from).toEqual(ukraine)

      act(() => result.current.setTo(russia.id))
      await waitFor(() => expect(result.current.to).toEqual(russia))
      act(() => result.current.setFrom(russia.id))
      await waitFor(() => expect(result.current.from).toEqual(russia))
      expect(result.current.to).toEqual(ukraine)
      act(() => result.current.commit())

      expect(useCorridorStore.getState()).toMatchObject({ fromId: ukraine.id, toId: germany.id })
    })
  })

  it('reports a failed country list', async () => {
    capture('get', '/api/common/countries', { error: 'boom' }, 500)
    const { result } = renderQueryHook(() => useGuestCorridor())
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.ready).toBe(false)
  })
})
