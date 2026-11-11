import type { Meta, StoryObj } from '@storybook/react-vite'
import { ORGANISATION_TYPE_SLUGS } from '@/types/api'
import { MapPin } from '../MapPin'

const meta = {
  title: 'Data display/MapPin',
  component: MapPin,
  args: { slug: 'embassy', label: 'Russian Embassy', selected: false },
  argTypes: { slug: { control: 'select', options: [...ORGANISATION_TYPE_SLUGS, 'other', null] } },
} satisfies Meta<typeof MapPin>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = { args: { selected: true } }

/** One pin per seeded type, then a custom-colour type and one without a type. */
export const AllTypes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-3">
      {ORGANISATION_TYPE_SLUGS.map((slug) => (
        <MapPin key={slug} slug={slug} label={slug} />
      ))}
      <MapPin slug="other" color="#8a5a9c" label="Custom type" />
      <MapPin slug={null} label="No type" />
    </div>
  ),
}
