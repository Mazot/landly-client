import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Menu } from './Menu'

const meta = {
  title: 'Containers/Menu',
  component: Menu,
  args: {
    label: 'Place actions',
    items: [
      { label: 'Edit', icon: 'pencil', onSelect: fn() },
      { label: 'Share link', icon: 'link', onSelect: fn() },
      'divider',
      { label: 'Report a problem', icon: 'flag', tone: 'danger', onSelect: fn() },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
