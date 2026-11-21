import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading, type HeadingSize } from '../Heading'

const SIZES: HeadingSize[] = ['sm', 'md', 'lg', 'display']

const meta = {
  title: 'Primitives/Heading',
  component: Heading,
  args: { children: '24 places in this area' },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {SIZES.map((size) => (
        <Heading key={size} {...args} as="p" size={size}>
          {size === 'display' ? '4.6' : `${size} — ${args.children}`}
        </Heading>
      ))}
    </div>
  ),
}
