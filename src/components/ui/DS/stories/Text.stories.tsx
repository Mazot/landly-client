import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text, type TextSize, type TextTone } from '../Text'

const SIZES: TextSize[] = ['md', 'sm', 'label', 'xs']
const TONES: TextTone[] = ['strong', 'body', 'muted', 'faint', 'danger']

const meta = {
  title: 'Primitives/Text',
  component: Text,
  args: { children: 'Friendly staff, they speak Ukrainian and help with Anmeldung forms.' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      {SIZES.map((size) => (
        <Text key={size} {...args} size={size}>
          {size} — {args.children}
        </Text>
      ))}
    </div>
  ),
}

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      {TONES.map((tone) => (
        <Text key={tone} {...args} tone={tone}>
          {tone} — {args.children}
        </Text>
      ))}
    </div>
  ),
}

/** A centred muted line under a list. */
export const Caption: Story = { args: { size: 'label', tone: 'muted', align: 'center', children: 'Move the map to search this area' } }

/** A name in a narrow slot. */
export const Truncated: Story = { args: { as: 'span', tone: 'strong', weight: 'bold', truncate: true, children: 'Olena Kovalenko-Schmidt from the Ukrainian community centre' } }
