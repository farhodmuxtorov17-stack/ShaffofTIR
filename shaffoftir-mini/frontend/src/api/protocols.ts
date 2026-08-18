/**
 * Protocols API service.
 */
import { http } from './client'
import type { Protocol } from '@/types'

export const protocolsApi = {
  list: () => http.get<Protocol[]>('/protocols/'),
  get: (id: string) => http.get<Protocol>(`/protocols/${id}/`),
  sign: (id: string) => http.post<Protocol>(`/protocols/${id}/sign/`),
  approve: (id: string) => http.post<Protocol>(`/protocols/${id}/approve/`),
  archive: (id: string) => http.post<Protocol>(`/protocols/${id}/archive/`),
}
