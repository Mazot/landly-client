import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChipGroup, TextField } from '@/components/ui'
import { TAG_MAX_CHARS, TAGS_PER_LIST_MAX } from '@/types/api'

export interface TagsFieldProps {
  /** Accessible name of the chips. */
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  /** Placeholder of the input that adds one. */
  placeholder: string
}

/**
 * Free-text tags (services): the chips are the tags — a click removes one — and "+ Add" opens an
 * input where Enter (or leaving it) adds the text (trimmed, once, up to the server's limits); Escape closes it.
 */
export function TagsField({ label, value, onChange, placeholder }: TagsFieldProps) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const full = value.length >= TAGS_PER_LIST_MAX

  const add = () => {
    const tag = text.trim()
    const known = value.some((existing) => existing.toLowerCase() === tag.toLowerCase())
    if (tag && !known && !full) onChange([...value, tag])
    setText('')
  }

  return (
    <div className="flex flex-col gap-2">
      <ChipGroup
        multiple
        label={label}
        options={value.map((tag) => ({ value: tag, label: tag, icon: 'close' as const }))}
        value={value}
        onChange={(kept) => onChange(kept)}
        onAdd={full ? undefined : () => setAdding(true)}
        addLabel={t('addPlace.add')}
      />
      {adding && (
        <TextField
          autoFocus
          aria-label={placeholder}
          placeholder={placeholder}
          maxLength={TAG_MAX_CHARS}
          value={text}
          onChange={(event) => setText(event.target.value)}
          // Stays open on blur: collapsing it would shift the form under the pointer mid-click.
          onBlur={add}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setText('')
              setAdding(false)
            }
            if (event.key !== 'Enter') return
            event.preventDefault()
            add()
          }}
        />
      )}
    </div>
  )
}
