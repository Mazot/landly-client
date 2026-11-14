import { colors } from '@/components/ui'
import type { OrganisationType } from '@/types/api'

/**
 * The colour of an organisation type: its own `color` from the API, else the design token of a
 * seeded slug, else none (the caller's default).
 */
export function orgTypeColor(type: Pick<OrganisationType, 'slug' | 'color'> | undefined): string | undefined {
  if (type?.color) return type.color
  return type?.slug ? colors.type[type.slug as keyof typeof colors.type]?.DEFAULT : undefined
}
