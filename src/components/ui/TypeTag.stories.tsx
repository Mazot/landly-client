import type { Meta, StoryObj } from '@storybook/react-vite'
import { ORGANISATION_TYPE_SLUGS } from '@/types/api'
import { TypeTag } from './TypeTag'
import { colors } from './tokens/tokens'

const meta = {
  title: 'Data display/TypeTag',
  component: TypeTag,
  args: { slug: 'embassy', label: 'Embassy', variant: 'soft', dot: true },
  argTypes: { slug: { control: 'select', options: [...ORGANISATION_TYPE_SLUGS, 'other', null] } },
} satisfies Meta<typeof TypeTag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const KnownTypes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['soft', 'outline'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap gap-2">
          {ORGANISATION_TYPE_SLUGS.map((slug) => (
            <TypeTag key={slug} {...args} slug={slug} label={slug} variant={variant} />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** A type the client doesn't know: the colour comes from `OrganisationType.color`. */
export const ServerColour: Story = { args: { slug: 'club', label: 'Chess club', color: colors.type.community.DEFAULT } }

export const WithoutDot: Story = { args: { dot: false } }
