import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Callout } from './Callout'
import { TONES } from './constants/tones'

const meta = {
  title: 'Containers/Callout',
  component: Callout,
  args: { tone: 'info', title: 'Moderators review new places', children: 'Your place goes live after a check, usually within a day.', size: 'md' },
  argTypes: { tone: { control: 'select', options: TONES } },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {TONES.map((tone) => (
        <Callout key={tone} {...args} tone={tone} title={tone} />
      ))}
    </div>
  ),
}

/** Danger is announced as an alert. */
export const Danger: Story = { args: { tone: 'danger', title: undefined, children: 'Invalid email or password' } }

/** Duplicate check before creating a place. */
export const WithActions: Story = {
  args: {
    tone: 'warning',
    size: 'lg',
    title: 'Similar place nearby',
    children: 'Kyiv Coffee · 40 m away',
    actions: (
      <>
        <Button size="sm" variant="secondary">Open existing</Button>
        <Button size="sm" variant="ghost">Add anyway</Button>
      </>
    ),
  },
}

export const WithoutIcon: Story = { args: { icon: false, tone: 'note', title: 'Private note', children: 'Ask about the Anmeldung appointment.' } }
