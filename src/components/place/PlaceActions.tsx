import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, IconButton } from '@/components/ui'
import { useSavedPlaces } from '@/hooks/useSavedPlaces'
import { directionsUrl } from '@/lib/maps'
import { editPlacePath, placePath, ROUTES, type ReturnState } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'
import type { Organisation } from '@/types/api'

/** How long "Link copied" stays on the share button. */
export const COPIED_FEEDBACK_MS = 2000

export interface PlaceActionsProps {
  place: Organisation
}

/** Directions (Google Maps, new tab), save / unsave (a guest is sent to sign in), copy the page link and, for whoever added the place, edit it. */
export function PlaceActions({ place }: PlaceActionsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthor = useAuthStore((state) => !!state.user && state.user.id === place.createdBy)
  const saved = useSavedPlaces()
  const [copied, setCopied] = useState(false)
  const directions = directionsUrl(place)
  const isSaved = isAuthenticated && saved.isSaved(place.id)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const save = () => {
    if (isAuthenticated) return saved.toggle(place.id)
    const state: ReturnState = { from: { pathname: location.pathname, search: location.search } }
    navigate(ROUTES.signIn, { state })
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(placePath(place.id), window.location.origin).href)
      setCopied(true)
    } catch {
      // No clipboard (plain http) or permission refused: the button simply stays as it was.
    }
  }

  return (
    // Wraps on the narrowest phones rather than pushing the last button out of the card.
    <div className="flex flex-wrap items-center gap-2">
      {isAuthor && (
        <Button to={editPlacePath(place.id)} variant="secondary" icon="pencil" className="w-full">
          {t('place.edit')}
        </Button>
      )}
      {directions && (
        <Button href={directions} icon="pin" className="flex-1">
          {t('place.directions')}
        </Button>
      )}
      <Button variant="secondary" icon="bookmark" aria-pressed={isSaved} onClick={save} className={directions ? undefined : 'flex-1'}>
        {t(isSaved ? 'place.saved' : 'place.save')}
      </Button>
      <IconButton icon={copied ? 'check' : 'link'} label={t(copied ? 'place.linkCopied' : 'place.copyLink')} variant="outline" onClick={() => void copyLink()} />
    </div>
  )
}
