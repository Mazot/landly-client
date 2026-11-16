// Where to go after a sign-in that leaves the app: Google's OAuth is a full-page round trip, so the
// router's `location.state` (`ReturnState`) does not survive it and waits here meanwhile.
import type { ReturnState } from './routes'

const KEY = 'auth_return'

/** Remembers `state.from` (when there is one) before the browser leaves for Google. */
export function rememberReturn(state: unknown) {
  const from = (state as ReturnState | null)?.from
  try {
    if (from) sessionStorage.setItem(KEY, JSON.stringify({ from }))
    else sessionStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the user simply lands on the map afterwards.
  }
}

/** The remembered place, once: `null` when there is none (or storage is unavailable). */
export function takeReturn(): unknown {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
