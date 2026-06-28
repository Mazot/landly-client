import { useCorridor } from '@/hooks/useCorridor'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import MapPageMobile from './mobile/MapPageMobile'
import MapPageDesktop from './desktop/MapPageDesktop'

export default function MapPage() {
  const { from, to, toId } = useCorridor()
  const isMobile = useBreakpoint('mobile')

  // Tablet uses the desktop layout with a narrower sidebar column
  return isMobile
    ? <MapPageMobile from={from} to={to} toId={toId} />
    : <MapPageDesktop from={from} to={to} toId={toId} />
}
