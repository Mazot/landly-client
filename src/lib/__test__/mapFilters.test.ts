import { describe, expect, it } from 'vitest'
import { countActiveFilters, DEFAULT_FILTERS, filtersToQuery, parseFilters, serializeFilters, type MapFilters } from '../mapFilters'

const parse = (query: string) => parseFilters(new URLSearchParams(query))
const all: MapFilters = { types: ['embassy', 'business'], languages: ['Russian', 'German'], openNow: true, verified: true, minRating: 4.5, addedBy: 'official', sort: 'verified' }

describe('parseFilters', () => {
  it('is the defaults for an empty URL', () => {
    expect(parse('')).toEqual(DEFAULT_FILTERS)
  })

  it('reads every filter', () => {
    expect(parse('types=embassy,business&lang=Russian,German&open=1&verified=1&rating=4.5&by=official&sort=verified')).toEqual(all)
  })

  it('ignores unknown or malformed values instead of failing', () => {
    expect(parse('types=,,&open=yes&verified=0&rating=9&by=robots&sort=random')).toEqual(DEFAULT_FILTERS)
    expect(parse('rating=abc')).toEqual(DEFAULT_FILTERS)
  })

  it('accepts only the rating choices of the filters sheet', () => {
    expect(parse('rating=3.5').minRating).toBe(3.5)
    expect(parse('rating=4').minRating).toBe(4)
    expect(parse('rating=3').minRating).toBeNull()
  })
})

describe('serializeFilters', () => {
  it('writes nothing for the defaults, so the URL stays clean', () => {
    expect(serializeFilters(DEFAULT_FILTERS).toString()).toBe('')
  })

  it('writes only what differs, and parses back to the same filters', () => {
    expect(serializeFilters({ ...DEFAULT_FILTERS, openNow: true, sort: 'recent' }).toString()).toBe('open=1&sort=recent')
    const url = serializeFilters(all)
    expect(url.toString()).toBe('types=embassy%2Cbusiness&lang=Russian%2CGerman&open=1&verified=1&rating=4.5&by=official&sort=verified')
    expect(parseFilters(url)).toEqual(all)
  })
})

describe('countActiveFilters', () => {
  it('counts groups, not chips — and not the sort order', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0)
    expect(countActiveFilters({ ...DEFAULT_FILTERS, sort: 'recent' })).toBe(0)
    expect(countActiveFilters({ ...DEFAULT_FILTERS, types: ['embassy', 'business'], languages: ['Russian'], openNow: true, minRating: 4 })).toBe(4)
    expect(countActiveFilters(all)).toBe(6)
  })
})

describe('filtersToQuery', () => {
  it('sends the sort only for the defaults', () => {
    expect(filtersToQuery(DEFAULT_FILTERS)).toEqual({ sort: 'nearest' })
  })

  it('maps every filter onto the search parameters', () => {
    expect(filtersToQuery(all)).toEqual({
      types: ['embassy', 'business'],
      languages: ['Russian', 'German'],
      open_now: true,
      verified: true,
      min_rating: 4.5,
      added_by: 'official',
      sort: 'verified',
    })
  })
})
