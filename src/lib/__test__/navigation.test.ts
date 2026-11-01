import { describe, expect, it } from 'vitest'
import { redirectTo } from '../navigation'

describe('redirectTo', () => {
  it('performs a top-level navigation', () => {
    redirectTo('#oauth')
    expect(window.location.hash).toBe('#oauth')
  })
})
