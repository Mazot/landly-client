import clsx from 'clsx'

const SIZES = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' } as const

/** Spinning ring in the current text colour. With `label` it is announced as a status. */
export function Spinner({ size = 'md', label, className }: { size?: keyof typeof SIZES; label?: string; className?: string }) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx('inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none', SIZES[size], className)}
    />
  )
}
