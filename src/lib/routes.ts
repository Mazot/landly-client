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
  add: '/add',
  /** `/add/sent/{organisationId}` — the place was submitted. */
  addSent: '/add/sent',
} as const
