import { useTranslation } from 'react-i18next'
import { Badge, Button, CorridorFlags, ListItem, TypeBar } from '@/components/ui'
import { useCorridorStats } from '@/hooks/useCorridors'
import type { Corridor, Country, OrganisationType } from '@/types/api'

export interface CorridorCardProps {
  corridor: Corridor
  /** Both countries of the corridor (null while the country list is loading). */
  from: Country | undefined
  to: Country | undefined
  orgTypes: OrganisationType[]
  /** The corridor picked in the list: the footer button switches to it. */
  selected: boolean
  onSelect: (corridor: Corridor) => void
  onSetDefault: (corridor: Corridor) => void
  /** A "set default" request for this corridor is running. */
  settingDefault: boolean
}

/** One saved corridor: flags and names, live places and what is new, the type split, default badge or "Set default". */
export function CorridorCard({ corridor, from, to, orgTypes, selected, onSelect, onSetDefault, settingDefault }: CorridorCardProps) {
  const { t } = useTranslation()
  const stats = useCorridorStats(corridor.id).data
  const name = from && to ? t('corridorSwitcher.label', { from: from.name, to: to.name }) : ''
  const titles = new Map(orgTypes.map((type) => [type.slug, type.title ?? type.type]))
  const segments = (stats?.byType ?? []).map((entry) => ({ slug: entry.slug, count: entry.count, label: titles.get(entry.slug) ?? entry.slug }))

  return (
    <div className="relative">
      <ListItem
        variant="card"
        active={selected}
        onClick={() => onSelect(corridor)}
        leading={<CorridorFlags from={from?.flag ?? null} to={to?.flag ?? null} label={name} size="md" />}
        title={name}
        subtitle={stats ? [t('corridors.places', { count: stats.totalPlaces }), t('map.newThisWeek', { count: stats.newThisWeek })].join(' · ') : undefined}
        trailing={corridor.isDefault ? <Badge tone="accent">{t('corridors.default')}</Badge> : <span aria-hidden="true" className="w-19" />}
        footer={segments.length > 0 ? <TypeBar segments={segments} label={t('landing.byType')} /> : undefined}
      />
      {!corridor.isDefault && (
        <div className="absolute top-3 right-3">
          <Button variant="ghost" size="sm" loading={settingDefault} aria-label={t('corridors.makeDefault', { name })} onClick={() => onSetDefault(corridor)}>
            {t('corridors.setDefault')}
          </Button>
        </div>
      )}
    </div>
  )
}
