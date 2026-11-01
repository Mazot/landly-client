import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useCorridorStore } from '@/stores/corridorStore'
import type { Country } from '@/types/api'
import { useAllCountries } from './useCommon'

/** Corridor offered before the guest picks one (matched by the server's English country name). */
const DEFAULT_FROM_NAME = 'Russia'
const DEFAULT_TO_NAME = 'Germany'

const known = (countries: Country[], id: string | null) => countries.find((c) => c.id === id)

/** The country named `name` if it is not `excludeId`, else the first one that is not. */
const pick = (countries: Country[], name: string, excludeId?: string) => [countries.find((c) => c.name === name), ...countries].find((c) => c && c.id !== excludeId)

/**
 * The guest's "from → to" corridor resolved against the country list: a stale or empty id
 * falls back to the default pair (or, when the default countries are not in the list or equal the
 * other side, to the first country that differs), and picking the other side's country swaps the two instead of making
 * them equal.
 *
 * `persist` (default) keeps the choice in `corridorStore`; `persist: false` keeps it in a draft
 * that starts from the stored corridor and is dropped with the component — for forms that must
 * not change the guest corridor until they are submitted.
 */
export function useGuestCorridor({ persist = true }: { persist?: boolean } = {}) {
  const { data: countries = [], isPending, isError } = useAllCountries()
  const stored = useCorridorStore(useShallow((s) => ({ fromId: s.fromId, toId: s.toId })))
  const { setCorridor, setFrom: setFromId, setTo: setToId } = useCorridorStore.getState()
  const [draft, setDraft] = useState(stored)
  const { fromId, toId } = persist ? stored : draft

  // A stale side is replaced by a default that differs from the side the guest still has.
  const storedTo = known(countries, toId)
  const from = known(countries, fromId) ?? pick(countries, DEFAULT_FROM_NAME, storedTo?.id)
  const to = storedTo ?? pick(countries, DEFAULT_TO_NAME, from?.id)

  const write = (next: { fromId: string; toId?: string } | { fromId?: undefined; toId: string }) => {
    if (!persist) setDraft((d) => ({ ...d, ...next }))
    else if (next.fromId !== undefined && next.toId !== undefined) setCorridor(next.fromId, next.toId)
    else if (next.fromId !== undefined) setFromId(next.fromId)
    else setToId(next.toId)
  }

  return {
    countries,
    isPending,
    isError,
    from,
    to,
    /** Both sides are known and differ — the corridor can be saved. */
    ready: !!from && !!to && from.id !== to.id,
    setFrom: (id: string) => (from && to?.id === id ? write({ fromId: id, toId: from.id }) : write({ fromId: id })),
    setTo: (id: string) => (to && from?.id === id ? write({ fromId: to.id, toId: id }) : write({ toId: id })),
    /** Saves the resolved pair, so the default shown on screen becomes the corridor. */
    commit: () => {
      if (from && to) write({ fromId: from.id, toId: to.id })
    },
  }
}
