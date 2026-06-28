/* Organization full page (/org/:id) — responsive: 1-col mobile, 2-col tablet/desktop. */
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
import { useBreakpoint } from '@/hooks/useBreakpoint'

function OrgSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="flex justify-between" style={{ alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ font: '600 17px/1 var(--font-sans)', margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function ExternalMapsRow() {
  const { t } = useTranslation()
  const maps = [
    { l: t('orgFull.maps.google'), c: '#4285F4' },
    { l: t('orgFull.maps.apple'), c: '#1B1A17' },
    { l: t('orgFull.maps.gis'), c: '#4F7F5C' },
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

  const isMobile = useBreakpoint('mobile')
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

  const savedEntry = {
    kind: 'org' as const,
    id: org.id, name: org.name, typeKey: org.typeKey,
    typeLabel: org.typeLabel, typeColor: org.typeColor,
    city: org.countryName, initials: org.initials,
  }

  const renderContactCard = () => (
    <div className="l-card" style={{ padding: 20 }}>
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
  )

  return (
    <div className="l-scroll" style={{ height: '100dvh', background: 'var(--bg)', overflow: 'auto' }}>
      {/* Sticky top bar — compact on mobile, wider on desktop */}
      <div
        className="flex items-center px-4 md:px-8"
        style={{
          position: 'sticky', top: 0, zIndex: 10,
          height: 52,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-1)',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/map')} style={{ flexShrink: 0 }}>
          <Icon name="arrowLeft" size={14} />
          <span className="hidden md:inline"> {t('orgFull.backToMap')}</span>
        </Button>
        <div
          className="flex items-center"
          style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-2)', gap: 8, flex: 1, overflow: 'hidden' }}
        >
          {to?.name && (
            <>
              <span className="hidden md:inline">{to.name}</span>
              <Icon name="chevronRight" size={11} className="hidden md:block" style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
            </>
          )}
          <span style={{ color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {org.name}
          </span>
        </div>
        <Button variant="ghost" size="sm" iconButton style={{ width: 36, height: 36, flexShrink: 0 }} aria-label={t('orgFull.copyLink')}>
          <Icon name="link" size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          style={{ color: saved ? 'var(--accent)' : undefined, flexShrink: 0 }}
          onClick={() => toggle(savedEntry)}
        >
          <Icon name="bookmark" size={14} />
          <span className="hidden md:inline"> {saved ? t('orgFull.saved') : t('orgFull.save')}</span>
        </Button>
      </div>

      {/* Hero — 195px mobile, 260px desktop */}
      <OrgHeroCover color={hex} height={isMobile ? 195 : 260}>
        {images.length > 0 && (
          <Button size="sm" style={{ position: 'absolute', bottom: 12, right: 16, background: 'rgba(255,255,255,0.95)', color: 'var(--ink-1)' }}>
            <Icon name="grid" size={13} /> {t('orgFull.photosCount', { count: images.length })}
          </Button>
        )}
      </OrgHeroCover>

      {/* Body — 1-col mobile, 2-col tablet (1fr 300px), 2-col desktop (1fr 380px) */}
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px]"
        style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 16px 48px', gap: 40 }}
      >
        {/* Main content */}
        <div>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
            <TypeChip type={org.typeKey} label={org.typeLabel} soft />
          </div>
          {/* Headline — 30px mobile, 46px tablet+ */}
          <h1
            className="l-display text-[30px] md:text-[46px]"
            style={{ margin: '0 0 8px 0', fontWeight: 400 }}
          >
            {org.name}
          </h1>
          {org.address && (
            <div style={{ font: '500 14px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginBottom: 20 }}>
              {org.address}
            </div>
          )}

          {/* CTA row — mobile only (directions + call + mail) */}
          <div className="md:hidden flex" style={{ gap: 8, marginBottom: 24 }}>
            <Button style={{ flex: 1, justifyContent: 'center' }}>
              <Icon name="pin" size={13} /> {t('orgFull.getDirections')}
            </Button>
            {org.tel && (
              <Button variant="ghost" style={{ flex: 1, justifyContent: 'center' }}>
                <Icon name="phone" size={13} /> {t('orgFull.call', 'Call')}
              </Button>
            )}
            {org.email && (
              <Button variant="ghost" iconButton style={{ width: 44, height: 44 }}>
                <Icon name="mail" size={14} />
              </Button>
            )}
          </div>

          {org.description && (
            <OrgSection title={t('orgFull.about')}>
              <p style={{ font: '400 15px/1.65 var(--font-sans)', color: 'var(--ink-2)', margin: 0 }}>
                {org.description}
              </p>
            </OrgSection>
          )}

          {images.length > 0 && (
            <OrgSection title={t('orgFull.photos')}>
              {/* 2-col mobile, 4-col desktop */}
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 10 }}>
                {images.map((img) => (
                  <div key={img.id} style={{ aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', background: 'var(--surface-2)' }}>
                    <img src={img.url} alt={org.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </OrgSection>
          )}

          {/* Contact card — mobile only (below content); hidden on md+ since it's in the sidebar */}
          <div className="md:hidden" style={{ marginTop: 8 }}>
            {renderContactCard()}
          </div>
        </div>

        {/* Right sidebar — tablet/desktop only */}
        <div className="hidden md:block">
          <div style={{ position: 'sticky', top: 72 }}>
            {renderContactCard()}
          </div>
        </div>
      </div>
    </div>
  )
}
