import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { IconButton } from './IconButton'

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  args: { icon: 'bookmark', label: 'Save place', variant: 'plain', size: 'md', onClick: fn() },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} variant="plain" />
      <IconButton {...args} variant="outline" />
      <IconButton {...args} variant="floating" />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>
  ),
}

/** Toggle state, e.g. a saved bookmark. */
export const Pressed: Story = { args: { pressed: true, variant: 'outline' } }

/** Floating map control. */
export const MapControl: Story = { args: { icon: 'locate', label: 'My location', variant: 'floating', size: 'lg' } }
