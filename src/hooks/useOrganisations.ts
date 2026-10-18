import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { organisationApi } from '@/services/organisation.service'
import type {
  CheckinRequest,
  CreateOrganisationRequest,
  Organisation,
  OrganisationsListQuery,
  SearchOrganisationsQuery,
  UpdateOrganisationRequest,
  Uuid,
} from '@/types/api'

export const useOrganisations = (query?: OrganisationsListQuery) =>
  useQuery({
    queryKey: queryKeys.organisations.list(query),
    queryFn: () => organisationApi.list(query),
  })

/**
 * Map search. Pass `undefined` until the map knows its bounds; the previous
 * result stays on screen while the next viewport loads.
 */
export const useSearchOrganisations = (query: SearchOrganisationsQuery | undefined) =>
  useQuery({
    queryKey: queryKeys.organisations.search(query ?? {}),
    queryFn: () => organisationApi.search(query!),
    enabled: !!query,
    placeholderData: keepPreviousData,
  })

export const useOrganisation = (id: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.organisations.detail(id ?? ''),
    queryFn: () => organisationApi.fetch(id!),
    enabled: !!id,
  })

/** Lists, search results and the creator's stats change with any write. */
const useInvalidateOrganisations = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.organisations.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.me })
  }
}

export const useCreateOrganisation = () => {
  const invalidate = useInvalidateOrganisations()
  return useMutation({
    mutationFn: (body: CreateOrganisationRequest) => organisationApi.create(body),
    onSuccess: invalidate,
  })
}

export const useUpdateOrganisation = () => {
  const invalidate = useInvalidateOrganisations()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body: UpdateOrganisationRequest }) => organisationApi.update(id, body),
    onSuccess: invalidate,
  })
}

export const useDeleteOrganisation = () => {
  const invalidate = useInvalidateOrganisations()
  return useMutation({
    mutationFn: (id: Uuid) => organisationApi.remove(id),
    onSuccess: invalidate,
  })
}

/** Answers the fresh detail payload, which replaces the cached one. */
export const useCheckin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body?: CheckinRequest }) => organisationApi.checkin(id, body),
    onSuccess: (organisation) =>
      queryClient.setQueryData(queryKeys.organisations.detail(organisation.id), organisation),
  })
}

/** Call once per detail-page view. */
export const useRecordVisit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Uuid) => organisationApi.visit(id),
    onSuccess: ({ visitsCount }, id) =>
      queryClient.setQueryData<Organisation>(queryKeys.organisations.detail(id), (cached) =>
        cached ? { ...cached, visitsCount } : cached,
      ),
  })
}
