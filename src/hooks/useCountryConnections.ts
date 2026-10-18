import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { countryConnectionApi } from '@/services/country-connection.service'
import type {
  CountryConnectionsQuery,
  CreateCountryConnectionRequest,
  UpdateCountryConnectionRequest,
  Uuid,
} from '@/types/api'

export const useCountryConnections = (query?: CountryConnectionsQuery) =>
  useQuery({
    queryKey: queryKeys.countryConnections.list(query),
    queryFn: () => countryConnectionApi.list(query),
  })

export const useCountryConnection = (id: Uuid | undefined) =>
  useQuery({
    queryKey: queryKeys.countryConnections.detail(id ?? ''),
    queryFn: () => countryConnectionApi.fetch(id!),
    enabled: !!id,
  })

const useInvalidateCountryConnections = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.countryConnections.all })
}

/** Admin only. */
export const useCreateCountryConnection = () => {
  const invalidate = useInvalidateCountryConnections()
  return useMutation({
    mutationFn: (body: CreateCountryConnectionRequest) => countryConnectionApi.create(body),
    onSuccess: invalidate,
  })
}

/** Admin only. */
export const useUpdateCountryConnection = () => {
  const invalidate = useInvalidateCountryConnections()
  return useMutation({
    mutationFn: ({ id, body }: { id: Uuid; body: UpdateCountryConnectionRequest }) =>
      countryConnectionApi.update(id, body),
    onSuccess: invalidate,
  })
}

/** Admin only. */
export const useDeleteCountryConnection = () => {
  const invalidate = useInvalidateCountryConnections()
  return useMutation({
    mutationFn: (id: Uuid) => countryConnectionApi.remove(id),
    onSuccess: invalidate,
  })
}
