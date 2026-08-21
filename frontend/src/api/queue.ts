/**
 * Shooting queue API service.
 */
import { http } from './client'

interface SoldierData {
  employee_id?: string
  employee_name: string
  employee_rank?: string
  employee_department?: string
}

interface CompletionResults {
  total_shots?: number
  hit_count?: number
  miss_count?: number
  total_score?: number
  accuracy?: number
  passed?: boolean
}

export const queueApi = {
  list: () => http.get('/queues/'),
  get: (id: string) => http.get(`/queues/${id}/`),
  createManual: (range_id: string, soldiers: SoldierData[], lane_id?: string, auto_advance = true) =>
    http.post('/queues/create_manual/', { range_id, soldiers, lane_id, auto_advance }),
  createFromCheckIn: (check_in_id: string, range_id: string, lane_id?: string, auto_advance = true) =>
    http.post(`/queues/${check_in_id}/create_from_checkin/`, { range_id, lane_id, auto_advance }),
  activate: (id: string) => http.post(`/queues/${id}/activate/`),
  completeCurrent: (id: string, results?: CompletionResults) =>
    http.post(`/queues/${id}/complete_current/`, results || {}),
  skipCurrent: (id: string) => http.post(`/queues/${id}/skip_current/`),
  pause: (id: string) => http.post(`/queues/${id}/pause/`),
  resume: (id: string) => http.post(`/queues/${id}/resume/`),
  getState: (id: string) => http.get(`/queues/${id}/state/`),
}
