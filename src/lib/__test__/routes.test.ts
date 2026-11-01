import { describe, expect, it } from 'vitest'
import { ROUTES } from '../routes'

describe('ROUTES', () => {
  it('keeps the paths other places depend on', () => {
    expect(ROUTES).toEqual({ landing: '/', signIn: '/signin', signUp: '/signup', map: '/map' })
  })
})
