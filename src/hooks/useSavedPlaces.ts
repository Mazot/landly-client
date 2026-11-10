import { useDeleteSavedItem, useSavedItems, useSaveItem } from './useSaved'
import type { Uuid } from '@/types/api'

/**
 * Which organisations the signed-in user saved, and a toggle for one of them.
 * `isSaved` is always false for a guest (the saved list is not requested).
 */
export function useSavedPlaces() {
  const { data } = useSavedItems({ kind: 'org' })
  const save = useSaveItem()
  const remove = useDeleteSavedItem()
  const savedByTarget = new Map((data?.items ?? []).map((item) => [item.targetId, item.id]))
  return {
    isSaved: (organisationId: Uuid) => savedByTarget.has(organisationId),
    toggle: (organisationId: Uuid) => {
      const savedId = savedByTarget.get(organisationId)
      if (savedId) remove.mutate(savedId)
      else save.mutate({ kind: 'org', target_id: organisationId })
    },
  }
}
