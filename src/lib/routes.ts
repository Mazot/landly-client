/** Client routes referenced from more than one place. */
export const ROUTES = {
  landing: '/',
  signIn: '/signin',
  signUp: '/signup',
  /** The map; public, and where a signed-in user lands. */
  map: '/map',
} as const
