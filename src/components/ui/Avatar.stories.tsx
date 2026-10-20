import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, type AvatarSize } from './Avatar'
import { AVATAR_COLORS } from './tokens/tokens'

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

const meta = {
  title: 'Data display/Avatar',
  component: Avatar,
  args: { name: 'Daria Kuznetsova', size: 'lg', color: AVATAR_COLORS[1] },
  argTypes: { color: { control: 'select', options: [...AVATAR_COLORS, null] } },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-3">
      {SIZES.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/** `avatar_color` comes from the user profile. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {AVATAR_COLORS.map((color) => (
        <Avatar key={color} {...args} color={color} />
      ))}
      <Avatar {...args} color={null} />
    </div>
  ),
}

/** Organisation logo slot. */
export const Square: Story = { args: { name: 'Kyiv Coffee', square: true } }
