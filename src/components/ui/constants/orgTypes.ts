import { ORGANISATION_TYPE_SLUGS, type KnownOrganisationTypeSlug } from '@/types/api'

/** Token classes per seeded org type slug (`GET /common/org_types` → `slug`). */
export const ORG_TYPE_CLASSES: Record<KnownOrganisationTypeSlug, { dot: string; soft: string; text: string }> = {
  embassy: { dot: 'bg-type-embassy', soft: 'bg-type-embassy-soft', text: 'text-type-embassy' },
  business: { dot: 'bg-type-business', soft: 'bg-type-business-soft', text: 'text-type-business' },
  helper: { dot: 'bg-type-helper', soft: 'bg-type-helper-soft', text: 'text-type-helper' },
  community: { dot: 'bg-type-community', soft: 'bg-type-community-soft', text: 'text-type-community' },
  volunteer: { dot: 'bg-type-volunteer', soft: 'bg-type-volunteer-soft', text: 'text-type-volunteer' },
}

export const isKnownOrgType = (slug: string | null | undefined): slug is KnownOrganisationTypeSlug =>
  (ORGANISATION_TYPE_SLUGS as readonly (string | null | undefined)[]).includes(slug)
