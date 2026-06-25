import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CorridorState {
  /** Origin country id (server UUID), or null until initialized from /api/common/countries. */
  fromId: string | null
  /** Destination country id (server UUID). */
  toId: string | null
  setCorridor: (fromId: string, toId: string) => void
  setFrom: (fromId: string) => void
  setTo: (toId: string) => void
  swap: () => void
}

export const useCorridorStore = create<CorridorState>()(
  persist(
    (set) => ({
      fromId: null,
      toId: null,
      setCorridor: (fromId, toId) => set({ fromId, toId }),
      setFrom: (fromId) => set({ fromId }),
      setTo: (toId) => set({ toId }),
      swap: () => set((s) => ({ fromId: s.toId, toId: s.fromId })),
    }),
    { name: 'landly-corridor-v2' }
  )
)
