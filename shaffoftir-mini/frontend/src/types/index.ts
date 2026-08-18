export type Role = 'INSTRUCTOR' | 'TECHSPEC'

export interface User {
  id: string
  email: string
  full_name: string
  role: Role
  rank?: string
  department?: string
  locale?: string
}

export interface Employee {
  id: string
  full_name: string
  rank: string
  position: string
  department: string
  unit: string
  region: string
  district: string
  personal_number: string
  status: string
  shooting_qualified: boolean
  tb_test_passed: boolean
  qualification_level: string
  total_sessions: number
  total_score: number
  avg_accuracy: number
}

export interface Weapon {
  id: string
  name: string
  category: string
  serial_number: string
  caliber: string
  status: string
  condition: string
  assigned_to?: string
  total_shots_fired: number
  max_range_m: number
}

export interface ShootingLane {
  id: string
  lane_number: number
  name: string
  status: string
  target_type: string
  distance_m: number
  camera_status: string
  camera_ip?: string
  current_employee_name?: string
  weapon_assigned?: string
}

export interface ShootingSession {
  id: string
  session_id: string
  status: string
  scoring_mode: string
  employee_name: string
  employee_rank?: string
  employee_department?: string
  weapon_name?: string
  instructor_name?: string
  range_name?: string
  lane_number?: number
  total_score: number
  total_shots: number
  hit_count: number
  miss_count: number
  accuracy: number
  passed: boolean
  created_at: string
  completed_at?: string
  soldiers?: Soldier[]
}

export interface Soldier {
  id: string
  sequence_number: number
  employee_name?: string
  total_score: number
  hit_count: number
  miss_count: number
  accuracy: number
  passed: boolean
  status: string
}

export interface Shot {
  id: string
  shot_number: number
  x: number
  y: number
  score: number
  is_hit: boolean
  shot_type: string
}

export interface Protocol {
  id: string
  session_id_str?: string
  employee_name: string
  employee_rank?: string
  employee_department?: string
  weapon_name?: string
  instructor_name?: string
  total_shots: number
  hit_count: number
  miss_count: number
  total_score: number
  accuracy: number
  passed: boolean
  qualification?: string
  status: string
  location?: string
  lane_number?: number
  created_at: string
}

export interface LaneCamera {
  id: string
  name: string
  camera_ip: string
  lane_number: number
  status: string
  username?: string
  port?: number
}

export interface AuditLog {
  id: string
  actor_name: string
  actor_role: string
  action: string
  module: string
  details: string
  ip_address?: string
  timestamp: string
}

// FaceID types
export interface FaceRegistration {
  id: string
  employee: string
  employee_name: string
  face_encoding: string
  photo_reference?: string
  is_active: boolean
}

export interface FaceCheckInEntry {
  id: string
  check_in: string
  employee?: string
  employee_name?: string
  employee_rank?: string
  employee_department?: string
  sequence_number: number
  status: string
  confidence_score: number
  photo_captured?: string
}

export interface FaceCheckIn {
  id: string
  check_in_id: string
  instructor_name: string
  range_name?: string
  status: string
  total_identified: number
  total_unknown: number
  entries: FaceCheckInEntry[]
  created_at: string
}

// Queue types
export interface QueueEntry {
  id: string
  queue: string
  employee?: string
  employee_name: string
  employee_rank: string
  employee_department: string
  sequence_number: number
  status: string
  pre_shoot_photo?: string
  post_shoot_photo?: string
  started_at?: string
  completed_at?: string
  total_shots: number
  hit_count: number
  miss_count: number
  total_score: number
  accuracy: number
  passed: boolean
}

export interface ShootingQueue {
  id: string
  queue_id: string
  instructor_name: string
  range_name: string
  lane_name?: string
  status: string
  total_soldiers: number
  current_position: number
  completed_count: number
  auto_advance: boolean
  remaining_count: number
  is_last: boolean
  entries: QueueEntry[]
  created_at: string
  activated_at?: string
}

// AI Analysis types
export interface DetectedHit {
  x: number
  y: number
  score: number
  ring?: number
}

export interface ShotAnalysis {
  id: string
  analysis_id: string
  queue_entry?: string
  session?: string
  soldier_seq: number
  status: string
  before_photo_url: string
  after_photo_url: string
  annotated_photo_url?: string
  detected_hits: DetectedHit[]
  detected_misses: DetectedHit[]
  total_shots_detected: number
  hit_count: number
  miss_count: number
  total_score: number
  accuracy: number
  confidence: number
  created_at: string
  completed_at?: string
}


// Range structure types
export interface RangeRubeg {
  id: string
  range: string
  rubeg_number: number
  distance: number
  max_lanes: number
  description?: string
  is_active: boolean
  lanes: any[]
  lane_count: number
  created_at: string
}

export interface RangeStructure {
  range_type: 'OPEN' | 'CLOSED'
  range: Range
  rubegs?: RangeRubeg[]
  lanes?: any[]
}
