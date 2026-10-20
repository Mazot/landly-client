import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ORGANISATION_TYPE_SLUGS } from '@/types/api'
import { Tag } from './Tag'

const meta = {
  title: 'Data display/Tag',
  component: Tag,
  args: { children: 'Anmeldung help', size: 'sm' },
  argTypes: { orgType: { control: 'select', options: [undefined, ...ORGANISATION_TYPE_SLUGS] } },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

/** Services, languages, skills. */
export const Default: Story = {}

export const WithIcon: Story = { args: { icon: 'languages', children: 'Russian', size: 'md' } }

export const OrgTypes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {ORGANISATION_TYPE_SLUGS.map((slug) => (
        <Tag key={slug} {...args} orgType={slug}>
          {slug}
        </Tag>
      ))}
    </div>
  ),
}

/** Editable list, e.g. services in the create form. */
export const Removable: Story = { args: { onRemove: fn(), children: 'Housing' } }
