import type { Meta, StoryObj } from '@storybook/react-vite'
import { TypeBar } from './TypeBar'

const meta = {
  title: 'Data display/TypeBar',
  component: TypeBar,
  args: {
    label: 'Places by type',
    segments: [
      { slug: 'embassy', label: 'Embassy', count: 4 },
      { slug: 'business', label: 'Business', count: 142 },
      { slug: 'helper', label: 'Helper', count: 24 },
      { slug: 'community', label: 'Community', count: 28 },
      { slug: 'volunteer', label: 'Volunteer', count: 36 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TypeBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UnknownTypeAndEmpty: Story = {
  args: {
    segments: [
      { slug: 'embassy', label: 'Embassy', count: 0 },
      { slug: 'other', label: 'Other', count: 3 },
    ],
  },
}

export const NoPlaces: Story = { args: { segments: [{ slug: 'embassy', label: 'Embassy', count: 0 }] } }
