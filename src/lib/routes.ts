/** Client routes referenced from more than one place. */
export const ROUTES = {
  landing: '/',
  signIn: '/signin',
  signUp: '/signup',
  /** The map; public, and where a signed-in user lands. */
  map: '/map',
  people: '/people',
  countries: '/countries',
  saved: '/saved',
  account: '/account',
  accountEdit: '/account/edit',
  add: '/add',
  /** `/add/sent/{organisationId}` — the place was submitted. */
  addSent: '/add/sent',
} as const

/** `location.state` of a screen a guest was sent away from to sign in (`RequireAuth`). */
export interface ReturnState {
  from?: { pathname: string; search?: string }
}

/**
 * Where to go after signing in: back to the screen that needed the account, else the map. Only an
 * in-app path is taken (never `//host` or a URL), so the state cannot send the user off-site.
 */
export function afterSignIn(state: unknown): string {
  const from = (state as ReturnState | null)?.from
  const path = typeof from?.pathname === 'string' ? from.pathname : ''
  if (!path.startsWith('/') || path.startsWith('//')) return ROUTES.map
  return path + (typeof from?.search === 'string' ? from.search : '')
}
