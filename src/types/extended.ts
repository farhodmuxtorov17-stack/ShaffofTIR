// ============================================================
// ShaffofTIR - Extended Types (5 roles: SUPER_ADMIN, INSTRUCTOR, MANAGER, EMPLOYEE, TECHSPEC)
// ============================================================
import type { ShotType } from "./index";

// --- Auth & Roles ---
export type UserRole = 'SUPER_ADMIN' | 'INSTRUCTOR' | 'MANAGER' | 'EMPLOYEE' | 'TECHSPEC';

export interface SystemUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  rank?: string | null;
  department?: string | null;
  is_active: boolean;
  last_login?: string | null;
  created_at: string;
  locale?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: SystemUser;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

// --- Scoring Modes (Dual Scoring System) ---
export type ScoringMode = 'POINTS' | 'HIT_MISS';

export interface ScoringModeConfig {
  mode: ScoringMode;
  // POINTS mode: ring values (10, 9, 8, 7, 6...)
  ringValues?: number[];
  maxScore: number;
  // HIT_MISS mode: hit = pass, miss = fail
  hitThreshold?: number; // minimum score to count as hit (for POINTS→HIT conversion)
  // Ammo config
  testRounds: number;   // пробные патроны
  combatRounds: number; // боевые/зачётные патроны
  // Target type
  targetType: 'CIRCLE_RINGS' | 'SILHOUETTE' | 'TANK_TARGET';
}

// --- HR Module ---
export interface HREmployee {
  id: string;
  full_name: string;
  rank: string;
  position: string;
  department: string;
  region?: string;
  district?: string;
  battalion?: string;
  unit: string;
  personal_number: string;
  birth_date: string;
  phone: string;
  email?: string | null;
  face_id_registered: boolean;
  face_id_image_url?: string | null;
  face_id_confidence?: number | null;
  status: 'ACTIVE' | 'RESERVE' | 'RETIRED' | 'DISMISSED';
  hire_date: string;
  shooting_qualified: boolean;
  qualification_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null;
  total_sessions: number;
  total_score: number;
  avg_accuracy: number;
  last_shooting_date?: string | null;
  // TB Test requirement
  tb_test_passed: boolean;
  tb_test_score?: number | null;
  tb_test_date?: string | null;
  created_at: string;
}

export interface HRDepartment {
  id: string;
  name: string;
  code: string;
  head: string;
  employee_count: number;
  description?: string;
  created_at: string;
}

export interface FaceIDRegistration {
  employee_id: string;
  face_image: File;
  status: 'PENDING' | 'REGISTERED' | 'FAILED';
  registered_at?: string;
  confidence_score?: number;
}

// --- Weapons Module ---
export type WeaponCategory = 'PISTOL' | 'RIFLE' | 'SMG' | 'SNIPER' | 'SHOTGUN' | 'MACHINE_GUN';

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  serial_number: string;
  caliber: string;
  manufacturer: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  assigned_to?: string | null;
  last_maintenance?: string | null;
  total_shots_fired: number;
  image_url?: string | null;
  max_range_m: number;
  ammo_type: string;
  created_at: string;
}

export interface WeaponAssignment {
  id: string;
  weapon_id: string;
  weapon_name: string;
  employee_id: string;
  employee_name: string;
  session_id: string;
  assigned_at: string;
  returned_at?: string | null;
  rounds_fired: number;
  status: 'ASSIGNED' | 'RETURNED' | 'LOST';
}

// --- Shooting Range ---
export interface ShootingLane {
  id: string;
  lane_number: number;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  current_employee_id?: string | null;
  current_employee_name?: string | null;
  current_employee_seq?: number | null;
  camera_ip?: string | null;
  camera_status?: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  target_type: 'STANDARD' | 'SILHOUETTE' | 'CIRCLE' | 'CUSTOM';
  distance_m: number;
  weapon_assigned?: string | null;
  session_start_time?: string | null;
  has_3d_preview: boolean;
  current_shots_fired?: number;
  current_score?: number;
  current_soldier_seq?: number;
  // Binding to range/rubeg
  range_id?: string;
  rubeg_number?: number;
  weapon_type?: WeaponCategory;
}

export interface ShootingSessionFlow {
  id: string;
  session_id: string;
  lane_id: string;
  lane_number: number;
  employee_id: string;
  employee_name: string;
  employee_rank: string;
  weapon_id: string;
  weapon_name: string;
  weapon_category: WeaponCategory;
  instructor_id: string;
  instructor_name: string;
  status: 'WAITING' | 'ASSIGNED' | 'WEAPON_SELECTED' | 'READY' | 'SHOOTING' | 'COMPLETED' | 'CANCELLED';
  shot_type: ShotType;
  scoring_mode: ScoringMode;
  expected_shots: number;
  rounds_fired: number;
  score: number;
  hit_count: number;
  miss_count: number;
  passed: boolean; // for HIT_MISS mode
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  camera_stream_url?: string | null;
  hit_positions?: Array<{ x: number; y: number; score: number; timestamp: string }>;
}

// --- Training Module ---
export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  duration_minutes: number;
  required_shots: number;
  target_distance_m: number;
  weapon_categories: WeaponCategory[];
  passing_score: number;
  assigned_count: number;
  completed_count: number;
  created_at: string;
}

export interface TrainingAssignment {
  id: string;
  plan_id: string;
  plan_name: string;
  employee_id: string;
  employee_name: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'OVERDUE';
  assigned_at: string;
  due_date: string;
  completed_at?: string | null;
  score?: number | null;
  instructor_id: string;
  instructor_name: string;
}

// --- TB Safety Test ---
export interface TBSafetyTest {
  id: string;
  title: string;
  description: string;
  questions: TBQuestion[];
  passing_score: number; // 100 = full pass
  duration_minutes: number;
}

export interface TBQuestion {
  id: string;
  question: string;
  question_uz?: string;
  options: string[];
  correct_index: number;
}

export interface TBSafetyTestResult {
  id: string;
  employee_id: string;
  employee_name: string;
  test_id: string;
  score: number;
  passed: boolean;
  answers: Array<{ question_id: string; selected_index: number; correct: boolean }>;
  taken_at: string;
}

// --- Analytics ---
export interface PerformanceTrend {
  date: string;
  avg_score: number;
  accuracy: number;
  session_count: number;
}

export interface AnalyticsSummary {
  total_sessions: number;
  total_shots: number;
  avg_accuracy: number;
  avg_score: number;
  top_scorer?: { name: string; score: number } | null;
  improvement_rate: number;
  total_employees_trained: number;
  total_rounds_fired: number;
  pass_rate: number;
}

// --- Notifications ---
export interface AppNotification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'TRAINING' | 'SYSTEM';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
}

// --- Range Schedule ---
export interface RangeSchedule {
  id: string;
  date: string;
  time_slot: string;
  lane_numbers: number[];
  department: string;
  instructor_name: string;
  employee_count: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  weapon_categories: WeaponCategory[];
  notes?: string | null;
}

// --- System Module Config ---
export interface SystemModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  routes: string[];
  required_roles: UserRole[];
  order: number;
}

// --- Camera Stream ---
export interface CameraStream {
  id: string;
  lane_number: number;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  resolution: string;
  fps: number;
  has_recording: boolean;
  has_3d_overlay: boolean;
  last_motion_detected?: string | null;
}

// ── Create DTOs (matching FastAPI backend) ──
export interface HREmployeeCreate {
  full_name: string;
  rank: string;
  position: string;
  department: string;
  region?: string;
  district?: string;
  battalion?: string;
  unit: string;
  personal_number: string;
  birth_date: string;
  phone: string;
  email?: string | null;
}

export interface WeaponCreate {
  name: string;
  category: WeaponCategory;
  serial_number: string;
  caliber: string;
  manufacturer: string;
  max_range_m: number;
  ammo_type: string;
}

export interface TrainingPlanCreate {
  name: string;
  description: string;
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  duration_minutes: number;
  required_shots: number;
  target_distance_m: number;
  weapon_categories: WeaponCategory[];
  passing_score: number;
}

// ── Protocol Types ──
export interface Protocol {
  id: string;
  session_id: string;
  employee_id: string;
  employee_name: string;
  employee_rank: string;
  weapon_name: string;
  instructor_id: string;
  instructor_name: string;
  date: string;
  location: string;
  shot_type: string;
  scoring_mode: ScoringMode;
  total_shots: number;
  hit_count: number;
  miss_count: number;
  total_score: number;
  max_score: number;
  accuracy: number;
  passed: boolean;
  qualification?: string | null;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'SIGNED' | 'REJECTED';
  qr_code?: string | null;
  signed_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface OperatorComment {
  id: string;
  session_id: string;
  soldier_seq: number;
  author: string;
  comment: string;
  created_at: string;
}

export interface OperatorCommentCreate {
  session_id: string;
  soldier_seq: number;
  author: string;
  comment: string;
}

export interface ReviewReason {
  id: string;
  session_id: string;
  soldier_seq: number;
  reviewer: string;
  reason: string;
  created_at: string;
}

export interface ReviewReasonCreate {
  session_id: string;
  soldier_seq: number;
  reviewer: string;
  reason: string;
}

// ── TechSpec Module: Range/Polygon Management ──
export interface ShootingRange {
  id: string;
  name: string;
  code: string;
  region: string;
  district?: string;
  ip_prefix: string;     // e.g., "88.1.92"
  range_type: 'OPEN' | 'CLOSED';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  total_rubegs: number;  // рубежи
  total_lanes: number;   // огневые точки per rubeg
  lanes_per_rubeg: number;
  cameras_online: number;
  cameras_total: number;
  created_at: string;
  updated_at?: string | null;
}

export interface RangeRubeg {
  id: string;
  range_id: string;
  range_name: string;
  rubeg_number: number;  // 1..4
  name: string;
  weapon_type: WeaponCategory;
  distance_m: number;
  lane_count: number;
  cameras: RangeCamera[];
}

export interface RangeCamera {
  id: string;
  rubeg_id: string;
  range_id: string;
  camera_ip: string;     // full IP, e.g., "88.1.92.10"
  camera_type: 'IP' | 'WEBCAM';
  label: string;         // e.g., "Rubeg-1 Lane-3"
  lane_number: number;
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  resolution?: string;
  last_check?: string | null;
  signal_ms?: number;    // latency
}

export interface ShootingRangeCreate {
  name: string;
  code: string;
  region: string;
  district?: string;
  ip_prefix: string;
  range_type?: 'OPEN' | 'CLOSED';
  total_rubegs: number;
  lanes_per_rubeg: number;
}

export interface RangeCameraCreate {
  range_id: string;
  rubeg_number: number;
  camera_ip: string;
  camera_type: 'IP' | 'WEBCAM';
  label: string;
  lane_number: number;
  distance_m: number;
  weapon_type?: WeaponCategory;
}

// ── Command Dashboard (Situational Center) ──
export interface RegionStats {
  region_code: string;
  region_name: string;
  region_name_uz: string;
  avg_score: number;
  pass_rate: number;
  total_employees: number;
  trained_employees: number;
  total_sessions: number;
  status: 'HIGH' | 'AVERAGE' | 'LOW'; // green / yellow / red
  districts: DistrictStats[];
}

export interface DistrictStats {
  district_code: string;
  district_name: string;
  district_name_uz: string;
  avg_score: number;
  pass_rate: number;
  total_employees: number;
  trained_employees: number;
  status: 'HIGH' | 'AVERAGE' | 'LOW';
  units: UnitStats[];
}

export interface UnitStats {
  unit_id: string;
  unit_name: string;
  avg_score: number;
  pass_rate: number;
  total_employees: number;
  trained_employees: number;
  status: 'HIGH' | 'AVERAGE' | 'LOW';
}

// ── FaceID Queue (Instructor Tablet) ──
export interface FaceIDQueueItem {
  id: string;
  employee_id: string;
  full_name: string;
  rank: string;
  department: string;
  face_id_confidence: number;
  detected_at: string;
  assigned_lane?: number | null;
  tb_test_passed: boolean;
  scoring_mode: ScoringMode;
}

// ── Heavy Equipment (Tank/BTR) Session ──
export interface HeavyEquipmentSession {
  id: string;
  vehicle_type: 'TANK' | 'BTR' | 'BMP' | 'OTHER';
  vehicle_name: string;
  crew_count: number;  // up to 5
  crew_members: Array<{
    employee_id: string;
    full_name: string;
    rank: string;
  }>;
  distance_m: number;  // up to 1000m
  total_shots: number;
  total_score: number;
  // Score distributed equally among crew
  per_crew_score: number;
  started_at: string;
  completed_at?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}
