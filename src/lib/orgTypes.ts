/* Org-type colour metadata (mirror of design_files/components.jsx TYPE_META). */

export type OrgTypeKey =
  | 'embassy'
  | 'consulate'
  | 'business'
  | 'helper'
  | 'community'
  | 'volunteer'

export interface TypeMeta {
  label: string
  /** Solid dot / text colour (CSS var). */
  dot: string
  /** Soft background colour (CSS var). */
  soft: string
}

export const TYPE_META: Record<OrgTypeKey, TypeMeta> = {
  embassy: { label: 'Embassy', dot: 'var(--type-embassy)', soft: 'var(--type-embassy-soft)' },
  consulate: { label: 'Consulate', dot: 'var(--type-embassy)', soft: 'var(--type-embassy-soft)' },
  business: { label: 'Business', dot: 'var(--type-business)', soft: 'var(--type-business-soft)' },
  helper: { label: 'Helper', dot: 'var(--type-helper)', soft: 'var(--type-helper-soft)' },
  community: { label: 'Community', dot: 'var(--type-community)', soft: 'var(--type-community-soft)' },
  volunteer: { label: 'Volunteer', dot: 'var(--type-volunteer)', soft: 'var(--type-volunteer-soft)' },
}

/** Raw hex per type — needed where CSS vars can't be used (e.g. Mapbox marker DOM). */
export const TYPE_HEX: Record<OrgTypeKey, string> = {
  embassy: '#4A6D8C',
  consulate: '#4A6D8C',
  business: '#B8814A',
  helper: '#4F7F5C',
  community: '#8B5A8C',
  volunteer: '#C7613F',
}

/**
 * Map a server org-type string (`organisation_types.type`, free-form) onto one of
 * the five design taxonomy keys used for colour-coding. Falls back to 'business'.
 */
export function orgTypeKeyFromString(value?: string | null): OrgTypeKey {
  const s = (value ?? '').toLowerCase()
  if (/embass|consul|diplomat|gov/.test(s)) return 'embassy'
  if (/helper|relocat|support|legal|paperwork/.test(s)) return 'helper'
  if (/communit|cultur|church|club|diaspora/.test(s)) return 'community'
  if (/volunt/.test(s)) return 'volunteer'
  if (/business|shop|store|service|company|cafe|restaurant|bakery/.test(s)) return 'business'
  return 'business'
}

export type AddedByKey = 'official' | 'community' | 'volunteer'

export const ADDED_BY_META: Record<AddedByKey, { label: string; color: string }> = {
  official: { label: 'Official', color: 'var(--type-embassy)' },
  community: { label: 'Community', color: 'var(--type-community)' },
  volunteer: { label: 'Volunteer', color: 'var(--type-volunteer)' },
}
