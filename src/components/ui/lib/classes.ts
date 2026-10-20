/** Class fragments reused by several DS components (token-only, scanned by Tailwind). */
export const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-1'

/** Bordered field box shared by TextField, TextArea and Select. */
export const FIELD_BOX =
  'relative flex min-w-0 items-center gap-2.5 rounded-r2 border transition-colors focus-within:border-ink-1 focus-within:ring-4 focus-within:ring-ink-1/8'
export const FIELD_VARIANTS = {
  default: 'border-border-2 bg-surface',
  filled: 'border-border-1 bg-surface-2',
  floating: 'rounded-r3 border-transparent bg-surface shadow-2',
} as const
// Heights include the 1 px borders: h-11.5 (46 px) leaves a 44 px control for touch.
export const FIELD_SIZES = { md: 'h-11.5 px-3.5', sm: 'h-11.5 px-3 lg:h-10' } as const
export const FIELD_ERROR = 'border-danger focus-within:border-danger focus-within:ring-danger/12'
/** 16 px on phones so iOS does not zoom into the field, 14 px from `lg`. */
export const FIELD_CONTROL =
  'h-full min-w-0 flex-1 appearance-none bg-transparent text-base font-medium text-ink-1 outline-none placeholder:text-ink-4 disabled:cursor-not-allowed lg:text-sm'
