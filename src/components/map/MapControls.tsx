/* Floating map controls — zoom in / out + locate. */
import { useTranslation } from 'react-i18next'
import Icon from '@/components/ui/Icon'

interface MapControlsProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onLocate?: () => void
}

const cellStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  background: 'transparent',
  color: 'var(--ink-2)',
  cursor: 'pointer',
}

export default function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  const { t } = useTranslation()
  return (
    <div
      className="absolute flex flex-col"
      style={{ right: 16, bottom: 16, gap: 8, zIndex: 5 }}
    >
      <div
        className="flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-1)',
          borderRadius: 10,
          boxShadow: 'var(--shadow-2)',
          overflow: 'hidden',
        }}
      >
        <button style={cellStyle} onClick={onZoomIn} aria-label={t('mapControls.zoomIn')}>
          <Icon name="plus" size={16} />
        </button>
        <div style={{ height: 1, background: 'var(--border-1)' }} />
        <button style={cellStyle} onClick={onZoomOut} aria-label={t('mapControls.zoomOut')}>
          <Icon name="zoomOut" size={16} />
        </button>
      </div>
      <button
        onClick={onLocate}
        aria-label={t('mapControls.locate')}
        style={{
          ...cellStyle,
          background: 'var(--surface)',
          border: '1px solid var(--border-1)',
          borderRadius: 10,
          boxShadow: 'var(--shadow-2)',
        }}
      >
        <Icon name="locate" size={16} />
      </button>
    </div>
  )
}
