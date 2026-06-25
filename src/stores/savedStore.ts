import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrgTypeKey } from '@/lib/orgTypes'

export interface SavedOrgEntry {
  kind: 'org' | 'person'
  id: string
  name: string
  typeKey: OrgTypeKey
  typeLabel?: string
  typeColor: string
  city?: string
  note?: string
  role?: string
  initials: string
}

export interface SavedCountryEntry {
  kind: 'country'
  id: string
  name: string
  flag?: string
}

export interface SavedCorridorEntry {
  kind: 'corridor'
  id: string
  fromName: string
  fromFlag?: string
  toName: string
  toFlag?: string
}

export type SavedEntry = SavedOrgEntry | SavedCountryEntry | SavedCorridorEntry

interface SavedState {
  items: SavedEntry[]
  isSaved: (id: string) => boolean
  add: (entry: SavedEntry) => void
  remove: (id: string) => void
  toggle: (entry: SavedEntry) => void
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      isSaved: (id) => get().items.some((i) => i.id === id),
      add: (entry) =>
        set((s) => (s.items.some((i) => i.id === entry.id) ? s : { items: [entry, ...s.items] })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggle: (entry) =>
        set((s) =>
          s.items.some((i) => i.id === entry.id)
            ? { items: s.items.filter((i) => i.id !== entry.id) }
            : { items: [entry, ...s.items] }
        ),
    }),
    { name: 'landly-saved-v2' }
  )
)
