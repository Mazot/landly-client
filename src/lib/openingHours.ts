import type { OpeningHours, OpeningInterval, Weekday } from '@/types/api'

const WEEKDAYS: Record<string, Weekday> = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' }

/** Weekday and `"HH:MM"` of `now` in an IANA time zone. */
function localTime(now: Date, timeZone: string): { weekday: Weekday; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)!.value
  return { weekday: WEEKDAYS[part('weekday')], time: `${part('hour')}:${part('minute')}` }
}

/**
 * Today's hours of a place, in the place's own time zone: the interval that is open
 * right now, else the next one today, else `null` (closed for the rest of the day).
 * `undefined` when the place has no hours or no time zone (the server's `openNow` is `null` too).
 * Times are `"HH:MM"` strings, so they compare as strings (the server does the same).
 */
export function hoursToday(openingHours: OpeningHours | null, timezone: string | null, now = new Date()): OpeningInterval | null | undefined {
  if (!openingHours || !timezone) return undefined
  const { weekday, time } = localTime(now, timezone)
  const today = [...(openingHours[weekday] ?? [])].sort((a, b) => a[0].localeCompare(b[0]))
  return today.find(([open, close]) => open <= time && time < close) ?? today.find(([open]) => open > time) ?? null
}

/** `["09:00", "13:00"]` → `09:00–13:00`. */
export const formatInterval = ([open, close]: OpeningInterval) => `${open}–${close}`
