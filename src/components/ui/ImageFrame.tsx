import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

const RATIOS = { square: 'aspect-square', photo: 'aspect-4/3', wide: 'aspect-video', banner: 'aspect-5/2' } as const

export interface ImageFrameProps {
  /** `OrganisationImage.url`; without it a neutral placeholder is shown. */
  src?: string | null
  /** Required with `src`; `""` for decorative photos. */
  alt: string
  ratio?: keyof typeof RATIOS
  rounded?: boolean
  /** Overlay in the top-left corner (e.g. a "Primary" badge). */
  badge?: ReactNode
  /** Overlay in the top-right corner (e.g. a menu button). */
  action?: ReactNode
  className?: string
}

/** Photo with a fixed aspect ratio, lazy-loaded, with placeholder and overlays. */
export function ImageFrame({ src, alt, ratio = 'photo', rounded = true, badge, action, className }: ImageFrameProps) {
  return (
    <div className={clsx('relative w-full overflow-hidden border border-border-1 bg-surface-2', RATIOS[ratio], rounded && 'rounded-r3', className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-ink-4">
          <Icon name="image" size={28} />
        </span>
      )}
      {badge && <span className="absolute top-2 left-2">{badge}</span>}
      {action && <span className="absolute top-2 right-2">{action}</span>}
    </div>
  )
}
