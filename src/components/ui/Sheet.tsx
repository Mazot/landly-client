import clsx from 'clsx'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'
import { IconButton } from './IconButton'

export interface SheetProps {
  open: boolean
  /** Esc, backdrop click and the close button call it. */
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  /** Buttons; a `block` Button takes the remaining width. */
  footer?: ReactNode
  /** Modal width from `md`. */
  width?: 'md' | 'lg'
  children: ReactNode
}

/**
 * Bottom sheet on phones, centred modal from `md`. Built on the native
 * `<dialog>` (focus trap, Esc, top layer, inert background come from the platform).
 */
export function Sheet({ open, onClose, title, subtitle, footer, width = 'md', children }: SheetProps) {
  const { t } = useTranslation(UI_NS)
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current!
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={clsx(
        'mx-0 mt-auto mb-0 w-full max-w-none flex-col overflow-hidden rounded-t-r4 border-0 bg-surface p-0 pb-[env(safe-area-inset-bottom)] text-ink-1 shadow-pop backdrop:bg-ink-1/35 open:flex',
        'md:m-auto md:rounded-r4 md:pb-0',
        width === 'md' ? 'md:max-w-140' : 'md:max-w-150',
      )}
    >
      <div aria-hidden="true" className="mx-auto mt-2 h-1.25 w-10 shrink-0 rounded-full bg-border-2 md:hidden" />
      <div className="flex items-start gap-3 px-5 pt-3.5 pb-3 md:px-6.5 md:pt-5.5 md:pb-3.5">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="m-0 text-lg leading-tight font-bold md:text-xl">
            {title}
          </h2>
          {subtitle && <div className="mt-1.25 text-label font-medium text-ink-3">{subtitle}</div>}
        </div>
        <IconButton icon="close" label={t('close')} variant="outline" size="sm" onClick={onClose} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-1 md:px-6.5">{children}</div>
      {footer && <div className="mt-3.5 flex gap-2.5 border-t border-border-1 px-5 pt-3.5 pb-5 md:px-6.5 md:pt-4 md:pb-5.5">{footer}</div>}
    </dialog>
  )
}
