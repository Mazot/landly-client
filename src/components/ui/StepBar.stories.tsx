import type { Meta, StoryObj } from '@storybook/react-vite'
import { StepBar } from './StepBar'

const meta = {
  title: 'Forms/StepBar',
  component: StepBar,
  args: { total: 2, current: 1 },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepBar>

export default meta
type Story = StoryObj<typeof meta>

/** Sign-up: account → corridor. */
export const Default: Story = {}

export const LastStep: Story = { args: { current: 2 } }

export const FourSteps: Story = { args: { total: 4, current: 3 } }
