import { describe, expect, it } from 'vitest'
import { organisation } from '@/test/factories'
import { emptyHours, fromOpeningHours, hoursToCopy, isOvernight, isValidInterval, searchTextFromMapsLink, toCreateRequest, toFormValues, toOpeningHours, toUpdateRequest, weekdayLabels, type PlaceFormValues } from '../placeDraft'

const values = (over: Partial<PlaceFormValues> = {}): PlaceFormValues => ({
  name: '  Kyiv Coffee ',
  typeId: 'type-1',
  address: ' ',
  tel: ' +381 11 123 ',
  email: '',
  website: '',
  description: 'Café',
  services: ['Breakfast'],
  languages: ['Russian'],
  hours: emptyHours(),
  fromId: 'ru',
  toId: 'rs',
  ...over,
})

describe('weekdayLabels', () => {
  it('names the days Monday first, in the UI language', () => {
    expect(Object.values(weekdayLabels('en'))).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(weekdayLabels('ru').mon).toBe('пн')
  })
})

describe('hours', () => {
  it('starts with every day closed', () => {
    expect(Object.values(emptyHours()).every((day) => day === null)).toBe(true)
  })

  it('copies the hours of the nearest open day before, else starts empty', () => {
    const hours = { ...emptyHours(), mon: ['09:00', '18:00'] as [string, string], wed: ['10:00', '14:00'] as [string, string] }
    expect(hoursToCopy(hours, 'fri')).toEqual(['10:00', '14:00'])
    expect(hoursToCopy(hours, 'tue')).toEqual(['09:00', '18:00'])
    expect(hoursToCopy(hours, 'mon')).toEqual(['', ''])
    // A copy, not the same array.
    expect(hoursToCopy(hours, 'tue')).not.toBe(hours.mon)
  })

  it('accepts complete intervals with two different times — past midnight too; 00:00 closes at midnight', () => {
    expect(isValidInterval(['09:00', '18:00'])).toBe(true)
    expect(isValidInterval(['20:00', '00:00'])).toBe(true)
    expect(isValidInterval(['18:00', '02:00'])).toBe(true)
    expect(isValidInterval(['00:00', '00:00'])).toBe(true)
    expect(isValidInterval(['09:00', '09:00'])).toBe(false)
    expect(isValidInterval(['', '18:00'])).toBe(false)
    expect(isValidInterval(['09:00', ''])).toBe(false)
  })

  it('knows an interval that closes after midnight', () => {
    expect(isOvernight(['18:00', '02:00'])).toBe(true)
    expect(isOvernight(['18:00', '00:00'])).toBe(false)
    expect(isOvernight(['09:00', '18:00'])).toBe(false)
    expect(isOvernight(['18:00', ''])).toBe(false)
  })

  it('splits a night at midnight into the next day — Sunday into Monday — keeping each day in order', () => {
    expect(
      toOpeningHours({ ...emptyHours(), mon: ['18:00', '02:00'], tue: ['12:00', '15:00'], sun: ['22:00', '04:00'] }),
    ).toEqual({
      mon: [['00:00', '04:00'], ['18:00', '24:00']],
      tue: [['00:00', '02:00'], ['12:00', '15:00']],
      sun: [['22:00', '24:00']],
    })
    expect(toOpeningHours({ ...emptyHours(), fri: ['00:00', '00:00'] })).toEqual({ fri: [['00:00', '24:00']] })
  })

  it('sends the open days only, a midnight close as 24:00, and nothing without an open day', () => {
    expect(toOpeningHours(emptyHours())).toBeUndefined()
    expect(toOpeningHours({ ...emptyHours(), mon: ['09:00', '18:00'], sat: ['20:00', '00:00'] })).toEqual({ mon: [['09:00', '18:00']], sat: [['20:00', '24:00']] })
  })
})

describe('toCreateRequest', () => {
  it('trims the text, leaves empty fields out and carries the corridor and the point', () => {
    expect(toCreateRequest(values(), { lat: 44.8, lng: 20.4, googlePlaceId: 'ChIJ1' })).toEqual({
      name: 'Kyiv Coffee',
      organisation_type_id: 'type-1',
      address: undefined,
      tel: '+381 11 123',
      email: undefined,
      website: undefined,
      description: 'Café',
      services: ['Breakfast'],
      languages: ['Russian'],
      opening_hours: undefined,
      location_country_id: 'rs',
      founder_country_id: 'ru',
      latitude: 44.8,
      longitude: 20.4,
      google_place_id: 'ChIJ1',
    })
  })

  it('leaves out a missing type and countries', () => {
    const request = toCreateRequest(values({ typeId: '', fromId: '', toId: '' }), { lat: 1, lng: 2 })
    expect(request.organisation_type_id).toBeUndefined()
    expect(request.location_country_id).toBeUndefined()
    expect(request.founder_country_id).toBeUndefined()
    expect(request.google_place_id).toBeUndefined()
  })
})

describe('searchTextFromMapsLink', () => {
  it('takes the place name out of a Google Maps place link', () => {
    expect(searchTextFromMapsLink('https://www.google.com/maps/place/Kyiv+Coffee/@52.5,13.4,17z')).toBe('Kyiv Coffee')
    expect(searchTextFromMapsLink('https://maps.google.com/maps/place/Caf%C3%A9%20Moskva?entry=ttu')).toBe('Café Moskva')
  })

  it('keeps any other text, and a link it cannot decode', () => {
    expect(searchTextFromMapsLink('Kalemegdan')).toBe('Kalemegdan')
    expect(searchTextFromMapsLink('https://maps.app.goo.gl/abc')).toBe('https://maps.app.goo.gl/abc')
    expect(searchTextFromMapsLink('https://google.com/maps/place/%E0%A4%A')).toBe('https://google.com/maps/place/%E0%A4%A')
  })
})

describe('editing a stored place', () => {
  it('shows stored hours as the editor does: a night split at midnight is one interval again', () => {
    const hours = { ...emptyHours(), mon: ['18:00', '02:00'], tue: ['12:00', '15:00'], wed: ['00:00', '00:00'], sun: ['22:00', '04:00'] } as ReturnType<typeof emptyHours>
    // What toOpeningHours stores and fromOpeningHours reads back (a closed day stays closed).
    expect(fromOpeningHours(toOpeningHours({ ...hours, wed: ['09:00', '10:00'] }) ?? null)).toEqual({ ...hours, wed: ['09:00', '10:00'] })
    expect(fromOpeningHours(null)).toEqual(emptyHours())
  })

  it('reads midnight closings and round-the-clock days', () => {
    expect(fromOpeningHours({ mon: [['09:00', '24:00']], tue: [['00:00', '24:00']] })).toEqual({ ...emptyHours(), mon: ['09:00', '00:00'], tue: ['00:00', '00:00'] })
  })

  it('fills the form from the place, empty where the place has nothing', () => {
    expect(toFormValues(organisation({ name: 'Kyiv Coffee', organisationTypeId: 'type-1', tel: '+381', founderCountryId: 'ru', locationCountryId: 'rs', services: ['Breakfast'], languages: ['Russian'] }))).toEqual({
      name: 'Kyiv Coffee',
      typeId: 'type-1',
      address: '',
      tel: '+381',
      email: '',
      website: '',
      description: '',
      services: ['Breakfast'],
      languages: ['Russian'],
      hours: emptyHours(),
      fromId: 'ru',
      toId: 'rs',
    })
    expect(toFormValues(organisation({ organisationTypeId: null, founderCountryId: null, locationCountryId: null }))).toMatchObject({ typeId: '', fromId: '', toId: '' })
  })

  it('sends every field — a cleared one as "" and no open day as {} — and the point only when it moved', () => {
    const place = organisation({ latitude: 44.8, longitude: 20.46 })
    const request = toUpdateRequest(values({ typeId: '', fromId: '', toId: '' }), { lat: 44.8, lng: 20.46 }, place)
    expect(request).toEqual({
      name: 'Kyiv Coffee',
      organisation_type_id: undefined,
      address: '',
      tel: '+381 11 123',
      email: '',
      website: '',
      description: 'Café',
      services: ['Breakfast'],
      languages: ['Russian'],
      location_country_id: undefined,
      founder_country_id: undefined,
    })
    expect(request).not.toHaveProperty('opening_hours')
    expect(toUpdateRequest(values(), { lat: 1, lng: 2 }, place)).toMatchObject({ latitude: 1, longitude: 2, location_country_id: 'rs' })
  })

  it('leaves stored hours alone unless they were edited — a split shift the editor cannot show survives', () => {
    const place = organisation({ openingHours: { mon: [['09:00', '13:00'], ['14:00', '18:00']] } })
    const shown = toFormValues(place)
    expect(toUpdateRequest(shown, { lat: place.latitude!, lng: place.longitude! }, place)).not.toHaveProperty('opening_hours')
    const edited = { ...shown, hours: { ...shown.hours, tue: ['10:00', '12:00'] as [string, string] } }
    expect(toUpdateRequest(edited, { lat: place.latitude!, lng: place.longitude! }, place).opening_hours).toEqual({ mon: [['09:00', '13:00']], tue: [['10:00', '12:00']] })
    // Closing every day is an edit too: it sends an empty week.
    expect(toUpdateRequest({ ...shown, hours: emptyHours() }, { lat: place.latitude!, lng: place.longitude! }, place).opening_hours).toEqual({})
  })
})
