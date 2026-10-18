import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { IconButton } from './IconButton'
import { MobileHeader } from './MobileHeader'

const meta = {
  title: 'Shell/MobileHeader',
  component: MobileHeader,
  args: {
    title: 'Kyiv Coffee',
    subtitle: 'Business · Berlin',
    back: 'back',
    onBack: fn(),
    trailing: <IconButton icon="bookmark" label="Save place" />,
  },
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: 'phone' } },
} satisfies Meta<typeof MobileHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Phone top bar; screens hide it from `lg`. */
export const Default: Story = {}

/** Modal flows (create a place) close instead of going back. */
export const Close: Story = { args: { back: 'close', subtitle: undefined, title: 'Add a place', trailing: undefined } }
