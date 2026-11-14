import { uniqBy } from 'es-toolkit'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { useCountryConnections } from '@/hooks/useCountryConnections'
import { placePath } from '@/lib/routes'
import type { ConnectedOrganisation, Uuid } from '@/types/api'

/** One page of connections is plenty: an embassy has a handful of consulates. */
export const CONSULAR_NETWORK_LIMIT = 50

export interface ConsularNetworkProps {
  organisationId: Uuid
  /** Rendered around the links when there are any (the section heading). */
  children: (links: ReactNode) => ReactNode
}

/**
 * The consulates linked to an embassy, or the embassy a consulate belongs to, each opening its page
 * (`GET /country-connection/list`). Renders nothing when the place has no such links.
 */
export function ConsularNetwork({ organisationId, children }: ConsularNetworkProps) {
  const { t } = useTranslation()
  const consulates = useCountryConnections({ embassy_org_id: organisationId, limit: CONSULAR_NETWORK_LIMIT })
  const embassies = useCountryConnections({ consulate_org_id: organisationId, limit: CONSULAR_NETWORK_LIMIT })
  const all: { org: ConnectedOrganisation; role: 'consulate' | 'embassy' }[] = [
    ...(embassies.data?.items ?? []).flatMap((connection) => (connection.embassy ? [{ org: connection.embassy, role: 'embassy' as const }] : [])),
    ...(consulates.data?.items ?? []).flatMap((connection) => (connection.consulate ? [{ org: connection.consulate, role: 'consulate' as const }] : [])),
  ]
  // One place can be linked by several connections (one per country): list it once.
  const links = uniqBy(all, (link) => `${link.role}:${link.org.id}`)
  if (links.length === 0) return null

  return children(
    <div className="flex flex-wrap gap-2">
      {links.map(({ org, role }) => (
        <Button key={`${role}-${org.id}`} to={placePath(org.id)} variant="secondary" size="sm">
          {t(`place.network.${role}`, { place: org.city ?? org.name })}
        </Button>
      ))}
    </div>,
  )
}
