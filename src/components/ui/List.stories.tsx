import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { List } from './List'
import { ListItem } from './ListItem'
import { ToggleRow } from './ToggleRow'

const meta = {
  title: 'Containers/List',
  component: List,
  args: {
    label: 'Places',
    children: (
      <>
        <ListItem title="German Embassy" subtitle="Leninsky Prospekt 95A" variant="card" onClick={fn()} />
        <ListItem title="Kyiv Coffee" subtitle="Warschauer Str. 34" variant="card" onClick={fn()} />
        <ListItem title="Ukrainian community centre" subtitle="Oranienstr. 12" variant="card" onClick={fn()} />
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

/** Separate rows with a gap; `label` makes it an ARIA list. */
export const Stack: Story = {}

/** One card, rows split by hairlines — settings, privacy toggles. */
export const Divided: Story = {
  args: {
    variant: 'divided',
    label: 'Privacy',
    children: (
      <>
        <ToggleRow title="Show my city" description="Berlin" defaultChecked />
        <ToggleRow title="Show my email" />
        <ToggleRow title="Show my WhatsApp" description="+49 157 1234567" />
      </>
    ),
  },
}

export const SmallGap: Story = { args: { gap: 'sm' } }
