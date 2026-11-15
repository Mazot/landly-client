import { describe, expect, it } from 'vitest'
import { countActivePeopleFilters, DEFAULT_PEOPLE_FILTERS, parsePeopleFilters, serializePeopleFilters, toPeopleQuery } from '../peopleFilters'

describe('people filters ↔ URL', () => {
  it('reads the city, skills and languages, with defaults for what is missing', () => {
    expect(parsePeopleFilters(new URLSearchParams('city=Berlin&skills=Housing,Banking&lang=l1,l2'))).toEqual({ city: 'Berlin', skills: ['Housing', 'Banking'], languageIds: ['l1', 'l2'] })
    expect(parsePeopleFilters(new URLSearchParams('skills=,Taxes,'))).toEqual({ city: '', skills: ['Taxes'], languageIds: [] })
    expect(parsePeopleFilters(new URLSearchParams())).toEqual(DEFAULT_PEOPLE_FILTERS)
  })

  it('writes only what differs from the defaults', () => {
    expect(serializePeopleFilters(DEFAULT_PEOPLE_FILTERS).toString()).toBe('')
    expect(serializePeopleFilters({ city: ' Berlin ', skills: ['Housing', 'Banking'], languageIds: ['l1'] }).toString()).toBe('city=Berlin&skills=Housing%2CBanking&lang=l1')
    expect(serializePeopleFilters({ city: '   ', skills: [], languageIds: [] }).toString()).toBe('')
  })

  it('counts the groups that are switched on', () => {
    expect(countActivePeopleFilters(DEFAULT_PEOPLE_FILTERS)).toBe(0)
    expect(countActivePeopleFilters({ city: 'Berlin', skills: ['Housing'], languageIds: ['l1'] })).toBe(3)
    expect(countActivePeopleFilters({ city: ' ', skills: ['Housing'], languageIds: [] })).toBe(1)
  })

  it('builds the list request: empty groups left out, the country added', () => {
    expect(toPeopleQuery(DEFAULT_PEOPLE_FILTERS)).toEqual({})
    expect(toPeopleQuery({ city: ' Berlin ', skills: ['Housing'], languageIds: ['l1'] }, 'de')).toEqual({ city: 'Berlin', skills: ['Housing'], language_ids: ['l1'], location_country_id: 'de' })
  })
})
