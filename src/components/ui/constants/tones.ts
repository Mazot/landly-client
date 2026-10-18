/** Colour tones shared by Badge, Callout, IconTile and EmptyState. */
export const TONES = ['neutral', 'surface', 'success', 'warning', 'danger', 'info', 'accent', 'note', 'dark'] as const
export type Tone = (typeof TONES)[number]

/** Per tone: `soft` = background + border, `fg` = icon / badge text, `ink` = body text on the soft background. */
export const TONE_CLASSES: Record<Tone, { soft: string; fg: string; ink: string }> = {
  neutral: { soft: 'border-border-1 bg-surface-2', fg: 'text-ink-3', ink: 'text-ink-3' },
  surface: { soft: 'border-border-1 bg-surface', fg: 'text-ink-2', ink: 'text-ink-2' },
  success: { soft: 'border-transparent bg-success-soft', fg: 'text-success', ink: 'text-success-ink' },
  warning: { soft: 'border-transparent bg-warning-soft', fg: 'text-warning-fg', ink: 'text-warning-ink' },
  danger: { soft: 'border-transparent bg-danger-soft', fg: 'text-danger', ink: 'text-danger-ink' },
  info: { soft: 'border-transparent bg-info-soft', fg: 'text-info', ink: 'text-info-ink' },
  accent: { soft: 'border-transparent bg-accent-tint', fg: 'text-accent-hover', ink: 'text-accent-ink' },
  note: { soft: 'border-transparent bg-note', fg: 'text-warning-fg', ink: 'text-ink-2' },
  dark: { soft: 'border-transparent bg-ink-1', fg: 'text-surface', ink: 'text-surface' },
}
