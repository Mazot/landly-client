import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Logo } from '../DS/Logo'
import { SearchField } from '../DS/SearchField'
import { TopBar } from '../DS/TopBar'
import { MapBackdrop } from '../MapBackdrop'
import { MapLayout, type MapLayoutProps } from '../MapLayout'

const meta = {
  title: 'Shell/MapLayout',
  component: MapLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MapLayout>

export default meta
type Story = StoryObj<typeof meta>

function Demo() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="flex h-dvh flex-col">
      <TopBar brand={<Logo size="sm" />} />
      <MapLayout
        toolbar={<SearchField aria-label="Search" placeholder="Search organizations" />}
        map={<MapBackdrop className="size-full" />}
        resultsHeader={<h2 className="m-0 text-lg font-bold">48 organizations</h2>}
        results={<p className="m-0 p-3 text-sm">Results go here.</p>}
        resultsLabel="Places on the map"
        sheetExpanded={expanded}
        onSheetExpandedChange={setExpanded}
        sheetHandleLabel="Show the list"
      />
    </div>
  )
}

/** Desktop: results panel left of the map · tablet: results below the map · phone: map with a docked results sheet. */
export const Default: Story = {
  args: {} as MapLayoutProps,
  render: () => <Demo />,
}
