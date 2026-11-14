import { compact } from 'es-toolkit'
import { isKnownOrgType, type ChipOption } from '@/components/ui'
import type { OrganisationType } from '@/types/api'

/** One chip per organisation type that has a slug (only those can be filtered on), in the server's order. */
export const typeChipOptions = (orgTypes: OrganisationType[]): ChipOption[] =>
  compact(orgTypes.map((type) => type.slug && { value: type.slug, label: type.title ?? type.type, ...(isKnownOrgType(type.slug) && { orgType: type.slug }) }))
