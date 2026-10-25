import { describe, expect, it } from 'vitest'
import { queryKeys } from '../queryKeys'

/** `prefix` invalidates `key` in React Query when it is a leading slice of it. */
const isPrefix = (prefix: readonly unknown[], key: readonly unknown[]) =>
  prefix.every((part, i) => JSON.stringify(part) === JSON.stringify(key[i]))

describe('queryKeys', () => {
  it('nests every feature key under its root', () => {
    const pairs: [readonly unknown[], readonly unknown[]][] = [
      [queryKeys.countries.all, queryKeys.countries.list({ name: 'ger' })],
      [queryKeys.countries.all, queryKeys.countries.infinite('ger')],
      [queryKeys.countries.all, queryKeys.countries.everything],
      [queryKeys.countries.details, queryKeys.countries.detail('c1')],
      [queryKeys.organisations.all, queryKeys.organisations.list({ name: 'x' })],
      [queryKeys.organisations.all, queryKeys.organisations.search({ lat: 1, lng: 2 })],
      [queryKeys.organisations.all, queryKeys.organisations.detail('o1')],
      [queryKeys.images.byOrganisation('o1'), queryKeys.images.list('o1', { limit: 5 })],
      [queryKeys.images.details, queryKeys.images.detail('i1')],
      [queryKeys.corridors.all, queryKeys.corridors.list],
      [queryKeys.corridors.allStats, queryKeys.corridors.stats('k1')],
      [queryKeys.countryConnections.all, queryKeys.countryConnections.detail('cc1')],
      [queryKeys.people.lists, queryKeys.people.list({ city: 'Berlin' })],
      [queryKeys.people.all, queryKeys.people.claim('token')],
      [queryKeys.reviews.all, queryKeys.reviews.list({ organisation_id: 'o1' })],
      [queryKeys.saved.all, queryKeys.saved.counts],
      [queryKeys.moderation.all, queryKeys.moderation.queue({ kind: 'org' })],
    ]
    for (const [prefix, key] of pairs) expect(isPrefix(prefix, key), `${prefix} ⊂ ${key}`).toBe(true)
  })

  it('keeps country details apart from country lists (summaries refresh without refetching lists)', () => {
    expect(isPrefix(queryKeys.countries.details, queryKeys.countries.list())).toBe(false)
  })

  it('scopes image lists to one organisation', () => {
    expect(isPrefix(queryKeys.images.byOrganisation('o1'), queryKeys.images.list('o2'))).toBe(false)
  })

  it('normalizes a missing query to {} so both spellings share a cache entry', () => {
    expect(queryKeys.organisations.list()).toEqual(queryKeys.organisations.list({}))
    expect(queryKeys.languages()).toEqual(['languages', {}])
  })

  it('keys Google place details by id and field list', () => {
    expect(queryKeys.googlePlace('p1', ['id'])).toEqual(['google-place', 'p1', ['id']])
  })
})
