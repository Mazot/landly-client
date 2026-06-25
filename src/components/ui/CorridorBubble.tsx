/* Dark floating corridor stat bubble (used over the map, top-right). */
import { useTranslation } from 'react-i18next'
import Icon from './Icon'
import FlagPair from './FlagPair'

interface CorridorBubbleProps {
  fromFlag?: string | null
  toFlag?: string | null
  places?: number
  subtitle?: string
  onView?: () => void
}

export default function CorridorBubble({
  fromFlag,
  toFlag,
  places = 0,
  subtitle,
  onView,
}: CorridorBubbleProps) {
  const { t } = useTranslation()
  return (
    <div
      className="inline-flex items-center text-white"
      style={{
        gap: 12,
        padding: '9px 10px 9px 14px',
        borderRadius: 14,
        background: 'var(--ink-1)',
        boxShadow: 'var(--shadow-3)',
      }}
    >
      <FlagPair fromFlag={fromFlag} toFlag={toFlag} size={17} gap={8} arrowSize={13} arrowColor="var(--accent)" />
      <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.14)' }} />
      <div className="flex flex-col" style={{ gap: 2 }}>
        <span style={{ font: '700 14px/1 var(--font-sans)' }}>{t('ui.placesCount', { count: places })}</span>
        {subtitle && (
          <span style={{ font: '500 11px/1 var(--font-sans)', color: 'rgba(255,255,255,0.55)' }}>
            {subtitle}
          </span>
        )}
      </div>
      <button
        onClick={onView}
        className="inline-flex items-center text-white"
        style={{
          marginLeft: 4,
          height: 32,
          padding: '0 12px',
          borderRadius: 9,
          border: 0,
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.12)',
          font: '600 12px/1 var(--font-sans)',
          gap: 6,
        }}
      >
        {t('corridorBubble.viewCorridor')} <Icon name="arrowRight" size={12} stroke={2.2} />
      </button>
    </div>
  )
}
