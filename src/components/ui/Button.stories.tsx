import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button, type ButtonVariant } from './Button'

const VARIANTS: ButtonVariant[] = ['primary', 'accent', 'secondary', 'ghost', 'success', 'danger', 'whatsapp']

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: { children: 'Add a place', variant: 'primary', size: 'md', onClick: fn() },
  argTypes: { variant: { control: 'select', options: VARIANTS } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
}

export const WithIcons: Story = { args: { icon: 'plus', iconRight: 'arrowRight', variant: 'accent' } }

export const Loading: Story = { args: { loading: true, children: 'Saving' } }

export const Disabled: Story = { args: { disabled: true } }

/** Full width — the sticky primary action on phones. */
export const Block: Story = { args: { block: true, variant: 'accent', children: 'Show 21 places' } }

/** No children → square icon button; give it an accessible name. */
export const IconOnly: Story = { args: { children: undefined, icon: 'sliders', 'aria-label': 'Filters', variant: 'secondary' } }

export const AsLink: Story = { args: { to: '/signup', variant: 'accent', children: 'Sign up' } }
