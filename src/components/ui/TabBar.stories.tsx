import type { Meta, StoryObj } from '@storybook/react-vite'
import { TabBar } from './TabBar'

const meta = {
  title: 'Shell/TabBar',
  component: TabBar,
  args: {
    label: 'Main',
    items: [
      { to: '/', label: 'Map', icon: 'pin', end: true },
      { to: '/people', label: 'People', icon: 'users' },
      { to: '/add', label: 'Add', icon: 'plus', primary: true },
      { to: '/saved', label: 'Saved', icon: 'bookmark' },
      { to: '/me', label: 'Profile', icon: 'user' },
    ],
  },
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone' } },
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

/** Phone bottom navigation; the active tab follows the URL (`/` here). */
export const Default: Story = {}
