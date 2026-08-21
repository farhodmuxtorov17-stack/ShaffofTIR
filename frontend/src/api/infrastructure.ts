/**
 * Infrastructure API service — cameras, lanes, ranges.
 */
import { http } from './client'
import type { ShootingLane, LaneCamera } from '@/types'

interface CameraHealthResult {
  camera_results: Array<{ camera_ip: string; label: string; status: string }>
  summary: { total: number; online: number; offline: number; errors: number }
}

export const infrastructureApi = {
  // Lanes
  listLanes: () => http.get<ShootingLane[]>('/lanes/'),
  getLane: (id: string) => http.get<ShootingLane>(`/lanes/${id}/`),
  updateLane: (id: string, data: Partial<ShootingLane>) =>
    http.patch<ShootingLane>(`/lanes/${id}/`, data),

  // Cameras
  listCameras: () => http.get<LaneCamera[]>('/cameras/'),
  checkHealth: (cameras?: Array<{ camera_ip: string; label: string }>) =>
    http.post<CameraHealthResult>('/cameras/health/', { cameras }),
}
