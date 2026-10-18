import type { Decorator, Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { colors } from '../src/components/ui/tokens/tokens'
import { LOCALES, type Locale } from '../src/types/api'
import '../src/index.css'
import { LocaleSync } from './LocaleSync'

const LOCALE_TITLES: Record<Locale, string> = { en: 'English', ru: 'Русский', uk: 'Українська' }

/** Router context for TextLink / ListItem / TabBar / NavTabs links. */
const withProviders: Decorator = (Story, { globals }) => (
  <LocaleSync locale={(globals.locale as Locale | undefined) ?? 'en'}>
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  </LocaleSync>
)

const preview: Preview = {
  decorators: [withProviders],
  tags: ['autodocs'],
  globalTypes: {
    locale: {
      description: 'UI language',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: LOCALES.map((value) => ({ value, title: LOCALE_TITLES[value] })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'en',
    backgrounds: { value: 'app' },
  },
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i }, sort: 'requiredFirst' },
    // The sizes the design-system skill verifies (§5): phone first, then md / lg / desktop.
    viewport: {
      options: {
        phoneSm: { name: 'Phone 320', styles: { width: '320px', height: '640px' }, type: 'mobile' },
        phone: { name: 'Phone 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
        tablet: { name: 'Tablet 768 (md)', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        laptop: { name: 'Laptop 1024 (lg)', styles: { width: '1024px', height: '768px' }, type: 'desktop' },
        desktop: { name: 'Desktop 1440', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
    backgrounds: {
      options: {
        app: { name: 'App (bg)', value: colors.bg.DEFAULT },
        sunken: { name: 'Sunken', value: colors.bg.sunken },
        surface: { name: 'Surface', value: colors.surface.DEFAULT },
        dark: { name: 'Ink', value: colors.ink[1] },
      },
    },
    a11y: { test: 'error' },
  },
}

export default preview
