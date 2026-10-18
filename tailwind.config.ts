import type { Config } from 'tailwindcss'
import { borderRadius, boxShadow, colors, fontFamily, fontSize } from './src/components/ui/tokens/tokens'

/**
 * Landly design tokens live in `src/components/ui/tokens/tokens.ts` (single
 * source of truth) and are mirrored as CSS variables in `tokens.css` next to it.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy palette — kept for pages not yet migrated to v2. Do not use in new code.
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
        ...colors,
      },
      fontFamily,
      fontSize,
      borderRadius,
      boxShadow,
    },
  },
  plugins: [],
} satisfies Config
