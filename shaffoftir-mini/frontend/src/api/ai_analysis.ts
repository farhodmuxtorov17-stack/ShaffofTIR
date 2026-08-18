/**
 * AI shot analysis API service.
 */
import { http } from './client'

interface CreateAnalysisPayload {
  queue_entry_id?: string
  session_id?: string
  soldier_seq?: number
  before_photo_url: string
  after_photo_url: string
}

export const aiAnalysisApi = {
  list: () => http.get('/shot-analyses/'),
  get: (id: string) => http.get(`/shot-analyses/${id}/`),
  createAndRun: (payload: CreateAnalysisPayload) =>
    http.post('/shot-analyses/create_and_run/', payload),
  run: (id: string) => http.post(`/shot-analyses/${id}/run/`),
}
