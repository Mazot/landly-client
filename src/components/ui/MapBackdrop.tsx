import clsx from 'clsx'

export interface MapBackdropProps {
  /**
   * `plain` — the map as is; `hero` — dimmed below `lg`, and from `lg` a fade
   * to the page background on the left so text on top stays readable.
   */
  variant?: 'plain' | 'hero'
  className?: string
}

/**
 * Map area behind the landing and sign-in screens (`aria-hidden`), sized by `className`.
 * Placeholder: a flat water-coloured box until the Google map is mounted here.
 */
export function MapBackdrop({ variant = 'plain', className }: MapBackdropProps) {
  return (
    <div aria-hidden className={clsx('overflow-hidden bg-country-water', className)}>
      <div className="relative size-full">
        {variant === 'hero' && <div className="absolute inset-0 hidden bg-linear-to-r from-bg from-40% via-bg/70 via-55% to-transparent to-75% lg:block" />}
      </div>
    </div>
  )
}
