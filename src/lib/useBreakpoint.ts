import { useSyncExternalStore } from 'react'

/** Tailwind's `md` (768 px) and `lg` (1024 px) — the two widths where the app's layouts change. */
const MD = '(min-width: 768px)'
const LG = '(min-width: 1024px)'

export type Breakpoint = 'phone' | 'tablet' | 'desktop'

function subscribe(onChange: () => void) {
  const lists = [window.matchMedia(MD), window.matchMedia(LG)]
  lists.forEach((list) => list.addEventListener('change', onChange))
  return () => lists.forEach((list) => list.removeEventListener('change', onChange))
}

const snapshot = (): Breakpoint => (window.matchMedia(LG).matches ? 'desktop' : window.matchMedia(MD).matches ? 'tablet' : 'phone')

/**
 * The current layout class. Use it only where the *structure* differs per size (one list rendered
 * in a side panel, below the map or in a bottom sheet); plain size changes belong to Tailwind variants.
 */
export const useBreakpoint = (): Breakpoint => useSyncExternalStore(subscribe, snapshot, () => 'desktop')
