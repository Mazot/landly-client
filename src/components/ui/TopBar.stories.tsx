import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Logo } from './Logo'
import { NavTabs } from './NavTabs'
import { TextLink } from './TextLink'
import { TopBar } from './TopBar'

const NAV = [
  { to: '/', label: 'Map', icon: 'pin' as const, end: true },
  { to: '/people', label: 'People', icon: 'users' as const },
]

const meta = {
  title: 'Shell/TopBar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  args: {
    brand: <Logo to="/" size="sm" />,
    nav: <NavTabs label="Main" items={NAV} />,
    actions: (
      <>
        <div className="md:hidden">
          <TextLink to="/signin" tone="strong">
            Sign in
          </TextLink>
        </div>
        <div className="hidden gap-2 md:flex">
          <Button variant="secondary" size="sm">
            Sign in
          </Button>
          <Button variant="accent" size="sm">
            Sign up
          </Button>
        </div>
      </>
    ),
  },
} satisfies Meta<typeof TopBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BrandOnly: Story = { args: { nav: undefined, actions: undefined } }
