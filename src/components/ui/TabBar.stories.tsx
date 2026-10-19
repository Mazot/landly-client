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
  // TabBar is not fixed itself: the screen puts it last in a full-height column.
  decorators: [
    (Story) => (
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1 p-4 text-sm text-ink-3">Screen content</main>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

/** Phone bottom navigation; the active tab follows the URL (`/` here). */
export const Default: Story = {}
