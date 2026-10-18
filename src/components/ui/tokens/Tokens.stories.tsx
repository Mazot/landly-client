import type { Meta, StoryObj } from '@storybook/react-vite'
import { AVATAR_COLORS, borderRadius, colorVariables } from './tokens'

/** The design tokens from `tokens.ts` — what Tailwind classes like `bg-ink-1`, `rounded-r3`, `shadow-pop` resolve to. */
const meta = {
  title: 'Foundations/Tokens',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// Class names are written out in full: Tailwind only generates classes it finds as literals.
const TEXT_SIZES = ['text-xs', 'text-label', 'text-sm', 'text-md', 'text-base', 'text-lg', 'text-xl', 'text-2xl'] as const
const DISPLAY_SIZES = ['text-display-xs', 'text-display-sm', 'text-display-md', 'text-display-lg', 'text-display-xl'] as const
const RADII = { r1: 'rounded-r1', r2: 'rounded-r2', r3: 'rounded-r3', r4: 'rounded-r4' } satisfies Record<keyof typeof borderRadius, string>
const SHADOWS = ['shadow-1', 'shadow-2', 'shadow-3', 'shadow-pop'] as const

const swatch = (value: string) => ({ backgroundColor: value })

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Object.entries(colorVariables()).map(([name, value]) => (
        <div key={name} className="min-w-0 rounded-r3 border border-border-1 bg-surface p-2">
          <div className="h-12 rounded-r2 border border-border-1" style={swatch(value)} />
          <div className="mt-2 truncate font-mono text-xs text-ink-1">{name.slice(2)}</div>
          <div className="font-mono text-xs text-ink-3">{value}</div>
        </div>
      ))}
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-ink-1">
      {TEXT_SIZES.map((cls) => (
        <div key={cls} className={cls}>
          <span className="mr-3 font-mono text-xs text-ink-3">{cls}</span>Where people from Russia live
        </div>
      ))}
      {DISPLAY_SIZES.map((cls) => (
        <div key={cls} className={`font-display ${cls}`}>
          <span className="mr-3 font-mono text-xs text-ink-3">{cls}</span>Find your people
        </div>
      ))}
    </div>
  ),
}

export const RadiiAndShadows: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        {Object.entries(RADII).map(([key, cls]) => (
          <div key={key} className={`${cls} flex size-24 flex-col items-center justify-center border border-border-2 bg-surface text-xs text-ink-2`}>
            <span className="font-mono">{cls}</span>
            <span className="text-ink-3">{borderRadius[key as keyof typeof borderRadius]}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-6">
        {SHADOWS.map((cls) => (
          <div key={cls} className={`${cls} flex size-28 items-center justify-center rounded-r3 bg-surface font-mono text-xs text-ink-2`}>
            {cls}
          </div>
        ))}
      </div>
    </div>
  ),
}

export const AvatarColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {AVATAR_COLORS.map((c) => (
        <div key={c} className="size-12 rounded-full" style={swatch(c)} title={c} />
      ))}
    </div>
  ),
}
