import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Logo } from '../DS/Logo'
import { MapBackdrop } from '../MapBackdrop'
import { TopBar } from '../DS/TopBar'
import { MapLayout, type MapLayoutProps } from '../MapLayout'

const meta = {
  title: 'Shell/MapLayout',
  component: MapLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MapLayout>

export default meta
type Story = StoryObj<typeof meta>

function Demo(props: Pick<MapLayoutProps, 'summary'>) {
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <MapLayout
      topBar={<TopBar brand={<Logo size="sm" />} />}
      map={<MapBackdrop className="size-full" />}
      title="Places on the map"
      panel={<p className="m-0 p-3 text-sm">Results go here.</p>}
      sheetOpen={sheetOpen}
      onSheetOpenChange={setSheetOpen}
      {...props}
    />
  )
}

/** Side panel from `lg`; below it a button opens the results as a bottom sheet. */
export const Default: Story = {
  args: {} as MapLayoutProps,
  render: () => <Demo summary="12 places in this area" />,
}
