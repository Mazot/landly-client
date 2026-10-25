import type { Meta, StoryObj } from '@storybook/react-vite'
import { CorridorFields } from './CorridorFields'
import { Field } from './Field'
import { Select } from './Select'

const COUNTRIES = [
  { value: 'ru', label: '🇷🇺  Russia' },
  { value: 'de', label: '🇩🇪  Germany' },
]

const meta = {
  title: 'Forms/CorridorFields',
  component: CorridorFields,
  args: {
    from: (
      <Field label="I'm from">
        <Select options={COUNTRIES} defaultValue="ru" />
      </Field>
    ),
    to: (
      <Field label="Living in">
        <Select options={COUNTRIES} defaultValue="de" />
      </Field>
    ),
  },
} satisfies Meta<typeof CorridorFields>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const StackedOnPhone: Story = { args: { stackOnPhone: true } }
