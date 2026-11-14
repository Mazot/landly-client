import { describe, expect, it } from 'vitest'
import { afterSignIn, ROUTES } from '../routes'

describe('ROUTES', () => {
  it('keeps the paths other places depend on', () => {
    expect(ROUTES).toEqual({ landing: '/', signIn: '/signin', signUp: '/signup', map: '/map', people: '/people', countries: '/countries', saved: '/saved', account: '/account', accountEdit: '/account/edit', add: '/add', addSent: '/add/sent' })
  })
})

describe('afterSignIn', () => {
  it('goes back to the in-app screen that asked for the account, with its query', () => {
    expect(afterSignIn({ from: { pathname: '/add', search: '?x=1' } })).toBe('/add?x=1')
    expect(afterSignIn({ from: { pathname: '/add/sent/p1' } })).toBe('/add/sent/p1')
  })

  it('goes to the map without one, or for anything that is not an in-app path', () => {
    expect(afterSignIn(undefined)).toBe('/map')
    expect(afterSignIn(null)).toBe('/map')
    expect(afterSignIn({})).toBe('/map')
    expect(afterSignIn({ from: { pathname: 'https://evil.example' } })).toBe('/map')
    expect(afterSignIn({ from: { pathname: '//evil.example/add' } })).toBe('/map')
    expect(afterSignIn({ from: { pathname: 42 } })).toBe('/map')
  })
})
