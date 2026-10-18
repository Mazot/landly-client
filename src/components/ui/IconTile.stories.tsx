import type { Meta, StoryObj } from '@storybook/react-vite'
import { TONES } from './constants/tones'
import { IconTile, type IconTileSize } from './IconTile'

const SIZES: IconTileSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

const meta = {
  title: 'Data display/IconTile',
  component: IconTile,
  args: { icon: 'phone', tone: 'accent', size: 'md', shape: 'rounded' },
  argTypes: { tone: { control: 'select', options: TONES } },
} satisfies Meta<typeof IconTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {TONES.map((tone) => (
        <IconTile key={tone} {...args} tone={tone} />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-2">
      {SIZES.map((size) => (
        <IconTile key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

export const Circle: Story = { args: { shape: 'circle', icon: 'check', tone: 'success' } }

/** Emoji instead of an icon (country flag, mission). */
export const Emoji: Story = { args: { icon: undefined, children: '🇩🇪', tone: 'surface', size: 'lg' } }
