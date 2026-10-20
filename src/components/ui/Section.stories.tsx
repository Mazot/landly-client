import type { Meta, StoryObj } from '@storybook/react-vite'
import { Section } from './Section'
import { TextLink } from './TextLink'

const meta = {
  title: 'Containers/Section',
  component: Section,
  args: {
    title: 'Nearby helpers',
    subtitle: 'Within 5 km',
    action: <TextLink to="/map" iconRight="arrowRight">See all</TextLink>,
    children: <div className="rounded-r3 border border-dashed border-border-2 p-6 text-sm text-ink-3">Section content</div>,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TitleOnly: Story = { args: { subtitle: undefined, action: undefined } }
