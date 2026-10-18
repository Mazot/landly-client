import clsx from 'clsx'
import { isKnownOrgType, ORG_TYPE_CLASSES } from './constants/orgTypes'

export interface TypeTagProps {
  /** `OrganisationType.slug`; seeded slugs use the type tokens. */
  slug: string | null
  /** `OrganisationType.title` (already translated by the caller). */
  label: string
  /** `OrganisationType.color` — used for types without a seeded slug. */
  color?: string | null
  variant?: 'soft' | 'outline'
  dot?: boolean
}

/** Organisation type label with its colour (embassy, business, helper, community, volunteer, custom). */
export function TypeTag({ slug, label, color, variant = 'soft', dot = true }: TypeTagProps) {
  const known = isKnownOrgType(slug) ? ORG_TYPE_CLASSES[slug] : null
  const soft = variant === 'soft'
  // Custom types only have a hex from the server: apply it inline (data colour).
  const custom = !known && color ? color : null
  return (
    <span
      className={clsx(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs leading-none font-semibold tracking-wide whitespace-nowrap',
        soft ? 'border-transparent' : 'border-border-1 bg-surface text-ink-2',
        soft && (known ? [known.soft, known.text] : !custom && 'bg-surface-2 text-ink-3'),
      )}
      style={soft && custom ? { color: custom, backgroundColor: `color-mix(in srgb, ${custom} 16%, white)` } : undefined}
    >
      {dot && (
        <span
          className={clsx('size-1.75 rounded-full', known ? known.dot : !custom && 'bg-ink-4')}
          style={custom ? { backgroundColor: custom } : undefined}
        />
      )}
      {label}
    </span>
  )
}
