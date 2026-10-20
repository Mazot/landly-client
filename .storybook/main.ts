import type { StorybookConfig } from '@storybook/react-vite'

/**
 * Component workshop for the design system (`npm run storybook`).
 * The builder reuses the app's vite.config.ts (React + Tailwind plugins, `@/` alias),
 * so components render exactly as in the app.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
}

export default config
