/**
 * Analytics API service.
 */
import { http } from './client'

interface AnalyticsSummary {
  total_sessions: number
  total_shots: number
  avg_accuracy: number
  total_employees_trained: number
  total_weapons: number
  weapons_available: number
  protocols_approved: number
  pass_rate: number
}

interface PerformanceTrend {
  month: string
  sessions: number
  avg_score: number
  avg_accuracy: number
  pass_rate: number
}

export const analyticsApi = {
  summary: () => http.get<AnalyticsSummary>('/analytics/summary/'),
  trends: () => http.get<PerformanceTrend[]>('/analytics/trends/'),
  exportCsv: () => {
    const token = localStorage.getItem('shaffotir_token')
    return fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/reports/export/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.blob())
  },
}
