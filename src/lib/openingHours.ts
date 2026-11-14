import { WEEKDAYS, type OpeningHours, type OpeningInterval, type Weekday } from '@/types/api'

/** `Intl` short weekday (en-US) → API weekday key. */
const FROM_SHORT_NAME: Record<string, Weekday> = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' }

const formatters = new Map<string, Intl.DateTimeFormat>()
/** One formatter per time zone: building one is slow and a list asks for every row. Throws on an unknown zone. */
function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

/** Weekday and `"HH:MM"` of `now` in an IANA time zone. */
function localTime(now: Date, timeZone: string): { weekday: Weekday; time: string } {
  const parts = formatterFor(timeZone).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)!.value
  return { weekday: FROM_SHORT_NAME[part('weekday')], time: `${part('hour')}:${part('minute')}` }
}

/**
 * Today's hours of a place, in the place's own time zone: the interval that is open
 * right now, else the next one today, else `null` (closed for the rest of the day).
 * `undefined` when the place has no hours, no time zone or an unknown one (the server's `openNow` is `null` too).
 * Times are `"HH:MM"` strings, so they compare as strings (the server does the same).
 */
export function hoursToday(openingHours: OpeningHours | null, timezone: string | null, now = new Date()): OpeningInterval | null | undefined {
  if (!openingHours || !timezone) return undefined
  let local: ReturnType<typeof localTime>
  try {
    local = localTime(now, timezone)
  } catch {
    return undefined // not an IANA zone: a bad value on one place must not break the list
  }
  const { weekday, time } = local
  const today = [...(openingHours[weekday] ?? [])].sort((a, b) => a[0].localeCompare(b[0]))
  return today.find(([open, close]) => open <= time && time < close) ?? today.find(([open]) => open > time) ?? null
}

/** `["09:00", "13:00"]` → `09:00–13:00`. */
export const formatInterval = ([open, close]: OpeningInterval) => `${open}–${close}`

/** A Monday (UTC) to name the weekdays from. */
const A_MONDAY = Date.UTC(2024, 0, 1)
const DAY_MS = 24 * 60 * 60 * 1000

/** Short weekday name in the reader's language: `mon` → "Mon" / "пн". */
export function weekdayLabel(weekday: Weekday, locale: string): string {
  const index = WEEKDAYS.indexOf(weekday)
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(A_MONDAY + index * DAY_MS))
}
