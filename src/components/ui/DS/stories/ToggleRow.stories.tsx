import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Meta as MetaText } from '../Meta'
import { ToggleRow } from '../ToggleRow'

const meta = {
  title: 'Containers/ToggleRow',
  component: ToggleRow,
  args: { title: 'Allow reviews', description: 'People who met you can leave a review.', onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToggleRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const On: Story = { args: { defaultChecked: true } }

export const WithoutDescription: Story = { args: { description: undefined, title: 'Open on Mondays' } }

/** An opening day: the times sit between the day and its switch. */
export const WithExtra: Story = {
  args: {
    title: 'Mon',
    description: undefined,
    switchLabel: 'Open on Monday',
    defaultChecked: true,
    extra: <MetaText strong>09:00–18:00</MetaText>,
  },
}
