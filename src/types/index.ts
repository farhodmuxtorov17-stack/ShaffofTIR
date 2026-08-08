// ============================================================
// ShaffofTIR API Types - TypeScript domain models
// ============================================================

// --- Health ---
export interface HealthResponse {
  status: string;
  message: string;
}

// --- Camera ---
export interface LaneCameraRequest {
  camera_ip: string;
  username?: string;
  password?: string;
  label?: string | null;
}

export interface CameraHealthRequest {
  cameras: LaneCameraRequest[];
}

export interface CameraStatusResponse {
  camera_index: number;
  camera_ip: string;
  username?: string | null;
  label?: string | null;
  status: string;
  detail?: string | null;
  camera_source?: string | null;
  width?: number | null;
  height?: number | null;
  capture_image_url?: string | null;
  capture_file_path?: string | null;
}

export interface CameraHealthResponse {
  total_cameras: number;
  active_cameras: number;
  camera_results?: CameraStatusResponse[];
}

// --- Session ---
export interface StartSessionRequest {
  soldier_count?: number;
  cameras?: LaneCameraRequest[];
}

export interface StartSessionResponse {
  session: SessionResponse;
  total_cameras: number;
  active_cameras: number;
  camera_results?: CameraStatusResponse[];
}

export interface SessionResponse {
  id: string;
  created_at: string;
  status: string;
  soldiers?: SoldierResponse[];
}

// --- Soldier ---
export interface SoldierResponse {
  sequence_number: number;
  status: string;
  id: number;
  session_id: string;
  shots?: ShotResponse[];
  test_image_url?: string | null;
  main_image_url?: string | null;
}

// --- Shot ---
export interface ShotResponse {
  shot_type: string;
  x: number;
  y: number;
  score: number;
  id: number;
  soldier_id: number;
}

// --- Process Turn ---
export interface ProcessTurnCameraRequest {
  session_id: string;
  soldier_seq: number;
  shot_type: string;
  expected_shots: number;
  cameras?: LaneCameraRequest[] | null;
}

export interface TargetProcessResponse {
  session_id: string;
  soldier_sequence: number;
  shot_type: string;
  total_new_shots_found: number;
  hit_count?: number;
  miss_count?: number;
  new_shots: ShotResponse[];
  result_image_url?: string | null;
  warning?: string | null;
  camera_results?: CameraStatusResponse[];
  used_camera_index?: number | null;
  used_camera_source?: string | null;
  capture_image_url?: string | null;
}

// --- Upload Process Turn ---
export interface ProcessTurnUploadRequest {
  session_id: string;
  soldier_seq: number;
  shot_type: string;
  expected_shots: number;
  file: File;
  baseline_file?: File | null;
}

// --- Dataprizma ---
export interface DataprizmaCamera {
  camera_ip: string;
  username: string;
  password: string;
}

export interface DataprizmaShootingSession {
  external_id: string;
  shooting_lane_cameras?: DataprizmaCamera[];
}

export interface DataprizmaItem {
  external_id: string;
  bullet_count: number;
  shooting_session: DataprizmaShootingSession;
}

export interface DataprizmaIncomingRequest {
  action_name: string;
  data?: DataprizmaItem[];
}

export interface DataprizmaResponsePayload {
  local_session_id?: string | null;
  local_soldier_sequence?: number | null;
  shot_type?: string | null;
  event_status?: string | null;
  bullet_count?: number | null;
  total_score?: number;
  total_shots_recorded?: number;
  hit_count?: number;
  test_hit_count?: number;
  main_hit_count?: number;
  miss_count?: number;
  test_score?: number;
  main_score?: number;
  test_image_url?: string | null;
  main_image_url?: string | null;
  result_image_url?: string | null;
  capture_image_url?: string | null;
  result_image_base64?: string | null;
  used_camera_index?: number | null;
  used_camera_source?: string | null;
  lane_camera_index?: number | null;
  lane_camera_ip?: string | null;
  camera_count_in_request?: number | null;
  processed_at?: string | null;
  camera_results?: CameraStatusResponse[];
  shots?: ShotResponse[];
  error_message?: string | null;
}

export interface DataprizmaCameraCheckSession {
  session_external_id: string;
  total_cameras?: number;
  active_cameras?: number;
  inactive_cameras?: number;
  camera_results?: CameraStatusResponse[];
  failed_cameras?: DataprizmaFailedCamera[];
  assigned_lanes?: Record<string, unknown>[];
}

export interface DataprizmaFailedCamera {
  camera_ip: string;
  reason: string;
}

export interface DataprizmaAckResponse {
  is_success: boolean;
  message: string;
  data?: DataprizmaCameraCheckSession[] | null;
}

export interface DataprizmaResultResponse {
  is_success: boolean;
  message: string;
  data?: DataprizmaOutgoingItem[];
}

export interface DataprizmaOutgoingItem {
  external_id: string;
  shooting_session: Record<string, string>;
  response_payload: DataprizmaResponsePayload;
}

// --- Error ---
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// --- UI Types ---
export type ShotType = 'TEST' | 'MAIN';

export type SessionStatus =
  | 'IDLE'
  | 'SESSION_CREATED'
  | 'TEST_READY'
  | 'TEST_ACTIVE'
  | 'TEST_PROCESSING'
  | 'TEST_COMPLETED'
  | 'MAIN_READY'
  | 'MAIN_ACTIVE'
  | 'MAIN_PROCESSING'
  | 'MAIN_COMPLETED'
  | 'REVIEW'
  | 'APPROVED'
  | 'ARCHIVED';

export type DataprizmaAction = 'START_TEST' | 'END_TEST' | 'START_MAIN' | 'END_MAIN';

export interface OverlapGroup {
  shots: ShotResponse[];
  count: number;
  badge: '×2' | '×3' | '×4+';
  centerX: number;
  centerY: number;
}

export interface BaselineEntry {
  soldierSeq: number;
  imageUrl: string | null;
  timestamp: string;
  shotType: ShotType;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
