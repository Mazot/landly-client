/* Organization full page (/org/:id) — long-form, full-bleed, server-backed. */
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDisplayOrg } from '@/hooks/useDisplayOrgs'
import { useOrgImages } from '@/hooks/useImages'
import { useCorridor } from '@/hooks/useCorridor'
import { useSavedStore } from '@/stores/savedStore'
import TypeChip from '@/components/ui/TypeChip'
import Icon, { type IconName } from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import InfoRow from '@/components/ui/InfoRow'
import OrgHeroCover from '@/components/ui/OrgHeroCover'
import LandlyMap from '@/components/map/LandlyMap'

function OrgSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div className="flex justify-between" style={{ alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ font: '600 18px/1 var(--font-sans)', margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function ExternalMapsRow() {
  const { t } = useTranslation()
  const maps = [
    { l: 'Google Maps', c: '#4285F4' },
    { l: 'Apple Maps', c: '#1B1A17' },
    { l: '2GIS', c: '#4F7F5C' },
  ]
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <Button fullWidth style={{ justifyContent: 'center' }}>
        <Icon name="pin" size={15} /> {t('orgFull.getDirections')}
      </Button>
      <div className="flex" style={{ gap: 8 }}>
        {maps.map((m) => (
          <Button key={m.l} variant="ghost" size="sm" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: m.c }} /> {m.l}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default function OrganizationDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { to } = useCorridor()
  const { isSaved, toggle } = useSavedStore()

  const { org, isLoading } = useDisplayOrg(id ?? '')
  const { data: imagesData } = useOrgImages(id ?? '')
  const images = imagesData?.items ?? []

  if (isLoading || !org) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100vh', background: 'var(--bg)' }}>
        <span style={{ font: '500 14px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
          {isLoading ? t('map.loading') : t('orgFull.notFound')}
        </span>
      </div>
    )
  }

  const saved = isSaved(org.id)
  const hex = org.typeColor

  const contacts: { icon: IconName; value: string }[] = []
  if (org.tel) contacts.push({ icon: 'phone', value: org.tel })
  if (org.email) contacts.push({ icon: 'mail', value: org.email })

  return (
    <div className="l-scroll" style={{ height: '100vh', background: 'var(--bg)', overflow: 'auto' }}>
      {/* sticky bar */}
      <div
        className="flex items-center"
        style={{ position: 'sticky', top: 0, zIndex: 10, height: 56, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-1)', padding: '0 32px', gap: 12 }}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
          <Icon name="arrowLeft" size={14} /> {t('orgFull.backToMap')}
        </Button>
        <div className="flex items-center" style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)', gap: 8 }}>
          {to?.name && (
            <>
              <span>{to.name}</span>
              <Icon name="chevronRight" size={11} style={{ color: 'var(--ink-4)' }} />
            </>
          )}
          <span style={{ color: 'var(--ink-1)' }}>{org.name}</span>
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" iconButton style={{ width: 36, height: 36 }} aria-label={t('orgFull.copyLink')}>
          <Icon name="link" size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          style={{ color: saved ? 'var(--accent)' : undefined }}
          onClick={() =>
            toggle({ kind: 'org', id: org.id, name: org.name, typeKey: org.typeKey, typeLabel: org.typeLabel, typeColor: org.typeColor, city: org.countryName, initials: org.initials })
          }
        >
          <Icon name="bookmark" size={14} /> {saved ? t('orgFull.saved') : t('orgFull.save')}
        </Button>
      </div>

      {/* hero cover */}
      <OrgHeroCover color={hex} height={260}>
        {images.length > 0 && (
          <Button size="sm" style={{ position: 'absolute', bottom: 16, right: 32, background: 'rgba(255,255,255,0.95)', color: 'var(--ink-1)' }}>
            <Icon name="grid" size={13} /> {t('orgFull.photosCount', { count: images.length })}
          </Button>
        )}
      </OrgHeroCover>

      {/* body */}
      <div className="grid" style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 64px 32px', gridTemplateColumns: '1fr 380px', gap: 48 }}>
        {/* left */}
        <div>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
            <TypeChip type={org.typeKey} label={org.typeLabel} soft />
          </div>
          <h1 className="l-display" style={{ fontSize: 46, margin: '0 0 8px 0', fontWeight: 400 }}>{org.name}</h1>
          {org.address && <div style={{ font: '500 14.5px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginBottom: 28 }}>{org.address}</div>}

          {org.description && (
            <OrgSection title={t('orgFull.about')}>
              <p style={{ font: '400 15.5px/1.65 var(--font-sans)', color: 'var(--ink-2)', margin: 0, maxWidth: 640 }}>{org.description}</p>
            </OrgSection>
          )}

          {images.length > 0 && (
            <OrgSection title={t('orgFull.photos')}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {images.map((img) => (
                  <div key={img.id} style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: 'var(--surface-2)' }}>
                    <img src={img.url} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </OrgSection>
          )}
        </div>

        {/* right sticky */}
        <div>
          <div className="l-card" style={{ padding: 20, position: 'sticky', top: 76 }}>
            <ExternalMapsRow />

            {contacts.length > 0 && (
              <>
                <div className="l-hairline" style={{ margin: '18px 0' }} />
                <div className="flex flex-col" style={{ gap: 12 }}>
                  {contacts.map((c) => (
                    <InfoRow key={c.value} icon={c.icon} size={30}>{c.value}</InfoRow>
                  ))}
                </div>
              </>
            )}

            {org.coord && (
              <div style={{ marginTop: 18, height: 150, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid var(--border-1)' }}>
                <LandlyMap
                  markers={[{ id: org.id, coord: org.coord, type: org.typeKey, name: org.name }]}
                  center={org.coord}
                  zoom={12}
                  activeId={org.id}
                  showControls={false}
                  interactive={false}
                />
              </div>
            )}

            <button
              className="flex items-center justify-center"
              style={{ marginTop: 14, width: '100%', background: 'transparent', border: 0, font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-3)', cursor: 'pointer', gap: 6 }}
            >
              <Icon name="flag" size={13} /> {t('orgFull.reportProblem')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
