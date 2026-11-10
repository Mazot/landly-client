import clsx from 'clsx'
import { isKnownOrgType, ORG_TYPE_CLASSES } from './constants/orgTypes'

export interface MapPinProps {
  /** `OrganisationType.slug`; seeded slugs use the type tokens. */
  slug: string | null
  /** Accessible name — the place's name. */
  label: string
  /** `OrganisationType.color` — used for types without a seeded slug. */
  color?: string | null
  /** The place whose card is open: larger, with a ring and its name above. */
  selected?: boolean
}

/** Round pin of a place on the map, coloured by its organisation type (child of `<AdvancedMarker>`). */
export function MapPin({ slug, label, color, selected = false }: MapPinProps) {
  const known = isKnownOrgType(slug) ? ORG_TYPE_CLASSES[slug] : null
  // Custom types only have a hex from the server: apply it inline (data colour).
  const custom = !known && color ? color : null
  return (
    <span className="relative block">
      {selected && (
        <span aria-hidden="true" className="absolute bottom-full left-1/2 mb-3 block max-w-64 -translate-x-1/2 truncate rounded-r2 bg-ink-1 px-3 py-1.5 text-label leading-none font-bold whitespace-nowrap text-surface shadow-3">
          {label}
        </span>
      )}
      <span
        role="img"
        aria-label={label}
        className={clsx(
          'block size-4.5 rounded-full border-2 border-surface shadow-2 transition-transform motion-reduce:transition-none',
          known ? known.dot : !custom && 'bg-ink-3',
          selected && 'scale-150 ring-2 ring-ink-1',
        )}
        style={custom ? { backgroundColor: custom } : undefined}
      />
    </span>
  )
}
