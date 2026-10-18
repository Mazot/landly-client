import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavTabs } from './NavTabs'

const meta = {
  title: 'Shell/NavTabs',
  component: NavTabs,
  args: {
    label: 'Main',
    items: [
      { to: '/', label: 'Map', icon: 'pin', end: true },
      { to: '/people', label: 'People', icon: 'users' },
      { to: '/countries', label: 'Countries', icon: 'globe' },
      { to: '/saved', label: 'Saved', icon: 'bookmark' },
    ],
  },
  globals: { viewport: { value: 'desktop' } },
} satisfies Meta<typeof NavTabs>

export default meta
type Story = StoryObj<typeof meta>

/** Top-bar navigation for tablet / desktop. */
export const Default: Story = {}

/** Inactive items show only their icon. */
export const Compact: Story = { args: { compact: true }, globals: { viewport: { value: 'tablet' } } }
