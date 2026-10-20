import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { Button } from './Button'
import { ChipGroup, type ChipOption } from './ChipGroup'
import { Sheet, type SheetProps } from './Sheet'
import { ToggleRow } from './ToggleRow'

const TYPES: ChipOption[] = [
  { value: 'embassy', label: 'Embassies', orgType: 'embassy' },
  { value: 'helper', label: 'Helpers', orgType: 'helper' },
  { value: 'community', label: 'Communities', orgType: 'community' },
]

const meta = {
  title: 'Shell/Sheet',
  component: Sheet,
  args: {
    open: false,
    onClose: fn(),
    title: 'Filters',
    subtitle: 'Applies to the map',
    width: 'md',
    children: (
      <div className="flex flex-col gap-4 pb-2">
        <ChipGroup label="Place types" multiple defaultValue={['embassy']} options={TYPES} />
        <ToggleRow title="Open now" />
        <ToggleRow title="Verified only" defaultChecked />
      </div>
    ),
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/** Opens from a button; Esc, backdrop and the close button call `onClose`. */
function SheetDemo(args: SheetProps) {
  const [open, setOpen] = useState(args.open)
  return (
    <>
      <Button variant="secondary" icon="sliders" onClick={() => setOpen(true)}>
        Filters
      </Button>
      <Sheet
        {...args}
        open={open}
        onClose={() => {
          args.onClose()
          setOpen(false)
        }}
        footer={
          args.footer ?? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Reset
              </Button>
              <Button variant="accent" block onClick={() => setOpen(false)}>
                Show 21 places
              </Button>
            </>
          )
        }
      />
    </>
  )
}

/** Bottom sheet on phones, centred modal from `md` — switch the viewport to compare. */
export const Default: Story = { render: (args) => <SheetDemo {...args} /> }

export const Wide: Story = { args: { width: 'lg', title: 'Opening hours', subtitle: undefined }, render: (args) => <SheetDemo {...args} /> }
