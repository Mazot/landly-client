import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { reportApi } from '@/services/report.service'
import type { CreateReportRequest } from '@/types/api'

export const useCreateReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReportRequest) => reportApi.create(body),
    // Open reports are counted in the moderation queue.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.moderation.all }),
  })
}
