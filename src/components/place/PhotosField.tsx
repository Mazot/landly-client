import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Callout, Dropzone, IconButton, ImageFrame, InlineStatus } from '@/components/ui'
import { useDeleteImage, useOrganisationImages, useSetPrimaryImage, useUploadImages, type UploadProgress } from '@/hooks/useImages'
import type { Uuid } from '@/types/api'

/** One photo of the grid. */
export interface PhotoItem {
  key: string
  url: string
  name: string
  cover: boolean
}

interface PhotosGridProps {
  photos: PhotoItem[]
  uploading?: UploadProgress
  rejected: number
  onFiles: (files: File[]) => void
  onReject: (files: File[]) => void
  onRemove: (key: string) => void
  onMakeCover: (key: string) => void
}

/** The drop area, a note for refused files and the photos with "Cover" / "Make cover" and remove. */
function PhotosGrid({ photos, uploading, rejected, onFiles, onReject, onRemove, onMakeCover }: PhotosGridProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-3.5">
      <Dropzone onFiles={onFiles} onReject={onReject} upload={uploading && { name: uploading.name, progress: Math.round((uploading.done / uploading.total) * 100) }} />
      {rejected > 0 && <Callout tone="danger" title={t('addPlace.sent.rejected', { count: rejected })} />}
      {photos.length > 0 && (
        <ul aria-label={t('photosField.list')} className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.key} className="flex flex-col gap-2">
              <ImageFrame
                src={photo.url}
                alt={photo.name}
                ratio="photo"
                badge={photo.cover ? <Badge tone="dark">{t('photosField.cover')}</Badge> : undefined}
                action={<IconButton icon="close" label={t('photosField.remove', { name: photo.name })} variant="floating" size="sm" onClick={() => onRemove(photo.key)} />}
              />
              {!photo.cover && (
                <Button variant="secondary" size="sm" onClick={() => onMakeCover(photo.key)} aria-label={t('photosField.makeCover', { name: photo.name })}>
                  {t('photosField.makeCoverShort')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export interface QueuedPhotosProps {
  files: File[]
  onChange: (files: File[]) => void
}

/**
 * Photos picked before the place exists: kept here (the first is the cover; "Make cover" moves one to
 * the front) and sent once the place is created.
 */
export function QueuedPhotos({ files, onChange }: QueuedPhotosProps) {
  const [rejected, setRejected] = useState(0)
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])
  const photos = files.map((file, index) => ({ key: String(index), url: previews[index], name: file.name, cover: index === 0 }))

  return (
    <PhotosGrid
      photos={photos}
      rejected={rejected}
      onFiles={(added) => {
        setRejected(0)
        onChange([...files, ...added])
      }}
      onReject={(refused) => setRejected(refused.length)}
      onRemove={(key) => onChange(files.filter((_, index) => String(index) !== key))}
      onMakeCover={(key) => onChange([files[Number(key)], ...files.filter((_, index) => String(index) !== key)])}
    />
  )
}

/** The photos of a place that exists: each change (add, cover, remove) is saved at once. */
export function PlacePhotosEditor({ organisationId }: { organisationId: Uuid }) {
  const { t } = useTranslation()
  const images = useOrganisationImages(organisationId)
  const upload = useUploadImages()
  const setPrimary = useSetPrimaryImage(organisationId)
  const remove = useDeleteImage(organisationId)
  const [uploading, setUploading] = useState<UploadProgress>()
  const [rejected, setRejected] = useState(0)

  if (images.isError) return <Callout tone="danger" title={t('photosField.loadFailed')} />
  if (!images.data) return <InlineStatus>{t('addPlace.loading')}</InlineStatus>

  const items = images.data.items
  const photos = items.map((image) => ({ key: image.id, url: image.url, name: image.fileName, cover: image.isPrimary }))
  const send = async (files: File[]) => {
    setRejected(0)
    const result = await upload.mutateAsync({ organisationId, files, hasPrimary: items.some((image) => image.isPrimary), onProgress: setUploading })
    setUploading(undefined)
    setRejected(result.failed)
  }

  return (
    <PhotosGrid
      photos={photos}
      uploading={uploading}
      rejected={rejected}
      onFiles={(files) => void send(files)}
      onReject={(refused) => setRejected(refused.length)}
      onRemove={(id) => remove.mutate(id)}
      onMakeCover={(id) => setPrimary.mutate(id)}
    />
  )
}
