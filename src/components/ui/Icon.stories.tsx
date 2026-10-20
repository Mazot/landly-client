import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'
import { ICON_NAMES } from './iconPaths'

const meta = {
  title: 'Primitives/Icon',
  component: Icon,
  args: { name: 'pin', size: 24 },
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filled: Story = { args: { name: 'star', filled: true } }

/** Every icon in the set — pick names from here. */
export const Gallery: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
      {ICON_NAMES.map((name) => (
        <div key={name} className="flex min-w-0 flex-col items-center gap-2 rounded-r3 border border-border-1 bg-surface p-3 text-ink-1">
          <Icon {...args} name={name} />
          <span className="w-full truncate text-center font-mono text-xs text-ink-3">{name}</span>
        </div>
      ))}
    </div>
  ),
}
