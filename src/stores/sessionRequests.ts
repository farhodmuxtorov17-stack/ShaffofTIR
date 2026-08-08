import { defineStore } from './pinia-shim';
import { ref, computed } from 'vue';

// ============================================================
// Session Request Store - Employee summon + training queue
// ============================================================

export interface SessionRequest {
  id: string;
  type: 'SUMMON' | 'QUEUE' | 'TRAINING_REQUEST';
  employee_id: string;
  employee_name: string;
  employee_rank: string;
  department: string;
  // For SUMMON: instructor/manager summons employee to a session
  // For QUEUE: employee requests to be in queue for shooting
  // For TRAINING_REQUEST: employee requests to be assigned to a training
  requested_by: string;
  requested_by_name: string;
  requested_by_role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  message?: string;
  preferred_date?: string;
  preferred_lane?: number;
  training_plan_id?: string;
  training_plan_name?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_note?: string;
}

const STORAGE_KEY = 'shaffoftir_session_requests';

function generateInitialRequests(): SessionRequest[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const minsAgo = (m: number) => iso(new Date(now.getTime() - m * 60 * 1000));

  return [
    {
      id: 'sr001',
      type: 'SUMMON',
      employee_id: 'e004',
      employee_name: 'Хасанов О.Р.',
      employee_rank: 'Рядовой',
      department: '2-я рота',
      requested_by: 'u002',
      requested_by_name: 'Каримов Б.Р.',
      requested_by_role: 'INSTRUCTOR',
      status: 'PENDING',
      message: 'Базовая стрельба, дорожка 5, 100м. Прибыть к 14:00.',
      preferred_date: '2026-07-23',
      preferred_lane: 5,
      created_at: minsAgo(45),
    },
    {
      id: 'sr002',
      type: 'QUEUE',
      employee_id: 'e007',
      employee_name: 'Эргашев Б.Т.',
      employee_rank: 'Рядовой',
      department: '3-я рота',
      requested_by: 'u003',
      requested_by_name: 'Эргашев Б.Т.',
      requested_by_role: 'EMPLOYEE',
      status: 'PENDING',
      message: 'Прошу записать в очередь на стрельбу. Удобно в четверг после 10:00.',
      preferred_date: '2026-07-24',
      created_at: minsAgo(120),
    },
    {
      id: 'sr003',
      type: 'TRAINING_REQUEST',
      employee_id: 'e002',
      employee_name: 'Рахимов Ж.Т.',
      employee_rank: 'Лейтенант',
      department: '1-я рота',
      requested_by: 'u003',
      requested_by_name: 'Рахимов Ж.Т.',
      requested_by_role: 'EMPLOYEE',
      status: 'PENDING',
      message: 'Прошу назначить на снайперскую подготовку.',
      training_plan_id: 'tp003',
      training_plan_name: 'Снайперская подготовка',
      created_at: minsAgo(180),
    },
    {
      id: 'sr004',
      type: 'SUMMON',
      employee_id: 'e003',
      employee_name: 'Юлдашев Д.А.',
      employee_rank: 'Сержант',
      department: '2-я рота',
      requested_by: 'u001',
      requested_by_name: 'Тешабаев Ж.А.',
      requested_by_role: 'MANAGER',
      status: 'COMPLETED',
      message: 'Плановая проверка. Скоростная стрельба, 15 выстрелов.',
      preferred_date: '2026-07-21',
      preferred_lane: 2,
      created_at: minsAgo(2880),
      resolved_at: minsAgo(1440),
      resolved_by: 'u002',
      resolution_note: 'Сессия завершена. 82 балла, 14/15 попаданий.',
    },
    {
      id: 'sr005',
      type: 'QUEUE',
      employee_id: 'e004',
      employee_name: 'Хасанов О.Р.',
      employee_rank: 'Рядовой',
      department: '2-я рота',
      requested_by: 'u003',
      requested_by_name: 'Хасанов О.Р.',
      requested_by_role: 'EMPLOYEE',
      status: 'APPROVED',
      message: 'Прошу записать на базовую стрельбу.',
      preferred_date: '2026-07-22',
      preferred_lane: 5,
      created_at: minsAgo(720),
      resolved_at: minsAgo(300),
      resolved_by: 'u002',
      resolution_note: 'Одобрено. Дорожка 5, 14:00.',
    },
    {
      id: 'sr006',
      type: 'TRAINING_REQUEST',
      employee_id: 'e007',
      employee_name: 'Эргашев Б.Т.',
      employee_rank: 'Рядовой',
      department: '3-я рота',
      requested_by: 'u003',
      requested_by_name: 'Эргашев Б.Т.',
      requested_by_role: 'EMPLOYEE',
      status: 'REJECTED',
      message: 'Прошу снайперскую подготовку.',
      training_plan_id: 'tp003',
      training_plan_name: 'Снайперская подготовка',
      created_at: minsAgo(4320),
      resolved_at: minsAgo(4000),
      resolved_by: 'u001',
      resolution_note: 'Отклонено. Требуется квалификация ADVANCED. Рекомендую сначала пройти базовый курс.',
    },
  ];
}

function loadRequests(): SessionRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch { /* ignore */ }
  const fresh = generateInitialRequests();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch { /* ignore */ }
  return fresh;
}

export const useSessionRequestStore = defineStore('sessionRequests', () => {
  const requests = ref<SessionRequest[]>(loadRequests());

  const pendingRequests = computed(() => requests.value.filter(r => r.status === 'PENDING'));
  const pendingCount = computed(() => pendingRequests.value.length);

  const summonsPending = computed(() => requests.value.filter(r => r.type === 'SUMMON' && r.status === 'PENDING'));
  const queuePending = computed(() => requests.value.filter(r => r.type === 'QUEUE' && r.status === 'PENDING'));
  const trainingPending = computed(() => requests.value.filter(r => r.type === 'TRAINING_REQUEST' && r.status === 'PENDING'));

  const myRequests = computed(() => {
    // Would filter by current user - for demo, return all employee-originated
    return requests.value.filter(r => r.requested_by_role === 'EMPLOYEE');
  });

  function addRequest(data: Omit<SessionRequest, 'id' | 'created_at' | 'status'>): SessionRequest {
    const newReq: SessionRequest = {
      ...data,
      id: `sr${String(requests.value.length + 1).padStart(3, '0')}_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'PENDING',
    };
    requests.value.unshift(newReq);
    saveToStorage();
    return newReq;
  }

  function resolveRequest(id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED', resolvedBy: string, note?: string) {
    const req = requests.value.find(r => r.id === id);
    if (req) {
      req.status = status;
      req.resolved_at = new Date().toISOString();
      req.resolved_by = resolvedBy;
      req.resolution_note = note;
      saveToStorage();
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.value));
    } catch { /* ignore */ }
  }

  return {
    requests,
    pendingRequests,
    pendingCount,
    summonsPending,
    queuePending,
    trainingPending,
    myRequests,
    addRequest,
    resolveRequest,
  };
});
