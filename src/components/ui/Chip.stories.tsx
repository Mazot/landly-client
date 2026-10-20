import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ORGANISATION_TYPE_SLUGS } from '@/types/api'
import { Chip } from './Chip'

const meta = {
  title: 'Forms/Chip',
  component: Chip,
  args: { children: 'Open now', selected: false, size: 'md', onClick: fn() },
  argTypes: { orgType: { control: 'select', options: [undefined, ...ORGANISATION_TYPE_SLUGS] } },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = { args: { selected: true, icon: 'check' } }

export const OrgTypes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {ORGANISATION_TYPE_SLUGS.map((slug, i) => (
        <Chip key={slug} {...args} orgType={slug} selected={i % 2 === 0}>
          {slug}
        </Chip>
      ))}
    </div>
  ),
}

/** "+ Add" chip at the end of a group. */
export const Add: Story = { args: { add: true, children: 'Add language' } }

export const Small: Story = { args: { size: 'sm' } }
