import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Dropzone } from './Dropzone'

const meta = {
  title: 'Forms/Dropzone',
  component: Dropzone,
  args: { onFiles: fn(), onReject: fn(), multiple: true },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

/** Click, keyboard or drop; files over 10 MB or of another type go to `onReject`, like the server would. */
export const Default: Story = {}

export const Uploading: Story = { args: { upload: { name: 'kyiv-coffee-inside.jpg', progress: 64 } } }

export const CustomCopy: Story = { args: { title: 'Add a logo', hint: 'Square image works best', multiple: false } }
