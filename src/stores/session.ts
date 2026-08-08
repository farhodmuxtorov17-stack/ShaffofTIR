import { defineStore } from './pinia-shim';
import { ref } from 'vue';
import type {
  SessionResponse,
  SessionStatus,
  SoldierResponse,
  TargetProcessResponse,
  LaneCameraRequest,
  ProcessTurnCameraRequest,
  ProcessTurnUploadRequest,
} from '@/types';
import { sessionApi } from '@/api/session.api';
import { useAuditStore } from './audit';
import { useSessionsHistoryStore } from './sessionsHistory';
import { useMasterStore } from './master';

export const useSessionStore = defineStore('session', () => {
  const auditStore = useAuditStore();
  const historyStore = useSessionsHistoryStore();
  const masterStore = useMasterStore();

  // --- State ---
  const currentSession = ref<SessionResponse | null>(null);
  const sessionStatus = ref<SessionStatus>('IDLE');
  const soldiers = ref<SoldierResponse[]>([]);
  const currentSoldierSeq = ref<number | null>(null);
  const lastProcessResult = ref<TargetProcessResponse | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // --- Helper Validation ---
  function isValidAction(action: string): boolean {
    const status = sessionStatus.value;
    if (action === 'START_TEST') {
      return status === 'TEST_READY';
    }
    if (action === 'END_TEST') {
      return status === 'TEST_ACTIVE';
    }
    if (action === 'START_MAIN') {
      return status === 'TEST_COMPLETED';
    }
    if (action === 'END_MAIN') {
      return status === 'MAIN_ACTIVE';
    }
    return false;
  }

  // --- State Transitions & Actions ---
  function START_TEST() {
    if (!isValidAction('START_TEST')) {
      throw new Error(`Invalid action START_TEST in state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'TEST_ACTIVE';
    auditStore.logAudit('START_TEST', { message: 'Test shooting started' }, currentSession.value?.id || undefined, currentSoldierSeq.value || undefined);
  }

  function END_TEST() {
    if (!isValidAction('END_TEST')) {
      throw new Error(`Invalid action END_TEST in state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'TEST_PROCESSING';
    auditStore.logAudit('END_TEST', { message: 'Test shooting ended, processing scores' }, currentSession.value?.id || undefined, currentSoldierSeq.value || undefined);
  }

  function START_MAIN() {
    if (!isValidAction('START_MAIN')) {
      throw new Error(`Invalid action START_MAIN in state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'MAIN_ACTIVE';
    auditStore.logAudit('START_MAIN', { message: 'Main shooting started' }, currentSession.value?.id || undefined, currentSoldierSeq.value || undefined);
  }

  function END_MAIN() {
    if (!isValidAction('END_MAIN')) {
      throw new Error(`Invalid action END_MAIN in state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'MAIN_PROCESSING';
    auditStore.logAudit('END_MAIN', { message: 'Main shooting ended, processing scores' }, currentSession.value?.id || undefined, currentSoldierSeq.value || undefined);
  }

  // Helper transition methods beyond MAIN_COMPLETED
  function moveToReview() {
    if (sessionStatus.value !== 'MAIN_COMPLETED') {
      throw new Error(`Cannot transition to REVIEW from state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'REVIEW';
    auditStore.logAudit('MOVE_TO_REVIEW', { message: 'Session moved to review stage' }, currentSession.value?.id || undefined);
  }

  function approveSession() {
    if (sessionStatus.value !== 'REVIEW') {
      throw new Error(`Cannot transition to APPROVED from state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'APPROVED';
    auditStore.logAudit('APPROVE_SESSION', { message: 'Session approved' }, currentSession.value?.id || undefined);
  }

  function archiveSession() {
    if (sessionStatus.value !== 'APPROVED') {
      throw new Error(`Cannot transition to ARCHIVED from state: ${sessionStatus.value}`);
    }
    sessionStatus.value = 'ARCHIVED';
    auditStore.logAudit('ARCHIVE_SESSION', { message: 'Session archived' }, currentSession.value?.id || undefined);
  }

  // --- API Actions ---
  interface SessionMeta {
    scoringMode?: import("@/types/extended").ScoringMode;
    testRounds?: number;
    combatRounds?: number;
    employeeId?: string;
    employeeName?: string;
    weaponId?: string;
    laneNumber?: number;
    laneId?: string;
  }

  const sessionMeta = ref<SessionMeta>({});

  async function createSession(soldierCount: number, cameras?: LaneCameraRequest[], meta?: SessionMeta) {
    try {
      loading.value = true;
      error.value = null;

      if (sessionStatus.value !== 'IDLE') {
        throw new Error(`Cannot create session when status is: ${sessionStatus.value}`);
      }

      // Store meta for later reference
      if (meta) {
        sessionMeta.value = meta;
      }

      const res = await sessionApi.start({ soldier_count: soldierCount, cameras });
      currentSession.value = res.session;
      soldiers.value = res.session.soldiers || [];
      sessionStatus.value = 'SESSION_CREATED';

      auditStore.logAudit('CREATE_SESSION', {
        soldierCount,
        totalCameras: res.total_cameras,
        activeCameras: res.active_cameras,
        employee: meta?.employeeName,
        lane: meta?.laneNumber,
      }, res.session.id);
      return res;
    } catch (err: any) {
      error.value = err?.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function selectSoldier(seq: number) {
    currentSoldierSeq.value = seq;
    if (sessionStatus.value === 'SESSION_CREATED') {
      sessionStatus.value = 'TEST_READY';
      auditStore.logAudit('SELECT_SOLDIER_FIRST', { soldierSeq: seq }, currentSession.value?.id || undefined, seq);
    } else {
      auditStore.logAudit('SELECT_SOLDIER', { soldierSeq: seq }, currentSession.value?.id || undefined, seq);
    }
  }

  async function processUpload(data: ProcessTurnUploadRequest) {
    try {
      loading.value = true;
      error.value = null;

      if (data.shot_type === 'TEST') {
        // Valid states for test upload: TEST_ACTIVE (normal) or SESSION_CREATED/TEST_READY (direct upload)
        if (sessionStatus.value === 'TEST_ACTIVE') {
          END_TEST();
        } else if (sessionStatus.value === 'SESSION_CREATED' || sessionStatus.value === 'TEST_READY') {
          sessionStatus.value = 'TEST_PROCESSING';
        } else if (sessionStatus.value === 'TEST_COMPLETED') {
          // Already completed test - allow re-upload
          sessionStatus.value = 'TEST_PROCESSING';
        }
      } else if (data.shot_type === 'MAIN') {
        if (sessionStatus.value === 'MAIN_ACTIVE') {
          END_MAIN();
        } else if (sessionStatus.value === 'TEST_COMPLETED' || sessionStatus.value === 'MAIN_READY') {
          sessionStatus.value = 'MAIN_PROCESSING';
        } else if (sessionStatus.value === 'MAIN_COMPLETED') {
          // Re-upload for main
          sessionStatus.value = 'MAIN_PROCESSING';
        }
      }

      const res = await sessionApi.processTurnUpload(data);
      lastProcessResult.value = res;

      if (data.shot_type === 'TEST') {
        sessionStatus.value = 'TEST_COMPLETED';
        auditStore.logAudit('TEST_UPLOAD_SUCCESS', { shotsFound: res.total_new_shots_found }, data.session_id, data.soldier_seq);
      } else if (data.shot_type === 'MAIN') {
        sessionStatus.value = 'MAIN_COMPLETED';
        auditStore.logAudit('MAIN_UPLOAD_SUCCESS', { shotsFound: res.total_new_shots_found }, data.session_id, data.soldier_seq);
      }

      return res;
    } catch (err: any) {
      error.value = err?.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function processCamera(data: ProcessTurnCameraRequest) {
    try {
      loading.value = true;
      error.value = null;

      if (data.shot_type === 'TEST') {
        if (sessionStatus.value === 'TEST_ACTIVE') {
          END_TEST();
        } else if (sessionStatus.value === 'SESSION_CREATED' || sessionStatus.value === 'TEST_READY') {
          sessionStatus.value = 'TEST_PROCESSING';
        } else if (sessionStatus.value === 'TEST_COMPLETED') {
          sessionStatus.value = 'TEST_PROCESSING';
        }
      } else if (data.shot_type === 'MAIN') {
        if (sessionStatus.value === 'MAIN_ACTIVE') {
          END_MAIN();
        } else if (sessionStatus.value === 'TEST_COMPLETED' || sessionStatus.value === 'MAIN_READY') {
          sessionStatus.value = 'MAIN_PROCESSING';
        } else if (sessionStatus.value === 'MAIN_COMPLETED') {
          sessionStatus.value = 'MAIN_PROCESSING';
        }
      }

      const res = await sessionApi.processTurn(data);
      lastProcessResult.value = res;

      if (data.shot_type === 'TEST') {
        sessionStatus.value = 'TEST_COMPLETED';
        auditStore.logAudit('TEST_CAMERA_SUCCESS', { shotsFound: res.total_new_shots_found }, data.session_id, data.soldier_seq);
      } else if (data.shot_type === 'MAIN') {
        sessionStatus.value = 'MAIN_COMPLETED';
        auditStore.logAudit('MAIN_CAMERA_SUCCESS', { shotsFound: res.total_new_shots_found }, data.session_id, data.soldier_seq);
      }

      return res;
    } catch (err: any) {
      error.value = err?.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSummary(sessionId: string) {
    try {
      loading.value = true;
      error.value = null;
      const res = await sessionApi.getSummary(sessionId);
      currentSession.value = res;
      if (res.soldiers) {
        soldiers.value = res.soldiers;
      }
      return res;
    } catch (err: any) {
      error.value = err?.message || String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ── Finalize session: push to history, update employee stats, notify ──
  function finalizeSession() {
    if (!currentSession.value || sessionStatus.value !== 'MAIN_COMPLETED') return;

    const meta = sessionMeta.value;
    const allShots = soldiers.value.flatMap(s => s.shots || []);
    const testShots = allShots.filter(s => s.shot_type === 'TEST').map(s => ({ x: s.x || 50, y: s.y || 50, score: s.score, shot_type: 'TEST' }));
    const mainShots = allShots.filter(s => s.shot_type === 'MAIN').map(s => ({ x: s.x || 50, y: s.y || 50, score: s.score, shot_type: 'MAIN' }));
    const hitCount = allShots.filter(s => s.score > 0).length;
    const missCount = allShots.length - hitCount;
    const totalScore = allShots.reduce((sum, s) => sum + s.score, 0);
    const accuracy = allShots.length > 0 ? Math.round((hitCount / allShots.length) * 100) : 0;

    // Find employee and weapon from master store
    const employee = meta.employeeId ? masterStore.employees.find(e => e.id === meta.employeeId) : null;
    const weapon = meta.weaponId ? masterStore.weapons.find(w => w.id === meta.weaponId) : null;

    const record = historyStore.addSession({
      employee_id: meta.employeeId || 'unknown',
      employee_name: meta.employeeName || employee?.full_name || 'Unknown',
      employee_rank: employee?.rank || '',
      weapon_id: meta.weaponId || '',
      weapon_name: weapon?.name || '',
      lane_number: meta.laneNumber || 0,
      test_shots: testShots,
      main_shots: mainShots,
      total_shots: allShots.length,
      hit_count: hitCount,
      miss_count: missCount,
      total_score: totalScore,
      accuracy: accuracy,
      instructor_name: 'Operator',
      instructor_id: 'u002',
      session_type: 'TRAINING' as const,
      difficulty: 'BASIC' as const,
    });

    // Update employee stats in master store
    if (employee) {
      employee.total_sessions += 1;
      employee.total_score += totalScore;
      employee.avg_accuracy = Math.round((employee.avg_accuracy * (employee.total_sessions - 1) + accuracy) / employee.total_sessions);
      employee.last_shooting_date = new Date().toISOString().split('T')[0];

      // Update qualification level based on accuracy
      if (accuracy >= 90 && (employee.qualification_level || '') !== 'EXPERT') {
        employee.qualification_level = 'EXPERT';
        employee.shooting_qualified = true;
      } else if (accuracy >= 75 && !['EXPERT', 'ADVANCED'].includes(employee.qualification_level || '')) {
        employee.qualification_level = 'ADVANCED';
        employee.shooting_qualified = true;
      } else if (accuracy >= 60 && !['EXPERT', 'ADVANCED', 'INTERMEDIATE'].includes(employee.qualification_level || '')) {
        employee.qualification_level = 'INTERMEDIATE';
        employee.shooting_qualified = true;
      }
    }

    // Update weapon shots fired
    if (weapon) {
      weapon.total_shots_fired += allShots.length;
    }

    // Update lane status
    if (meta.laneId) {
      const lane = masterStore.lanes.find(l => l.id === meta.laneId);
      if (lane) {
        lane.status = 'AVAILABLE';
        lane.current_employee_name = null;
      }
    }

    auditStore.logAudit('SESSION_FINALIZED', {
      sessionId: currentSession.value.id,
      employee: meta.employeeName,
      score: totalScore,
      accuracy: accuracy,
    }, currentSession.value.id);

    return record;
  }

  function resetSession() {
    currentSession.value = null;
    sessionStatus.value = 'IDLE';
    soldiers.value = [];
    currentSoldierSeq.value = null;
    lastProcessResult.value = null;
    sessionMeta.value = {};
    loading.value = false;
    error.value = null;
    auditStore.logAudit('RESET_SESSION', { message: 'Session reset to IDLE' });
  }

  return {
    currentSession,
    sessionStatus,
    soldiers,
    currentSoldierSeq,
    lastProcessResult,
    sessionMeta,
    loading,
    error,
    createSession,
    selectSoldier,
    processUpload,
    processCamera,
    fetchSummary,
    resetSession,
    isValidAction,
    START_TEST,
    END_TEST,
    START_MAIN,
    END_MAIN,
    moveToReview,
    approveSession,
    archiveSession,
  };
});
