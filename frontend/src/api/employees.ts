/**
 * Employees API service.
 */
import { http } from './client'
import type { Employee } from '@/types'

export const employeesApi = {
  list: () => http.get<Employee[]>('/employees/'),
  get: (id: string) => http.get<Employee>(`/employees/${id}/`),
}
