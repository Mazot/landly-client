import apiClient from '@/lib/axios'
import type { CreateReportRequest, Report } from '@/types/api'

export const reportApi = {
  /** Auth. */
  create: async (body: CreateReportRequest): Promise<Report> =>
    (await apiClient.post('/api/report/create', body)).data,
}
