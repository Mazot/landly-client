/** Leaves the SPA for `url` (top-level navigation) — a seam so tests need not fake `window.location`. */
export function redirectTo(url: string) {
  window.location.assign(url)
}
