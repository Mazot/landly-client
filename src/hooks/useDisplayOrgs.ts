import { useMemo } from 'react'
import { useOrganizations, useOrganization } from './useOrganizations'
import { useCountries, useOrganizationTypes } from './useReferences'
import { byId, toDisplayOrg, type DisplayOrg } from '@/lib/displayOrg'
import type { OrganizationFilters } from '@/services/organization.service'

/** Fetches organizations for the given filters and maps them to display shape. */
export function useDisplayOrgs(filters: OrganizationFilters) {
  const orgsQ = useOrganizations(filters)
  const { data: types } = useOrganizationTypes()
  const { data: countries } = useCountries()

  const typeMap = useMemo(() => byId(types), [types])
  const countryMap = useMemo(() => byId(countries), [countries])

  const items: DisplayOrg[] = useMemo(
    () => (orgsQ.data?.items ?? []).map((o) => toDisplayOrg(o, typeMap, countryMap)),
    [orgsQ.data, typeMap, countryMap]
  )

  return {
    items,
    total: orgsQ.data?.total ?? 0,
    isLoading: orgsQ.isLoading,
    isError: orgsQ.isError,
  }
}

/** Fetches a single organization by id and maps it to display shape. */
export function useDisplayOrg(id: string) {
  const orgQ = useOrganization(id)
  const { data: types } = useOrganizationTypes()
  const { data: countries } = useCountries()

  const org: DisplayOrg | undefined = useMemo(
    () => (orgQ.data ? toDisplayOrg(orgQ.data, byId(types), byId(countries)) : undefined),
    [orgQ.data, types, countries]
  )

  return { org, isLoading: orgQ.isLoading, isError: orgQ.isError }
}
