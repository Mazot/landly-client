import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Segmented } from './Segmented'

const meta = {
  title: 'Forms/Segmented',
  component: Segmented,
  args: {
    label: 'View',
    options: [
      { value: 'map', label: 'Map', icon: 'pin' },
      { value: 'list', label: 'List', icon: 'menu' },
    ],
    defaultValue: 'map',
    size: 'md',
    onChange: fn(),
  },
} satisfies Meta<typeof Segmented>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** With counters — saved items by kind. */
export const WithCounts: Story = {
  args: {
    label: 'Saved',
    options: [
      { value: 'org', label: 'Places', count: 12 },
      { value: 'person', label: 'People', count: 3 },
      { value: 'country', label: 'Countries', count: 1 },
    ],
    defaultValue: 'org',
  },
}

export const Block: Story = { args: { block: true } }

export const Small: Story = { args: { size: 'sm' } }
