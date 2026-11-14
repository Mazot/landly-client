import type { ServerDateTime } from '@/types/api'

const HAS_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/i

/** Parses a server timestamp (UTC without a timezone suffix) as UTC. */
export function parseServerDateTime(value: ServerDateTime): Date {
  return new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`)
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
/** Older than this, "N days ago" says less than the date itself. */
const AGO_MAX_DAYS = 30

/** A day in the reader's language: "2 Mar", with the year when it is not the current one. */
export function formatDay(value: ServerDateTime, locale: string, now = new Date()): string {
  const date = parseServerDateTime(value)
  const sameYear = date.getUTCFullYear() === now.getUTCFullYear()
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }), timeZone: 'UTC' }).format(date)
}

/**
 * How long ago, in the reader's language: "now", "5 minutes ago", "2 hours ago", "3 days ago";
 * after a month the day itself (`formatDay`). A timestamp slightly in the future (clock skew) is "now".
 */
export function formatAgo(value: ServerDateTime, locale: string, now = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - parseServerDateTime(value).getTime())
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (elapsed < MINUTE) return relative.format(0, 'second')
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour')
  if (elapsed < AGO_MAX_DAYS * DAY) return relative.format(-Math.floor(elapsed / DAY), 'day')
  return formatDay(value, locale, now)
}
