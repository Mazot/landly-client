import { useDeleteSavedItem, useSavedItems, useSaveItem } from './useSaved'
import type { SavedKind, Uuid } from '@/types/api'

/**
 * Which targets of one kind the signed-in user saved, and a toggle for one of them.
 * `isSaved` is always false for a guest (the saved list is not requested).
 */
export function useSavedTargets(kind: SavedKind) {
  const { data } = useSavedItems({ kind })
  const save = useSaveItem()
  const remove = useDeleteSavedItem()
  const savedByTarget = new Map((data?.items ?? []).map((item) => [item.targetId, item.id]))
  return {
    isSaved: (targetId: Uuid) => savedByTarget.has(targetId),
    toggle: (targetId: Uuid) => {
      const savedId = savedByTarget.get(targetId)
      // A tap while this target's save or removal is on its way would send it twice.
      if (save.isPending && save.variables?.target_id === targetId) return
      if (remove.isPending && remove.variables === savedId) return
      if (savedId) remove.mutate(savedId)
      else save.mutate({ kind, target_id: targetId })
    },
  }
}

/** The organisations the user saved. */
export const useSavedPlaces = () => useSavedTargets('org')

/** The helpers the user saved. */
export const useSavedPeople = () => useSavedTargets('person')
