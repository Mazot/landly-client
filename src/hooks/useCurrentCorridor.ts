import { useShallow } from 'zustand/react/shallow'
import { useCorridorStore } from '@/stores/corridorStore'
import { useAuthStore } from '@/stores/authStore'
import type { Corridor } from '@/types/api'
import { useAllCountries } from './useCommon'
import { useCorridors } from './useCorridors'
import { useGuestCorridor } from './useGuestCorridor'

/**
 * The corridor the app is showing. A guest's is the stored pair (default Russia → Germany,
 * `useGuestCorridor`). A signed-in user's is the saved corridor matching the stored pair, else
 * their default one, else the first — so the choice made in the corridor picker sticks, and
 * `corridor` (with its id, needed for stats) is set whenever the pair is a saved one.
 */
export function useCurrentCorridor() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const stored = useCorridorStore(useShallow((state) => ({ fromId: state.fromId, toId: state.toId })))
  const guest = useGuestCorridor()
  const { data: countries = [], isPending: countriesPending } = useAllCountries()
  const { data: saved, isPending: corridorsPending } = useCorridors()

  if (!isAuthenticated) return { from: guest.from, to: guest.to, corridor: undefined as Corridor | undefined, isPending: guest.isPending }

  const list = saved?.items ?? []
  const corridor = list.find((c) => c.fromCountryId === stored.fromId && c.toCountryId === stored.toId) ?? list.find((c) => c.isDefault) ?? list[0]
  // Signed in but nothing saved yet (a Google sign-up without a corridor): the guest pair applies.
  if (!corridor && !corridorsPending) return { from: guest.from, to: guest.to, corridor, isPending: guest.isPending }
  return {
    from: countries.find((c) => c.id === corridor?.fromCountryId),
    to: countries.find((c) => c.id === corridor?.toCountryId),
    corridor,
    isPending: countriesPending || corridorsPending,
  }
}
