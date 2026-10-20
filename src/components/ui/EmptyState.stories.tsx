import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Containers/EmptyState',
  component: EmptyState,
  args: {
    icon: 'search',
    title: 'No places here yet',
    description: 'Zoom out or change the filters — or add the first one.',
    action: <Button variant="accent" icon="plus">Add a place</Button>,
    align: 'start',
    card: true,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Centred: Story = { args: { align: 'center', card: false } }

/** API error state with the status code. */
export const RateLimited: Story = {
  args: { icon: 'clock', tone: 'warning', code: '429', title: 'Too many attempts', description: 'Wait a minute and try again.', action: <Button variant="secondary">Retry</Button> },
}

export const Forbidden: Story = { args: { icon: 'eyeOff', tone: 'danger', code: '403', title: 'Moderators only', description: undefined, action: undefined } }
