/**
 * FaceID API service.
 */
import { http } from './client'

interface FaceCheckInEntry {
  employee_id?: string
  employee_name?: string
  employee_rank?: string
  employee_department?: string
}

export const faceidApi = {
  listRegistrations: () => http.get('/face-registrations/'),
  registerFace: (employee_id: string, face_encoding: string, photo_reference?: string) =>
    http.post('/face-registrations/', { employee: employee_id, face_encoding, photo_reference }),
  identify: (face_encoding: string) =>
    http.post('/face-registrations/identify/', { face_encoding }),
  listCheckIns: () => http.get('/face-checkins/'),
  createGroupCheckIn: (range_id: string, employee_ids: string[], manual_names?: string[]) =>
    http.post('/face-checkins/create_group/', { range_id, employee_ids, manual_names }),
}
