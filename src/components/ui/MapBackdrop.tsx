import { Map } from '@vis.gl/react-google-maps'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { BACKDROP_VIEW, GOOGLE_MAPS_MAP_ID } from '@/lib/maps'

export interface MapBackdropProps {
  /**
   * `plain` — the map as is; `hero` — dimmed below `lg`, and from `lg` a fade
   * to the page background on the left so text on top stays readable.
   */
  variant?: 'plain' | 'hero'
  className?: string
}

/**
 * Google map of the world behind the landing and sign-in screens: a decorative
 * (`aria-hidden`, not interactive), `className`-sized map with a fixed view
 * (`BACKDROP_VIEW`). The map is mounted only while the block is on screen, so a copy
 * hidden by CSS at some breakpoint costs no map load; the water colour shows until the tiles arrive.
 * Needs the `<APIProvider>` of `main.tsx`.
 */
export function MapBackdrop({ variant = 'plain', className }: MapBackdropProps) {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return (
    <div ref={setNode} aria-hidden className={clsx('pointer-events-none overflow-hidden bg-country-water', className)}>
      <div className="relative size-full">
        {onScreen && (
          <Map
            className="size-full"
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={BACKDROP_VIEW.center}
            defaultZoom={BACKDROP_VIEW.zoom}
            disableDefaultUI
            isFractionalZoomEnabled
            gestureHandling="none"
            keyboardShortcuts={false}
            clickableIcons={false}
          />
        )}
        {/* Google's logo and copyright (bottom edge) must stay readable and cannot be moved: the overlays fade out towards the bottom instead of covering it. */}
        {variant === 'hero' && (
          <>
            <div className="absolute inset-0 bg-bg/78 mask-b-from-80% lg:hidden" />
            <div className="absolute inset-0 hidden bg-linear-to-r from-bg from-40% via-bg/70 via-55% to-transparent to-75% mask-b-from-80% lg:block" />
          </>
        )}
      </div>
    </div>
  )
}
