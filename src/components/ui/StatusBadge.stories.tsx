import type { Meta, StoryObj } from '@storybook/react-vite'
import { ORGANISATION_STATUSES, PERSON_STATUSES } from '@/types/api'
import { StatusBadge } from './StatusBadge'

const STATUSES = [...new Set([...ORGANISATION_STATUSES, ...PERSON_STATUSES])]

const meta = {
  title: 'Data display/StatusBadge',
  component: StatusBadge,
  args: { status: 'pending' },
  argTypes: { status: { control: 'select', options: STATUSES } },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every moderation / claim status of places and people, with its translated label. */
export const AllStatuses: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((status) => (
        <StatusBadge key={status} {...args} status={status} />
      ))}
    </div>
  ),
}

export const CustomLabel: Story = { args: { status: 'awaiting', label: 'Waiting for Daria' } }
