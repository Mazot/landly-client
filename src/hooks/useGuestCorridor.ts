import { useShallow } from 'zustand/react/shallow'
import { useCorridorStore } from '@/stores/corridorStore'
import type { Country } from '@/types/api'
import { useAllCountries } from './useCommon'

/** Corridor offered before the guest picks one. */
const DEFAULT_FROM_NAME = 'Russia'
const DEFAULT_TO_NAME = 'Germany'

const known = (countries: Country[], id: string | null) => countries.find((c) => c.id === id)

/**
 * The guest's "from → to" corridor (persisted in `corridorStore`) resolved
 * against the country list: a stale id falls back to the default pair, and
 * picking the other side's country swaps the two instead of making them equal.
 */
export function useGuestCorridor() {
  const { data: countries = [], isPending, isError } = useAllCountries()
  const { fromId, toId, setCorridor, setFromId, setToId } = useCorridorStore(
    useShallow((s) => ({ fromId: s.fromId, toId: s.toId, setCorridor: s.setCorridor, setFromId: s.setFrom, setToId: s.setTo })),
  )
  const named = (name: string) => countries.find((c) => c.name === name)

  const from = known(countries, fromId) ?? named(DEFAULT_FROM_NAME)
  const to = known(countries, toId) ?? named(DEFAULT_TO_NAME)

  return {
    countries,
    isPending,
    isError,
    from,
    to,
    /** Both sides are known and differ — the corridor can be saved. */
    ready: !!from && !!to && from.id !== to.id,
    setFrom: (id: string) => (from && to?.id === id ? setCorridor(id, from.id) : setFromId(id)),
    setTo: (id: string) => (to && from?.id === id ? setCorridor(to.id, id) : setToId(id)),
    /** Persists the resolved pair, so the default shown on screen becomes the guest's corridor. */
    commit: () => {
      if (from && to) setCorridor(from.id, to.id)
    },
  }
}
