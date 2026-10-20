import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import { StepList } from './StepList'

const meta = {
  title: 'Containers/StepList',
  component: StepList,
  args: {
    items: [
      { title: 'Sent for review', description: 'We got your place', state: 'done' },
      { title: 'Moderator check', description: 'Usually within a day', state: 'current', icon: 'flag', trailing: <Badge tone="warning">Pending</Badge> },
      { title: 'Live on the map', state: 'todo', icon: 'pin' },
    ],
    card: true,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Claim "What happens next". */
export const Numbered: Story = {
  args: {
    numbered: true,
    card: false,
    items: [{ title: 'Check your details' }, { title: 'Choose what to show' }, { title: 'Confirm' }],
  },
}
