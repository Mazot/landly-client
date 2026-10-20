import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TextLink } from './TextLink'

const meta = {
  title: 'Primitives/TextLink',
  component: TextLink,
  args: { children: 'See all', tone: 'accent', size: 'sm', iconRight: 'arrowRight', to: '/map' },
} satisfies Meta<typeof TextLink>

export default meta
type Story = StoryObj<typeof meta>

/** Router link (`to`). */
export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <TextLink {...args} tone="accent">Accent</TextLink>
      <TextLink {...args} tone="muted">Muted</TextLink>
      <TextLink {...args} tone="strong">Strong</TextLink>
      <TextLink {...args} tone="danger" iconRight={undefined} icon="flag">Report a problem</TextLink>
    </div>
  ),
}

/** External anchor (`href`). */
export const Anchor: Story = { args: { to: undefined, href: 'https://example.com', children: 'Website', icon: 'link', iconRight: undefined } }

/** Button (`onClick`) — "Set default". */
export const Action: Story = { args: { to: undefined, onClick: fn(), children: 'Set default', iconRight: undefined, size: 'md' } }
