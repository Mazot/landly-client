/**
 * Landly design tokens — the single source of truth.
 *
 * `tailwind.config.ts` builds the theme from these objects (hex is kept here so
 * Tailwind opacity modifiers work: `bg-ink-1/35`). `tokens.css` mirrors the
 * colours as CSS variables; `tokens.test.ts` fails when the two drift apart.
 */
export const colors = {
  // Surface
  bg: { DEFAULT: '#F6F4EF', sunken: '#EFEBE2' },
  surface: { DEFAULT: '#FFFFFF', 2: '#FBF9F4', elev: '#FFFFFF' },
  // Ink
  ink: { 1: '#1B1A17', 2: '#3F3D38', 3: '#6E6A62', 4: '#9B9588' },
  // Border
  border: { 1: '#E8E2D6', 2: '#D9D2C2', strong: '#1B1A17' },
  // Brand — `ink` is text on `tint`
  accent: { DEFAULT: '#D97757', hover: '#C7613F', soft: '#F4D7C9', tint: '#FBEAE0', ink: '#8C3F24' },
  // Semantic — `soft` background, `fg` icons/badge text on it, `ink` body text on it
  success: { DEFAULT: '#4F7F5C', hover: '#41704D', soft: '#DDE9D9', ink: '#2F5A3A' },
  warning: { DEFAULT: '#C8923A', soft: '#F2E2BD', fg: '#8A6420', ink: '#6B4C14' },
  danger: { DEFAULT: '#B14C3A', soft: '#F3D9D3', ink: '#7A2F22' },
  info: { DEFAULT: '#4A6D8C', soft: '#DCE5EC', ink: '#2E4A63' },
  // Ratings, private notes, third-party brands
  star: { DEFAULT: '#C8923A', soft: '#FBF1DD' },
  note: '#FBF4E4',
  whatsapp: { DEFAULT: '#25A366', hover: '#1E8F58' },
  google: { blue: '#4285F4', green: '#34A853', yellow: '#FBBC05', red: '#EA4335' },
  // Org type accents — pinned, also used on map pins. Prefer OrganisationType.color when the server sends one.
  type: {
    embassy: { DEFAULT: '#4A6D8C', soft: '#D9E2EA' },
    business: { DEFAULT: '#B8814A', soft: '#F1E3D0' },
    helper: { DEFAULT: '#4F7F5C', soft: '#DDE9D9' },
    community: { DEFAULT: '#8B5A8C', soft: '#E8D9E9' },
    volunteer: { DEFAULT: '#C7613F', soft: '#F4D7C9' },
  },
  // Pastel country fills (map)
  country: { 1: '#F0E4D3', 2: '#E7E3D2', 3: '#E5DDC9', 4: '#EBD9C9', 5: '#DCE3D5', 6: '#E2DACB', 7: '#EFE0D0', water: '#E8E9E4' },
}

export const fontFamily = {
  sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'monospace'],
}

/** Added to Tailwind's scale (xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 stay as they are). */
export const fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]> = {
  label: ['13px', { lineHeight: '1.35' }],
  md: ['15px', { lineHeight: '1.5' }],
  'display-xs': ['28px', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
  'display-sm': ['32px', { lineHeight: '1.06', letterSpacing: '-0.01em' }],
  'display-md': ['40px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
  'display-lg': ['48px', { lineHeight: '1.04', letterSpacing: '-0.01em' }],
  'display-xl': ['56px', { lineHeight: '1.04', letterSpacing: '-0.01em' }],
  'display-2xl': ['72px', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
}

/** `rounded-r1` 6 · `r2` 10 · `r3` 14 · `r4` 20; `rounded-full` is the pill. */
export const borderRadius = { r1: '6px', r2: '10px', r3: '14px', r4: '20px' }

export const boxShadow = {
  1: '0 1px 2px rgba(20,18,14,0.04), 0 1px 1px rgba(20,18,14,0.03)',
  2: '0 4px 12px rgba(20,18,14,0.06), 0 2px 4px rgba(20,18,14,0.04)',
  3: '0 12px 32px rgba(20,18,14,0.10), 0 4px 12px rgba(20,18,14,0.06)',
  pop: '0 24px 56px rgba(20,18,14,0.18), 0 8px 20px rgba(20,18,14,0.08)',
}

/** Choices offered for `avatar_color` (data, stored on the user — not a theme colour). */
export const AVATAR_COLORS = ['#4A6D8C', '#C7613F', '#4F7F5C', '#8B5A8C', '#B8814A', '#1B1A17'] as const

type ColorTree = { [key: string]: string | ColorTree }

/** `{ ink: { 1: '#…' } }` → `{ '--ink-1': '#…' }`; `DEFAULT` keys collapse (`--bg`). */
export function colorVariables(tree: ColorTree = colors, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(tree)) {
    const name = key === 'DEFAULT' ? prefix : prefix ? `${prefix}-${key}` : key
    if (typeof value === 'string') out[`--${name}`] = value
    else Object.assign(out, colorVariables(value, name))
  }
  return out
}
