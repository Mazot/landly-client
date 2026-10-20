import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { Icon } from './Icon'
import { ListItem } from './ListItem'
import { Meta as MetaText } from './Meta'
import { OpenStatus } from './OpenStatus'
import { Rating } from './Rating'
import { AVATAR_COLORS } from './tokens/tokens'
import { TypeTag } from './TypeTag'

const meta = {
  title: 'Containers/ListItem',
  component: ListItem,
  args: {
    leading: <Avatar name="Kyiv Coffee" square size="lg" />,
    title: 'Kyiv Coffee',
    adornment: <Icon name="verified" size={14} label="Verified" className="text-info" />,
    subtitle: 'Warschauer Str. 34, Berlin',
    meta: (
      <>
        <TypeTag slug="business" label="Business" />
        <Rating value={4.6} count={148} size="sm" />
        <OpenStatus open hours="until 18:00" size="sm" />
      </>
    ),
    trailing: <MetaText icon="pin">1.2 km</MetaText>,
    variant: 'card',
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListItem>

export default meta
type Story = StoryObj<typeof meta>

/** Static row. */
export const Default: Story = {}

/** Router link row (`to`). */
export const Link: Story = { args: { to: '/org/1' } }

/** Button row (`onClick`) — Enter / Space work too. */
export const Clickable: Story = { args: { onClick: fn() } }

/** Selected row in the map list. */
export const Active: Story = { args: { onClick: fn(), active: true } }

export const Person: Story = {
  args: {
    leading: <Avatar name="Daria Kuznetsova" color={AVATAR_COLORS[1]} />,
    title: 'Daria K.',
    adornment: undefined,
    subtitle: 'Relocation · Housing',
    meta: undefined,
    trailing: <Badge tone="success">Confirmed</Badge>,
    variant: 'plain',
    size: 'sm',
  },
}

export const WithFooter: Story = { args: { footer: <MetaText icon="users">12 people checked in</MetaText> } }
