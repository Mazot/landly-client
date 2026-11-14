import { useTranslation } from 'react-i18next'
import { Button, IconButton, ImageFrame, Tag } from '@/components/ui'
import { useOrganisationImages } from '@/hooks/useImages'
import { placePath } from '@/lib/routes'
import type { Organisation, OrganisationType } from '@/types/api'
import { PlaceActions } from './PlaceActions'
import { PlaceContacts } from './PlaceContacts'
import { PlaceHead } from './PlaceHead'

export interface PlaceCompactPanelProps {
  place: Organisation
  type: OrganisationType | undefined
  /** Phones show no photo: the map stays visible above the sheet. */
  showPhoto: boolean
  onClose: () => void
}

/** A place picked on the map: photo, head, actions, description, services, contacts and the way to its full page. */
export function PlaceCompactPanel({ place, type, showPhoto, onClose }: PlaceCompactPanelProps) {
  const { t } = useTranslation()
  const images = useOrganisationImages(showPhoto ? place.id : undefined)
  const primary = images.data?.items.find((image) => image.isPrimary) ?? images.data?.items[0]

  return (
    <section aria-label={place.name} className="flex flex-col gap-4">
      {/* Stays at the top of the scrolling panel; takes no room of its own. */}
      <div className="sticky top-0 z-10 -mb-4 flex h-0 justify-end">
        <span className="mt-3 mr-3">
          <IconButton icon="close" label={t('place.close')} variant="floating" size="sm" onClick={onClose} />
        </span>
      </div>
      {showPhoto && primary && <ImageFrame src={primary.url} alt={t('place.photos.primary', { name: place.name })} ratio="square" />}
      <PlaceHead place={place} type={type} compact as="h2" />
      <PlaceActions place={place} />
      {place.description && <p className="m-0 text-sm font-medium text-pretty text-ink-2">{place.description}</p>}
      {place.services.length > 0 && (
        <ul aria-label={t('place.services')} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {place.services.map((service) => (
            <li key={service}>
              <Tag>{service}</Tag>
            </li>
          ))}
        </ul>
      )}
      <PlaceContacts place={place} />
      {/* Full width without `block`: its `flex-1` would collapse the height inside this column. */}
      <Button to={placePath(place.id)} variant="secondary" iconRight="arrowRight" className="w-full">
        {t('place.openFullPage')}
      </Button>
    </section>
  )
}
