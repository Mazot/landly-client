import type { ServerDateTime } from '@/types/api'

const HAS_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/i

/** Parses a server timestamp (UTC without a timezone suffix) as UTC. */
export function parseServerDateTime(value: ServerDateTime): Date {
  return new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`)
}
