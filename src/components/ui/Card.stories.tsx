import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, type CardVariant } from './Card'

const VARIANTS: CardVariant[] = ['default', 'selected', 'dashed', 'sunken', 'elevated']

const meta = {
  title: 'Containers/Card',
  component: Card,
  args: { variant: 'default', padding: 'md', children: 'Kyiv Coffee · Friedrichshain' },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <Card key={variant} {...args} variant={variant}>
          {variant}
        </Card>
      ))}
    </div>
  ),
}

export const Interactive: Story = { args: { interactive: true, children: 'Hover me' } }
