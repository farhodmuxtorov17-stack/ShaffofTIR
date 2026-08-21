/**
 * Weapons API service.
 */
import { http } from './client'
import type { Weapon } from '@/types'

export const weaponsApi = {
  list: () => http.get<Weapon[]>('/weapons/'),
  get: (id: string) => http.get<Weapon>(`/weapons/${id}/`),
  update: (id: string, data: Partial<Weapon>) => http.patch<Weapon>(`/weapons/${id}/`, data),
}
