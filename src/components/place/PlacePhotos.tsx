import { useTranslation } from 'react-i18next'
import { ImageFrame } from '@/components/ui'
import type { OrganisationImage } from '@/types/api'

export interface PlacePhotosProps {
  images: OrganisationImage[]
  placeName: string
}

/** The place's photos, the primary one first: 2 columns on phones, 3 on tablets, 4 from desktop. */
export function PlacePhotos({ images, placeName }: PlacePhotosProps) {
  const { t } = useTranslation()
  const ordered = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
  return (
    <ul aria-label={t('place.photos.title', { count: images.length })} className="m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-3 lg:grid-cols-4">
      {ordered.map((image, index) => (
        <li key={image.id}>
          <ImageFrame src={image.url} alt={t('place.photos.alt', { name: placeName, index: index + 1 })} ratio="photo" />
        </li>
      ))}
    </ul>
  )
}
