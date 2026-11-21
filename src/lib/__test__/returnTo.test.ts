import { afterEach, describe, expect, it, vi } from 'vitest'
import { rememberReturn, takeReturn } from '../returnTo'

afterEach(() => {
  vi.restoreAllMocks()
  sessionStorage.clear()
})

describe('the place to return to after Google', () => {
  it('keeps the screen that sent the user to sign in, once', () => {
    rememberReturn({ from: { pathname: '/claim/tok', search: '?x=1' } })
    expect(takeReturn()).toEqual({ from: { pathname: '/claim/tok', search: '?x=1' } })
    expect(takeReturn()).toBeNull()
  })

  it('forgets an earlier place when there is none this time', () => {
    rememberReturn({ from: { pathname: '/claim/tok' } })
    rememberReturn(null)
    expect(takeReturn()).toBeNull()
  })

  it('does nothing without storage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => rememberReturn({ from: { pathname: '/claim/tok' } })).not.toThrow()
    expect(takeReturn()).toBeNull()
  })
})
