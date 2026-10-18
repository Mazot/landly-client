import clsx from 'clsx'
import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { IMAGE_CONTENT_TYPES, MAX_IMAGE_BYTES } from '@/types/api'
import { UI_NS } from './i18n'
import { IconTile } from './IconTile'
import { FOCUS_RING } from './lib/classes'
import { Progress } from './Progress'

export interface DropzoneProps {
  /** Files that pass the server's type and size limits. */
  onFiles: (files: File[]) => void
  /** Files with another type or over `MAX_IMAGE_BYTES`. */
  onReject?: (files: File[]) => void
  /** Upload in progress, shown on the right. */
  upload?: { name: string; progress: number }
  title?: string
  hint?: string
  multiple?: boolean
  className?: string
}

const ACCEPT = IMAGE_CONTENT_TYPES.join(',')
const allowed = (f: File) => (IMAGE_CONTENT_TYPES as readonly string[]).includes(f.type) && f.size <= MAX_IMAGE_BYTES

/** Photo drop area for `POST /images/upload`: click, keyboard or drag & drop; filters files like the server. */
export function Dropzone({ onFiles, onReject, upload, title, hint, multiple = true, className }: DropzoneProps) {
  const { t } = useTranslation(UI_NS)
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const take = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    const ok = files.filter(allowed)
    const bad = files.filter((f) => !allowed(f))
    if (ok.length) onFiles(ok)
    if (bad.length) onReject?.(bad)
  }
  const open = () => input.current?.click()
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    take(e.dataTransfer.files)
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={onKeyDown}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={clsx(
        'flex min-h-11 cursor-pointer touch-manipulation flex-wrap items-center gap-3.5 rounded-r4 border border-dashed p-4 transition-colors md:flex-nowrap md:p-5.5',
        FOCUS_RING,
        over ? 'border-accent bg-accent-tint' : 'border-border-2 bg-surface hover:border-accent hover:bg-accent-tint',
        className,
      )}
    >
      <IconTile icon="upload" tone="accent" size="lg" />
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-tight font-bold text-ink-1">{title ?? t('dropzone.title')}</div>
        <div className="mt-1 text-label font-medium text-ink-3">{hint ?? t('dropzone.hint')}</div>
      </div>
      {upload && <Progress value={upload.progress} label={upload.name} className="w-full md:w-50" />}
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        hidden
        data-testid="dropzone-input"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
