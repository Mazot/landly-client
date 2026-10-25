/** Client routes referenced from more than one place. */
export const ROUTES = {
  landing: '/',
  signIn: '/signin',
  signUp: '/signup',
  /** Where a signed-in user lands; the screen is not built yet. */
  map: '/map',
} as const
