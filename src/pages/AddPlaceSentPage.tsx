import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Button, Callout, Dropzone, EmptyState, FormNote, IconTile, InlineStatus, PageHeader, StepList } from '@/components/ui'
import { useUploadImage } from '@/hooks/useImages'
import { useOrganisation } from '@/hooks/useOrganisations'
import { ROUTES } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'

/**
 * "Sent for review": what happens next to the new place, and its photos can be added right away.
 * Only for the submitter — anyone else (or a place that cannot be loaded) gets "nothing here".
 */
export default function AddPlaceSentPage() {
  return (
    <AppShell>
      <SentScreen />
    </AppShell>
  )
}

function SentScreen() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const userId = useAuthStore((state) => state.user?.id)
  const place = useOrganisation(id)
  const upload = useUploadImage(id)
  const [addingPhotos, setAddingPhotos] = useState(false)
  const [uploading, setUploading] = useState<{ name: string; done: number; total: number }>()
  const [uploaded, setUploaded] = useState(0)
  const [rejected, setRejected] = useState(0)

  const uploadAll = async (files: File[]) => {
    setRejected(0)
    // The first photo that arrives is the cover — a failed first file does not leave the place without one.
    let hasPrimary = uploaded > 0
    for (const [index, file] of files.entries()) {
      setUploading({ name: file.name, done: index, total: files.length })
      try {
        await upload.mutateAsync({ file, isPrimary: !hasPrimary })
        hasPrimary = true
        setUploaded((count) => count + 1)
      } catch {
        setRejected((count) => count + 1)
      }
    }
    setUploading(undefined)
  }

  if (place.isPending) {
    return (
      <div className="mx-auto w-full max-w-130 px-5 pt-5 md:px-10 md:pt-16">
        <InlineStatus>{t('addPlace.loading')}</InlineStatus>
      </div>
    )
  }
  if (!place.data || place.data.createdBy !== userId) {
    return (
      <div className="mx-auto w-full max-w-130 px-5 pt-5 md:px-10 md:pt-16">
        <EmptyState
          icon="pin"
          title={t('addPlace.sent.notYours')}
          description={t('addPlace.sent.notYoursHint')}
          action={
            <Button variant="secondary" size="sm" to={ROUTES.map}>
              {t('addPlace.sent.backToMap')}
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex w-full max-w-130 flex-col gap-5 px-5 pt-5 pb-8 md:justify-center md:px-10 md:pt-16">
        <IconTile icon="check" tone="success" size="lg" />
        <PageHeader size="lg" title={t('addPlace.sent.title')} lede={<Trans i18nKey="addPlace.sent.lede" values={{ name: place.data.name }} components={{ b: <b /> }} />} />
        <StepList
          items={[
            { icon: 'check', title: t('addPlace.sent.steps.submitted'), description: t('addPlace.sent.steps.submittedHint'), state: 'done' },
            { icon: 'flag', title: t('addPlace.sent.steps.review'), description: t('addPlace.sent.steps.reviewHint'), state: 'todo' },
            { icon: 'pin', title: t('addPlace.sent.steps.live'), description: t('addPlace.sent.steps.liveHint'), state: 'todo' },
          ]}
        />
        {addingPhotos && (
          <Dropzone
            onFiles={(files) => void uploadAll(files)}
            onReject={(files) => setRejected(files.length)}
            upload={uploading && { name: uploading.name, progress: Math.round((uploading.done / uploading.total) * 100) }}
          />
        )}
        {uploaded > 0 && <Callout tone="success" title={t('addPlace.sent.uploaded', { count: uploaded })} />}
        {rejected > 0 && <Callout tone="danger" title={t('addPlace.sent.rejected', { count: rejected })} />}
        <div className="flex flex-col gap-2.5 md:flex-row">
          {!addingPhotos && (
            <div className="md:flex-1">
              <Button variant="accent" icon="upload" className="w-full" onClick={() => setAddingPhotos(true)}>
                {t('addPlace.sent.addPhotos')}
              </Button>
            </div>
          )}
          <div className="md:flex-1">
            <Button variant="ghost" to={ROUTES.map} className="w-full">
              {t('addPlace.sent.backToMap')}
            </Button>
          </div>
        </div>
        <FormNote size="sm">{t('addPlace.sent.editNote')}</FormNote>
      </div>
    </div>
  )
}
