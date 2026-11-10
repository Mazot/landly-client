import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { useCorridorStore } from '@/stores/corridorStore'
import { authUser, corridor, country, list } from '@/test/factories'
import { renderQueryHook } from '@/test/render'
import { capture } from '@/test/server'
import { useCurrentCorridor } from '../useCurrentCorridor'

const russia = country({ name: 'Russia' })
const germany = country({ name: 'Germany' })
const serbia = country({ name: 'Serbia' })
const poland = country({ name: 'Poland' })

// The stored pair outlives a test (it is a module-level store): start every test without one.
beforeEach(() => useCorridorStore.setState({ fromId: null, toId: null }))

const signIn = () => useAuthStore.getState().setAuth(authUser())
const saved = (...corridors: ReturnType<typeof corridor>[]) => capture('get', '/api/corridor/list', list(corridors))
const arrange = () => capture('get', '/api/common/countries', [russia, germany, serbia, poland])

describe('useCurrentCorridor · guest', () => {
  it('is the guest corridor: Russia → Germany by default, then the stored pair', async () => {
    arrange()
    const { result } = renderQueryHook(() => useCurrentCorridor())
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect([result.current.from?.name, result.current.to?.name, result.current.corridor]).toEqual(['Russia', 'Germany', undefined])

    useCorridorStore.getState().setCorridor(poland.id, serbia.id)
    const next = renderQueryHook(() => useCurrentCorridor())
    await waitFor(() => expect(next.result.current.to?.name).toBe('Serbia'))
    expect(next.result.current.from?.name).toBe('Poland')
  })
})

describe('useCurrentCorridor · signed in', () => {
  it('is the default saved corridor, with its id for the stats', async () => {
    signIn()
    arrange()
    const home = corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true })
    saved(corridor({ fromCountryId: russia.id, toCountryId: serbia.id }), home)
    const { result } = renderQueryHook(() => useCurrentCorridor())
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect([result.current.from?.name, result.current.to?.name, result.current.corridor?.id]).toEqual(['Russia', 'Germany', home.id])
  })

  it('is the saved corridor matching the pair chosen in the picker', async () => {
    signIn()
    arrange()
    const toSerbia = corridor({ fromCountryId: russia.id, toCountryId: serbia.id })
    saved(corridor({ fromCountryId: russia.id, toCountryId: germany.id, isDefault: true }), toSerbia)
    useCorridorStore.getState().setCorridor(russia.id, serbia.id)
    const { result } = renderQueryHook(() => useCurrentCorridor())
    await waitFor(() => expect(result.current.corridor?.id).toBe(toSerbia.id))
    expect(result.current.to?.name).toBe('Serbia')
  })

  it('falls back to the first corridor when none is the default, and ignores a stored pair that is not saved', async () => {
    signIn()
    arrange()
    const first = corridor({ fromCountryId: poland.id, toCountryId: germany.id })
    saved(first, corridor({ fromCountryId: russia.id, toCountryId: serbia.id }))
    useCorridorStore.getState().setCorridor(germany.id, poland.id)
    const { result } = renderQueryHook(() => useCurrentCorridor())
    await waitFor(() => expect(result.current.corridor?.id).toBe(first.id))
    expect([result.current.from?.name, result.current.to?.name]).toEqual(['Poland', 'Germany'])
  })

  it('uses the guest pair, without a corridor id, when nothing is saved yet', async () => {
    signIn()
    arrange()
    saved()
    const { result } = renderQueryHook(() => useCurrentCorridor())
    await waitFor(() => expect(result.current.to?.name).toBe('Germany'))
    expect(result.current.corridor).toBeUndefined()
    expect(result.current.from?.name).toBe('Russia')
  })
})
