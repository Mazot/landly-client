/* Helpers for rendering server `Country` records (no hardcoded country tables). */
import type { Country } from '@/types/api'

/** Flag emoji for a country, with a neutral fallback. */
export const flagOf = (country?: Pick<Country, 'flag'> | null): string =>
  country?.flag || '🏳️'

/** Display name for a country, with a fallback. */
export const countryLabel = (country?: Pick<Country, 'name'> | null): string =>
  country?.name || '—'
