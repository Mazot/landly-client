/* Maps a server `Organization` (+ reference data) into a display-ready shape for the v2 UI. */
import type { Organization, OrganizationType, Country } from '@/types/api'
import { orgTypeKeyFromString, TYPE_HEX, type OrgTypeKey } from './orgTypes'

export interface DisplayOrg {
  id: string
  name: string
  address?: string
  description?: string
  tel?: string
  email?: string
  typeKey: OrgTypeKey
  /** Server-provided title for the org type, if any. */
  typeLabel?: string
  /** Server-provided colour, else the design hex for the type key. */
  typeColor: string
  countryName?: string
  /** [lng, lat] — only present when the org has coordinates. */
  coord?: [number, number]
  initials: string
}

export const byId = <T extends { id: string }>(items?: T[]): Map<string, T> =>
  new Map((items ?? []).map((i) => [i.id, i]))

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function toDisplayOrg(
  org: Organization,
  typeById: Map<string, OrganizationType>,
  countryById: Map<string, Country>
): DisplayOrg {
  const ot = org.organisationTypeId ? typeById.get(org.organisationTypeId) : undefined
  const typeKey = orgTypeKeyFromString(ot?.type)
  const country = org.locationCountryId ? countryById.get(org.locationCountryId) : undefined
  const coord: [number, number] | undefined =
    org.longitude != null && org.latitude != null ? [org.longitude, org.latitude] : undefined

  return {
    id: org.id,
    name: org.name,
    address: org.address,
    description: org.description,
    tel: org.tel,
    email: org.email,
    typeKey,
    typeLabel: ot?.title || undefined,
    typeColor: ot?.color || TYPE_HEX[typeKey],
    countryName: country?.name,
    coord,
    initials: initialsOf(org.name),
  }
}
