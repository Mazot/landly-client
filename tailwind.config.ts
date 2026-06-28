import type { Config } from 'tailwindcss'

/**
 * Landly v2 design tokens.
 *
 * Token values are mirrored as CSS custom properties in `src/index.css`
 * (matching `design_files/tokens.css`). Hex is hardcoded here as well so
 * Tailwind's opacity modifiers work on custom tokens (e.g. `bg-ink-1/28`,
 * `bg-surface/85`). Keep the two files in sync — both come from the same spec.
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Breakpoints aligned with design targets:
      //   sm  = 390px  iPhone 14 Pro
      //   md  = 834px  iPad Air portrait
      //   lg  = 1024px tablet landscape
      //   xl  = 1280px desktop
      //   2xl = 1440px desktop wide
      screens: {
        sm:    '390px',
        md:    '834px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1440px',
      },

      colors: {
        // Legacy palette — kept for pages not yet migrated to v2.
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },

        // ===== v2 design tokens =====
        // Surface
        bg: {
          DEFAULT: '#F6F4EF',
          sunken: '#EFEBE2',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#FBF9F4',
          elev: '#FFFFFF',
        },

        // Ink
        ink: {
          1: '#1B1A17',
          2: '#3F3D38',
          3: '#6E6A62',
          4: '#9B9588',
        },

        // Border
        border: {
          1: '#E8E2D6',
          2: '#D9D2C2',
          strong: '#1B1A17',
        },

        // Brand
        accent: {
          DEFAULT: '#D97757',
          hover: '#C7613F',
          soft: '#F4D7C9',
          tint: '#FBEAE0',
        },

        // Semantic
        success: {
          DEFAULT: '#4F7F5C',
          soft: '#DDE9D9',
        },
        warning: {
          DEFAULT: '#C8923A',
          soft: '#F2E2BD',
        },
        danger: '#B14C3A',
        info: {
          DEFAULT: '#4A6D8C',
          soft: '#DCE5EC',
        },

        // Org type accents (pastel) — pinned, also used on map
        type: {
          embassy: { DEFAULT: '#4A6D8C', soft: '#D9E2EA' },
          business: { DEFAULT: '#B8814A', soft: '#F1E3D0' },
          helper: { DEFAULT: '#4F7F5C', soft: '#DDE9D9' },
          community: { DEFAULT: '#8B5A8C', soft: '#E8D9E9' },
          volunteer: { DEFAULT: '#C7613F', soft: '#F4D7C9' },
        },

        // Pastel country fills (map)
        country: {
          1: '#F0E4D3',
          2: '#E7E3D2',
          3: '#E5DDC9',
          4: '#EBD9C9',
          5: '#DCE3D5',
          6: '#E2DACB',
          7: '#EFE0D0',
          water: '#E8E9E4',
        },
      },

      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'monospace'],
      },

      borderRadius: {
        r1: '6px',
        r2: '10px',
        r3: '14px',
        r4: '20px',
        // `rounded-full` (9999px) already covers --r-pill
      },

      boxShadow: {
        1: '0 1px 2px rgba(20,18,14,0.04), 0 1px 1px rgba(20,18,14,0.03)',
        2: '0 4px 12px rgba(20,18,14,0.06), 0 2px 4px rgba(20,18,14,0.04)',
        3: '0 12px 32px rgba(20,18,14,0.10), 0 4px 12px rgba(20,18,14,0.06)',
        pop: '0 24px 56px rgba(20,18,14,0.18), 0 8px 20px rgba(20,18,14,0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
