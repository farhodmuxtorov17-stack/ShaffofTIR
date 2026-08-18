/**
 * Shooting sessions API service.
 */
import { http } from './client'
import type { ShootingSession, Shot } from '@/types'

interface StartSessionPayload {
  soldier_count: number
  scoring_mode?: string
  range_type?: string
  distance?: number
}

interface ProcessTurnPayload {
  soldier_seq: number
  shot_type?: string
  shots: Array<{ x: number; y: number; score: number }>
}

interface ProcessTurnResponse {
  session_id: string
  soldier_sequence: number
  new_shots: Shot[]
  total_score: number
  hit_count: number
  miss_count: number
  accuracy: number
  passed: boolean
}

export const sessionsApi = {
  list: () => http.get<ShootingSession[]>('/sessions/'),
  get: (id: string) => http.get<ShootingSession>(`/sessions/${id}/`),
  start: (data: StartSessionPayload) => http.post<ShootingSession>('/sessions/start/', data),
  processTurn: (id: string, data: ProcessTurnPayload) =>
    http.post<ProcessTurnResponse>(`/sessions/${id}/process_turn/`, data),
  transition: (id: string, status: string) =>
    http.post<ShootingSession>(`/sessions/${id}/transition/`, { status }),
  delete: (id: string) => http.delete(`/sessions/${id}/`),
}
