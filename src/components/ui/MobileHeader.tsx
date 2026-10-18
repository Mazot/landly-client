import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'
import { IconButton } from './IconButton'

export interface MobileHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Leading button: arrow back or close (for flows). */
  back?: 'back' | 'close'
  onBack?: () => void
  /** Actions on the right (IconButtons, a "Save" TextLink). */
  trailing?: ReactNode
}

/** Phone top bar of a screen, safe-area aware. Hide it from `lg` in the screen layout. */
export function MobileHeader({ title, subtitle, back, onBack, trailing }: MobileHeaderProps) {
  const { t } = useTranslation(UI_NS)
  return (
    <header className="flex shrink-0 items-center gap-1.5 border-b border-border-1 bg-surface px-2.5 pt-[env(safe-area-inset-top)]">
      <div className="flex h-13 min-w-0 flex-1 items-center gap-1.5">
        {back && <IconButton icon={back === 'close' ? 'close' : 'arrowLeft'} label={back === 'close' ? t('close') : t('back')} onClick={onBack} />}
        <div className="min-w-0 flex-1 px-1.5">
          <div className="truncate text-base leading-tight font-bold text-ink-1">{title}</div>
          {subtitle && <div className="mt-0.5 truncate text-xs font-medium text-ink-3">{subtitle}</div>}
        </div>
        {trailing}
      </div>
    </header>
  )
}
