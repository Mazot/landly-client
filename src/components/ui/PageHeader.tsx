import clsx from 'clsx'
import type { ReactNode } from 'react'

export type PageHeaderSize = 'sm' | 'md' | 'lg' | 'xl'

// Mobile-first: each size steps up at md / lg.
const SIZES: Record<PageHeaderSize, string> = {
  sm: 'text-display-xs md:text-display-sm',
  md: 'text-display-sm lg:text-display-md',
  lg: 'text-display-sm md:text-display-md lg:text-display-lg',
  xl: 'text-display-md md:text-display-lg lg:text-display-xl',
}

export interface PageHeaderProps {
  /** Uppercase line above the title. */
  eyebrow?: ReactNode
  /** Instrument Serif; wrap a word in `<Accent>` for the terracotta italic. */
  title: ReactNode
  lede?: ReactNode
  /** Buttons on the right; wrap under the title on narrow screens. */
  actions?: ReactNode
  /** Back link above everything (a TextLink). */
  back?: ReactNode
  size?: PageHeaderSize
  as?: 'h1' | 'h2'
  className?: string
}

/** Terracotta italic word inside a display title: `Where people from <Accent>Russia</Accent> live`. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="text-accent italic">{children}</em>
}

/** Eyebrow + display title + lede + actions — the top of every page. */
export function PageHeader({ eyebrow, title, lede, actions, back, size = 'lg', as: Heading = 'h1', className }: PageHeaderProps) {
  return (
    <header className={clsx('flex flex-wrap items-end justify-between gap-x-6 gap-y-4', className)}>
      <div className="min-w-0 grow basis-80">
        {back && <div className="mb-3">{back}</div>}
        {eyebrow && <div className="mb-2 text-label leading-none font-medium tracking-wider text-ink-3 uppercase">{eyebrow}</div>}
        <Heading className={clsx('m-0 font-display font-normal text-balance text-ink-1', SIZES[size])}>{title}</Heading>
        {lede && <p className="m-0 mt-2.5 max-w-prose text-sm font-medium text-pretty text-ink-3">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
