import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import '@/i18n'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { server } from './server'
import { DEFAULT_VIEWPORT_WIDTH, installMatchMedia } from './viewport'

// jsdom may not implement the modal dialog API (Sheet uses it); browsers do.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open')
}

// jsdom has no layout, so the map (needs Google's script) is replaced by a stub and the browser
// API `MapBackdrop` observes the page with reports "on screen". Tests that look at the map
// itself override these (`vi.mock` per file, `vi.stubGlobal`).
vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    APIProvider: ({ children }: { children?: ReactNode }) => children,
    Map: ({ children }: { children?: ReactNode }) => createElement('div', { 'data-testid': 'google-map' }, children),
    AdvancedMarker: () => null,
    useMap: () => null,
    useMapsLibrary: () => null,
  }
})
globalThis.IntersectionObserver ??= class {
  constructor(private callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
  unobserve() {}
  disconnect() {}
  takeRecords = () => []
} as unknown as typeof IntersectionObserver

installMatchMedia()
// jsdom does not scroll: the stub lets a test see which element was brought into view.
Element.prototype.scrollIntoView = vi.fn()

// Any request without a handler fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  queryClient.clear()
  useAuthStore.getState().clearAuth()
  localStorage.clear()
  window.innerWidth = DEFAULT_VIEWPORT_WIDTH
})

afterAll(() => server.close())
