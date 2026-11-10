import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DockedSheet } from '../DockedSheet'

const meta = {
  title: 'Shell/DockedSheet',
  component: DockedSheet,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DockedSheet>

export default meta
type Story = StoryObj<typeof meta>

function Demo({ initiallyExpanded }: { initiallyExpanded: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  return (
    <div className="relative h-dvh bg-bg">
      <DockedSheet expanded={expanded} onExpandedChange={setExpanded} handleLabel="Show the list" header={<span className="text-lg font-bold">48 nearby</span>}>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="m-0 p-3 text-sm">
            Row {i + 1}
          </p>
        ))}
      </DockedSheet>
    </div>
  )
}

/** Peeks over the map; a tap or a swipe on the handle opens it. */
export const Peek: Story = {
  args: {} as never,
  render: () => <Demo initiallyExpanded={false} />,
}

export const Expanded: Story = {
  args: {} as never,
  render: () => <Demo initiallyExpanded />,
}
