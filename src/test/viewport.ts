// jsdom has no layout: `matchMedia` answers `(min-width: Npx)` from `window.innerWidth`, and a test
// switches the viewport with `setViewportWidth` (listeners are notified like on a real resize).
const listeners = new Set<EventListener>()

export const DEFAULT_VIEWPORT_WIDTH = 1024

export function installMatchMedia() {
  window.matchMedia = ((query: string) => ({
    get matches() {
      const min = /min-width:\s*(\d+)px/.exec(query)
      return min ? window.innerWidth >= Number(min[1]) : false
    },
    media: query,
    addEventListener: (_type: string, listener: EventListener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: EventListener) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia
}

/** Phone ≤ 767, tablet 768–1023, desktop ≥ 1024 (the jsdom default). */
export function setViewportWidth(width: number) {
  window.innerWidth = width
  listeners.forEach((listener) => listener(new Event('change')))
}
