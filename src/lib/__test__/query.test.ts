import { describe, expect, it } from 'vitest'
import { toQueryString } from '../query'

describe('toQueryString', () => {
  it('joins arrays with commas, the format the server parses', () => {
    expect(toQueryString({ types: ['embassy', 'community'], languages: ['Russian'] })).toBe(
      'types=embassy%2Ccommunity&languages=Russian',
    )
  })

  it('drops undefined, null, empty strings and empty arrays', () => {
    expect(toQueryString({ a: undefined, b: null, c: '', d: [], e: 'kept' })).toBe('e=kept')
  })

  it('stringifies numbers and booleans, keeping false and 0', () => {
    expect(toQueryString({ limit: 0, open_now: false, verified: true, lat: 52.52 })).toBe(
      'limit=0&open_now=false&verified=true&lat=52.52',
    )
  })

  it('returns an empty string for no params', () => {
    expect(toQueryString({})).toBe('')
  })
})
