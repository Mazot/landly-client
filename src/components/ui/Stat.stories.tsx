import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stat } from './Stat'

const meta = {
  title: 'Containers/Stat',
  component: Stat,
  args: { value: '12', label: 'places added', icon: 'pin', variant: 'default' },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Community check-in signals on the place page. */
export const Row: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <Stat value="94%" label="still active" icon="check" variant="sunken" />
      <Stat value="38" label="people came" icon="users" variant="sunken" />
      <Stat value="2 d" label="last check-in" icon="clock" variant="sunken" />
    </div>
  ),
}
