import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/ui'

export interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  /** Centres the map on the user; hidden when the browser has no geolocation. */
  onLocate?: () => void
}

/** Zoom and "my location" buttons floating over the map. */
export function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <IconButton icon="zoomIn" variant="floating" label={t('map.zoomIn')} onClick={onZoomIn} />
      <IconButton icon="zoomOut" variant="floating" label={t('map.zoomOut')} onClick={onZoomOut} />
      {onLocate && <IconButton icon="locate" variant="floating" label={t('map.locate')} onClick={onLocate} />}
    </div>
  )
}
