/* Corridor switcher popover — opened from the corridor pill in the TopBar. */
import { useTranslation } from 'react-i18next'
import { flagOf } from '@/lib/countries'
import { useCorridor } from '@/hooks/useCorridor'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import FlagPair from '@/components/ui/FlagPair'

interface CorridorRowProps {
  fromFlag: string
  toFlag: string
  fromName: string
  toName: string
  current?: boolean
  onClick?: () => void
}

function CorridorRow({ fromFlag, toFlag, fromName, toName, current, onClick }: CorridorRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full"
      style={{
        gap: 12,
        padding: '10px 12px',
        borderRadius: 11,
        background: current ? 'var(--surface-2)' : 'transparent',
        border: current ? '1px solid var(--border-1)' : '1px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <FlagPair fromFlag={fromFlag} toFlag={toFlag} size={17} gap={7} arrowSize={12} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="block" style={{ font: '600 13.5px/1.2 var(--font-sans)', color: 'var(--ink-1)' }}>
          {fromName} → {toName}
        </span>
      </span>
      {current ? (
        <span
          className="flex items-center justify-center text-white"
          style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--ink-1)' }}
        >
          <Icon name="check" size={13} stroke={2.4} />
        </span>
      ) : (
        <Icon name="arrowRight" size={15} style={{ color: 'var(--ink-4)' }} />
      )}
    </button>
  )
}

interface CorridorSwitcherProps {
  onClose: () => void
}

export default function CorridorSwitcher({ onClose }: CorridorSwitcherProps) {
  const { t } = useTranslation()
  const { from, to, fromId, setCorridor, countries } = useCorridor()

  const alternatives = countries.filter((c) => c.id !== to?.id).slice(0, 4)

  return (
    <div
      className="absolute z-30"
      style={{
        top: 'calc(100% + 10px)',
        left: 0,
        width: 320,
        background: 'var(--surface)',
        borderRadius: 16,
        border: '1px solid var(--border-1)',
        boxShadow: 'var(--shadow-pop)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -6,
          left: 40,
          width: 12,
          height: 12,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border-1)',
          borderTop: '1px solid var(--border-1)',
          transform: 'rotate(45deg)',
        }}
      />

      <div style={{ padding: '16px 16px 6px 16px' }}>
        <div className="l-label" style={{ margin: 0 }}>{t('corridorSwitcher.yourCorridor')}</div>
      </div>
      <div style={{ padding: '0 10px' }}>
        <CorridorRow
          fromFlag={flagOf(from)}
          toFlag={flagOf(to)}
          fromName={from?.name ?? '—'}
          toName={to?.name ?? '—'}
          current
        />
      </div>

      {alternatives.length > 0 && (
        <>
          <div style={{ padding: '12px 16px 6px 16px' }}>
            <div className="l-label" style={{ margin: 0 }}>{t('corridorSwitcher.switchTo')}</div>
          </div>
          <div style={{ padding: '0 10px 8px 10px' }}>
            {alternatives.map((c) => (
              <CorridorRow
                key={c.id}
                fromFlag={flagOf(from)}
                toFlag={flagOf(c)}
                fromName={from?.name ?? '—'}
                toName={c.name}
                onClick={() => {
                  if (fromId) setCorridor(fromId, c.id)
                  onClose()
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="l-hairline" />
      <div style={{ padding: 10, display: 'flex', gap: 8 }}>
        <Button variant="ghost" size="sm" style={{ flex: 1 }}>
          <Icon name="plus" size={13} /> {t('corridorSwitcher.addCorridor')}
        </Button>
        <Button variant="ghost" size="sm" style={{ flex: 1 }}>
          <Icon name="settings" size={13} /> {t('corridorSwitcher.manage')}
        </Button>
      </div>
    </div>
  )
}
