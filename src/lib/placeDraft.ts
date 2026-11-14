// The add-a-place form ↔ `POST /api/organisation/create`: the form's values, the request built
// from them and the helpers around the opening hours.
import { WEEKDAYS, type CreateOrganisationRequest, type OpeningHours, type OpeningInterval, type Organisation, type UpdateOrganisationRequest, type Uuid, type Weekday } from '@/types/api'

/** One day of the hours editor: `null` = closed. */
export type DayHours = OpeningInterval | null

export interface PlaceFormValues {
  name: string
  /** `OrganisationType.id`. */
  typeId: string
  address: string
  tel: string
  email: string
  website: string
  description: string
  services: string[]
  /** Language names, as organisations store them. */
  languages: string[]
  hours: Record<Weekday, DayHours>
  /** The corridor the place belongs to: the community's home country … */
  fromId: Uuid | ''
  /** … and the country the place is in. */
  toId: Uuid | ''
}

/** Where the place is, and the Google place it was picked from (only its id is ever sent). */
export interface PlaceLocation {
  lat: number
  lng: number
  googlePlaceId?: string
}

export const emptyHours = (): Record<Weekday, DayHours> => Object.fromEntries(WEEKDAYS.map((day) => [day, null])) as Record<Weekday, DayHours>

/** Midnight as the server writes a closing time, and as a day that runs on into the next one starts. */
const MIDNIGHT = '00:00'
const END_OF_DAY = '24:00'

/**
 * The editor's days from the stored hours — the inverse of `toOpeningHours`: a night that was split
 * at midnight (Monday …–24:00 + Tuesday 00:00–…) is one overnight interval of its first day again.
 * A day with several intervals shows its first one.
 */
export function fromOpeningHours(stored: OpeningHours | null): Record<Weekday, DayHours> {
  const intervals = Object.fromEntries(WEEKDAYS.map((day) => [day, [...(stored?.[day] ?? [])]])) as Record<Weekday, OpeningInterval[]>
  const hours = emptyHours()
  // Night pass: the first interval to reach midnight takes the next day's opening interval, which is its rest.
  const nights: Partial<Record<Weekday, string>> = {}
  // Sunday first, so its night is cut off Monday's list before Monday looks at its own.
  for (const day of [WEEKDAYS[WEEKDAYS.length - 1], ...WEEKDAYS.slice(0, -1)]) {
    const nextDay = WEEKDAYS[(WEEKDAYS.indexOf(day) + 1) % WEEKDAYS.length]
    const [first] = intervals[day]
    const [rest] = intervals[nextDay]
    if (first?.[1] !== END_OF_DAY || rest?.[0] !== MIDNIGHT || rest[1] === END_OF_DAY) continue
    nights[day] = rest[1]
    intervals[nextDay].shift()
  }
  for (const day of WEEKDAYS) {
    const [first] = intervals[day]
    if (first) hours[day] = [first[0], nights[day] ?? (first[1] === END_OF_DAY ? MIDNIGHT : first[1])]
  }
  return hours
}

/** The form's values for an existing place (the edit form's starting point). */
export function toFormValues(place: Organisation): PlaceFormValues {
  return {
    name: place.name,
    typeId: place.organisationTypeId ?? '',
    address: place.address ?? '',
    tel: place.tel ?? '',
    email: place.email ?? '',
    website: place.website ?? '',
    description: place.description ?? '',
    services: place.services,
    languages: place.languages,
    hours: fromOpeningHours(place.openingHours),
    fromId: place.founderCountryId ?? '',
    toId: place.locationCountryId ?? '',
  }
}

/** Monday of a week (1 Jan 2024 was a Monday): the dates `weekdayLabels` formats. */
const A_MONDAY_UTC = Date.UTC(2024, 0, 1)
const DAY_MS = 24 * 60 * 60 * 1000

/** Short weekday names in `locale`, in `WEEKDAYS` order ("Mon", "Пн", …) — from Intl, not a list of our own. */
export function weekdayLabels(locale: string): Record<Weekday, string> {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  return Object.fromEntries(WEEKDAYS.map((day, index) => [day, format.format(new Date(A_MONDAY_UTC + index * DAY_MS))])) as Record<Weekday, string>
}

/** The hours a day gets when it is switched on: those of the nearest open day before it, else none yet. */
export function hoursToCopy(hours: Record<Weekday, DayHours>, day: Weekday): OpeningInterval {
  const before = WEEKDAYS.slice(0, WEEKDAYS.indexOf(day)).reverse()
  const source = before.map((other) => hours[other]).find((interval): interval is OpeningInterval => interval !== null)
  return source ? [...source] : ['', '']
}

/** A time input cannot say 24:00: a day that closes at 00:00 closes at midnight. */
const closing = (close: string) => (close === '00:00' ? '24:00' : close)

/**
 * Whether a day's interval is complete and closes at another time than it opens. A close earlier
 * than the open is past midnight (a bar open 18:00–02:00); 00:00–00:00 is round the clock.
 */
export const isValidInterval = ([open, close]: OpeningInterval) => !!open && !!close && closing(close) !== open

/** Whether a (valid) interval closes after midnight, on the next day. */
export const isOvernight = ([open, close]: OpeningInterval) => !!open && !!close && closing(close) < open

/**
 * The open days as the server stores them (each interval within one day, open before close):
 * an overnight interval is split at midnight — Monday 18:00–02:00 is Monday 18:00–24:00 and
 * Tuesday 00:00–02:00 (Sunday's night goes on Monday). `undefined` when no day is open.
 */
export function toOpeningHours(hours: Record<Weekday, DayHours>): OpeningHours | undefined {
  const days: Partial<Record<Weekday, OpeningInterval[]>> = {}
  const add = (day: Weekday, interval: OpeningInterval) => (days[day] ??= []).push(interval)
  WEEKDAYS.forEach((day, index) => {
    const interval = hours[day]
    if (!interval) return
    const [open, close] = interval
    if (!isOvernight(interval)) return add(day, [open, closing(close)])
    add(day, [open, '24:00'])
    add(WEEKDAYS[(index + 1) % WEEKDAYS.length], ['00:00', close])
  })
  const open = WEEKDAYS.flatMap((day) => (days[day] ? [[day, days[day].sort((a, b) => a[0].localeCompare(b[0]))] as const] : []))
  return open.length ? Object.fromEntries(open) : undefined
}

const text = (value: string) => value.trim() || undefined

/** The create request: trimmed text, empty fields left out, the corridor's countries, the point. */
export function toCreateRequest(values: PlaceFormValues, location: PlaceLocation): CreateOrganisationRequest {
  return {
    name: values.name.trim(),
    organisation_type_id: values.typeId || undefined,
    address: text(values.address),
    tel: text(values.tel),
    email: text(values.email),
    website: text(values.website),
    description: text(values.description),
    services: values.services,
    languages: values.languages,
    opening_hours: toOpeningHours(values.hours),
    location_country_id: values.toId || undefined,
    founder_country_id: values.fromId || undefined,
    latitude: location.lat,
    longitude: location.lng,
    google_place_id: location.googlePlaceId,
  }
}

/**
 * What to search Google for when a Google Maps link is pasted: the place name in a
 * `/maps/place/<name>/…` link, else the text as it is (short `maps.app.goo.gl` links carry no name).
 */
export function searchTextFromMapsLink(input: string): string {
  const match = /\/maps\/place\/([^/@?]+)/.exec(input)
  if (!match) return input
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '))
  } catch {
    return input
  }
}

/**
 * The update request (`PUT /organisation/update/{id}`, omitted fields keep their value): every field
 * the form shows is sent — a cleared one as `""`, no open day as `{}` — so a deletion is saved too.
 * The point goes only when it was moved, so an untouched place keeps its Google-sourced coordinates.
 */
export function toUpdateRequest(values: PlaceFormValues, location: PlaceLocation, place: Organisation): UpdateOrganisationRequest {
  const moved = location.lat !== place.latitude || location.lng !== place.longitude
  return {
    name: values.name.trim(),
    organisation_type_id: values.typeId || undefined,
    address: values.address.trim(),
    tel: values.tel.trim(),
    email: values.email.trim(),
    website: values.website.trim(),
    description: values.description.trim(),
    services: values.services,
    languages: values.languages,
    opening_hours: toOpeningHours(values.hours) ?? {},
    location_country_id: values.toId || undefined,
    founder_country_id: values.fromId || undefined,
    ...(moved && { latitude: location.lat, longitude: location.lng }),
  }
}
