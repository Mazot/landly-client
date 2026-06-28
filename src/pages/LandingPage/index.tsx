import { useBreakpoint } from '@/hooks/useBreakpoint'
import LandingPageDesktop from './desktop/LandingPageDesktop'
import LandingPageMobile from './mobile/LandingPageMobile'

export default function LandingPage() {
  const isDesktop = useBreakpoint('desktop')
  return isDesktop ? <LandingPageDesktop /> : <LandingPageMobile />
}
