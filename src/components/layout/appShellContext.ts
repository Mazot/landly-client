import { createContext, useContext } from 'react'

interface AppShellContextValue {
  /** Opens the corridor picker (the nav pill, the map's corridor summary). */
  openCorridors: () => void
}

export const AppShellContext = createContext<AppShellContextValue>({ openCorridors: () => {} })

/** The app shell's actions for the screen inside it. */
export const useAppShell = () => useContext(AppShellContext)
