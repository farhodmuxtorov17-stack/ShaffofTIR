import { defineStore } from './pinia-shim';
import { ref, computed } from 'vue';
import type { TargetProcessResponse } from '@/types';

// ============================================================
// Sessions History Store - Interconnected with master store
// 50+ sessions linked to 24 employees, 12 weapons, 6 lanes
// Single source of truth for Results, Analytics, HR stats, Protocols
// ============================================================

export interface SessionRecord {
  id: string;
  created_at: string;
  completed_at: string;
  employee_id: string;
  employee_name: string;
  employee_rank: string;
  weapon_id: string;
  weapon_name: string;
  lane_number: number;
  status: 'COMPLETED' | 'REVIEWED' | 'PENDING' | 'ARCHIVED';
  // Shot data
  test_shots: Array<{ x: number; y: number; score: number; shot_type: string }>;
  main_shots: Array<{ x: number; y: number; score: number; shot_type: string }>;
  total_shots: number;
  hit_count: number;
  miss_count: number;
  total_score: number;
  accuracy: number;
  // Meta
  instructor_name: string;
  instructor_id: string;
  session_type: 'TRAINING' | 'QUALIFICATION' | 'COMBAT';
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  notes?: string;
  protocol_id?: string;
  protocol_status?: 'DRAFT' | 'SIGNED' | 'APPROVED' | null;
}

export interface ProtocolRecord {
  id: string;
  session_id: string;
  protocol_number: string;
  created_at: string;
  signed_at: string | null;
  employee_id: string;
  employee_name: string;
  employee_rank: string;
  instructor_id: string;
  instructor_name: string;
  weapon_name: string;
  lane_number: number;
  total_score: number;
  hit_count: number;
  miss_count: number;
  total_shots: number;
  accuracy: number;
  qualification: 'PASSED' | 'FAILED' | 'EXCELLENT';
  qr_code: string;
  status: 'DRAFT' | 'SIGNED' | 'APPROVED' | 'ARCHIVED';
  notes?: string;
}

const STORAGE_KEY = 'shaffoftir_session_history_v2';

// --- 24 Employees (same as master store) 
const EMPLOYEES = [
  { id: 'e001', name: 'Алиев Б.У.', rank: 'Капитан', qual: 'ADVANCED' as const, dept: '1-я рота' },
  { id: 'e002', name: 'Рахимов Ж.Т.', rank: 'Лейтенант', qual: 'INTERMEDIATE' as const, dept: '1-я рота' },
  { id: 'e003', name: 'Юлдашев Д.А.', rank: 'Сержант', qual: 'EXPERT' as const, dept: '1-я рота' },
  { id: 'e004', name: 'Хасанов О.Р.', rank: 'Рядовый', qual: 'BEGINNER' as const, dept: '1-я рота' },
  { id: 'e005', name: 'Махмудов С.Б.', rank: 'Ст. сержант', qual: 'EXPERT' as const, dept: '1-я рота' },
  { id: 'e006', name: 'Каримов А.У.', rank: 'Ефрейтор', qual: 'EXPERT' as const, dept: '2-я рота' },
  { id: 'e007', name: 'Эргашев Б.Т.', rank: 'Рядовой', qual: 'BEGINNER' as const, dept: '2-я рота' },
  { id: 'e008', name: 'Тошматов Ф.Ш.', rank: 'Старшина', qual: 'EXPERT' as const, dept: 'Огневая подготовка' },
  { id: 'e009', name: 'Норматов Ж.А.', rank: 'Сержант', qual: 'INTERMEDIATE' as const, dept: '2-я рота' },
  { id: 'e010', name: 'Умаров Ш.Б.', rank: 'Рядовый', qual: 'BEGINNER' as const, dept: '2-я рота' },
  { id: 'e011', name: 'Кадыров У.Т.', rank: 'Ст. лейтенант', qual: 'ADVANCED' as const, dept: '3-я рота' },
  { id: 'e012', name: 'Собиров Б.И.', rank: 'Сержант', qual: 'INTERMEDIATE' as const, dept: '3-я рота' },
  { id: 'e013', name: 'Рахмонов И.Ж.', rank: 'Рядовый', qual: 'BEGINNER' as const, dept: '3-я рота' },
  { id: 'e014', name: 'Фазилов Д.Р.', rank: 'Ефрейтор', qual: 'INTERMEDIATE' as const, dept: '3-я рота' },
  { id: 'e015', name: 'Назаров Б.Х.', rank: 'Ст. сержант', qual: 'EXPERT' as const, dept: 'Разведвзвод' },
  { id: 'e016', name: 'Холиков А.Х.', rank: 'Сержант', qual: 'ADVANCED' as const, dept: 'Разведвзвод' },
  { id: 'e017', name: 'Турсунов А.К.', rank: 'Капитан', qual: 'EXPERT' as const, dept: 'Огневая подготовка' },
  { id: 'e018', name: 'Камилов С.Р.', rank: 'Лейтенант', qual: 'ADVANCED' as const, dept: 'Огневая подготовка' },
  { id: 'e019', name: 'Тешабаев Ж.А.', rank: 'Полковник', qual: 'ADVANCED' as const, dept: 'Штаб' },
  { id: 'e020', name: 'Исомиддинов Б.Ш.', rank: 'Майор', qual: 'ADVANCED' as const, dept: 'Штаб' },
  { id: 'e021', name: 'Шерматов У.Б.', rank: 'Рядовой', qual: 'BEGINNER' as const, dept: '1-я рота' },
  { id: 'e022', name: 'Юсупов К.А.', rank: 'Ефрейтор', qual: 'INTERMEDIATE' as const, dept: '1-я рота' },
  { id: 'e023', name: 'Бобонов Р.Х.', rank: 'Рядовой', qual: 'BEGINNER' as const, dept: '2-я рота' },
  { id: 'e024', name: 'Хайдаров Ж.Б.', rank: 'Сержант', qual: 'ADVANCED' as const, dept: '2-я рота' },
];

const WEAPONS = [
  { id: 'w001', name: 'AK-74' },
  { id: 'w002', name: 'AK-74' },
  { id: 'w003', name: 'Макаров ПМ' },
  { id: 'w004', name: 'СВД (Драгунов)' },
  { id: 'w006', name: 'ПК (Пулемёт)' },
  { id: 'w007', name: 'Glock 17' },
  { id: 'w008', name: 'АК-12' },
  { id: 'w009', name: 'AK-74' },
  { id: 'w010', name: 'АК-12' },
  { id: 'w011', name: 'Макаров ПМ' },
  { id: 'w012', name: 'СВД (Драгунов)' },
];

const INSTRUCTORS = [
  { id: 'u002', name: 'Каримов Б.Р.' },
  { id: 'u017', name: 'Турсунов А.К.' },
  { id: 'u008', name: 'Тошматов Ф.Ш.' },
  { id: 'u018', name: 'Камилов С.Р.' },
];

// --- Deterministic PRNG for reproducible data 
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

// --- Generate 55 realistic interconnected sessions 
function generateHistoricalSessions(): SessionRecord[] {
  const sessions: SessionRecord[] = [];

  for (let i = 0; i < 55; i++) {
    const seed = i + 1;
    const emp = EMPLOYEES[seed % EMPLOYEES.length];
    const weapon = WEAPONS[seed % WEAPONS.length];
    const laneNum = (seed % 6) + 1;
    const instructor = INSTRUCTORS[seed % INSTRUCTORS.length];

    // Date: spread over 6 months, more recent sessions more likely
    const daysAgo = Math.floor(seededRandom(seed * 7) * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(9 + Math.floor(seededRandom(seed * 11) * 8), Math.floor(seededRandom(seed * 13) * 60));

    // Shot generation based on qualification
    const baseAccuracy = emp.qual === 'EXPERT' ? 0.88 : emp.qual === 'ADVANCED' ? 0.75 : emp.qual === 'INTERMEDIATE' ? 0.62 : 0.42;
    const variance = 0.15;
    const sessionAccuracy = Math.min(1, Math.max(0, baseAccuracy + (seededRandom(seed * 17) - 0.5) * variance));

    const testShotCount = 3;
    const mainShotCount = 7 + Math.floor(seededRandom(seed * 19) * 4);
    const totalShots = testShotCount + mainShotCount;

    const shots: Array<{ x: number; y: number; score: number; shot_type: string }> = [];
    let hitCount = 0;
    let totalScore = 0;

    for (let s = 0; s < totalShots; s++) {
      const shotSeed = seed * 100 + s;
      const isHit = seededRandom(shotSeed) < sessionAccuracy;
      if (isHit) {
        hitCount++;
        const spread = emp.qual === 'EXPERT' ? 8 : emp.qual === 'ADVANCED' ? 15 : emp.qual === 'INTERMEDIATE' ? 22 : 30;
        const x = 50 + (seededRandom(shotSeed * 2) - 0.5) * spread * 2;
        const y = 50 + (seededRandom(shotSeed * 3) - 0.5) * spread * 2;
        const dist = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
        const score = dist < 5 ? 10 : dist < 10 ? 9 : dist < 15 ? 8 : dist < 20 ? 7 : dist < 25 ? 6 : dist < 30 ? 5 : dist < 35 ? 4 : dist < 40 ? 3 : 2;
        shots.push({ x: Math.round(x), y: Math.round(y), score, shot_type: s < testShotCount ? 'TEST' : 'MAIN' });
        totalScore += score;
      } else {
        const angle = seededRandom(shotSeed * 4) * Math.PI * 2;
        const dist = 45 + seededRandom(shotSeed * 5) * 10;
        shots.push({ x: Math.round(50 + Math.cos(angle) * dist), y: Math.round(50 + Math.sin(angle) * dist), score: 0, shot_type: s < testShotCount ? 'TEST' : 'MAIN' });
      }
    }

    const testShots = shots.filter(s => s.shot_type === 'TEST');
    const mainShots = shots.filter(s => s.shot_type === 'MAIN');
    const accuracy = Math.round((hitCount / totalShots) * 100);

    // Session type and difficulty
    const sessionType = seed % 5 === 0 ? 'QUALIFICATION' : seed % 7 === 0 ? 'COMBAT' : 'TRAINING';
    const difficulty = emp.qual === 'EXPERT' ? (seed % 3 === 0 ? 'ELITE' : 'ADVANCED') : emp.qual === 'ADVANCED' ? 'INTERMEDIATE' : 'BASIC';

    // Status: more recent = more likely PENDING, older = REVIEWED or COMPLETED
    let status: SessionRecord['status'];
    if (daysAgo < 3) {
      status = seed % 3 === 0 ? 'PENDING' : 'COMPLETED';
    } else if (daysAgo < 30) {
      status = seed % 4 === 0 ? 'REVIEWED' : 'COMPLETED';
    } else {
      status = 'COMPLETED';
    }

    // Protocol: completed/reviewed sessions have protocols
    let protocolId: string | undefined;
    let protocolStatus: SessionRecord['protocol_status'] = null;
    if (status === 'COMPLETED' || status === 'REVIEWED') {
      protocolId = `PR-2026-${String(i + 1).padStart(3, '0')}`;
      protocolStatus = status === 'REVIEWED' ? 'SIGNED' : seed % 3 === 0 ? 'APPROVED' : 'SIGNED';
    }

    sessions.push({
      id: `s-2026-${String(i + 1).padStart(3, '0')}`,
      created_at: date.toISOString(),
      completed_at: new Date(date.getTime() + 30 * 60000).toISOString(),
      employee_id: emp.id,
      employee_name: emp.name,
      employee_rank: emp.rank,
      weapon_id: weapon.id,
      weapon_name: weapon.name,
      lane_number: laneNum,
      status,
      test_shots: testShots,
      main_shots: mainShots,
      total_shots: totalShots,
      hit_count: hitCount,
      miss_count: totalShots - hitCount,
      total_score: totalScore,
      accuracy,
      instructor_name: instructor.name,
      instructor_id: instructor.id,
      session_type: sessionType as SessionRecord['session_type'],
      difficulty: difficulty as SessionRecord['difficulty'],
      notes: accuracy > 85 ? 'Отличный результат' : accuracy < 45 ? 'Требуется дополнительная подготовка' : undefined,
      protocol_id: protocolId,
      protocol_status: protocolStatus,
    });
  }

  // Sort by date descending
  sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return sessions;
}

// --- Generate protocols from sessions 
function generateProtocols(sessions: SessionRecord[]): ProtocolRecord[] {
  return sessions
    .filter(s => s.protocol_id)
    .map((s, i) => {
      const qualification = s.accuracy >= 85 ? 'EXCELLENT' : s.accuracy >= 60 ? 'PASSED' : 'FAILED';
      const signedAt = s.protocol_status === 'DRAFT' ? null : new Date(new Date(s.completed_at).getTime() + 3600000).toISOString();
      return {
        id: s.protocol_id!,
        session_id: s.id,
        protocol_number: `№${String(i + 1).padStart(4, '0')}/2026`,
        created_at: s.completed_at,
        signed_at: signedAt,
        employee_id: s.employee_id,
        employee_name: s.employee_name,
        employee_rank: s.employee_rank,
        instructor_id: s.instructor_id,
        instructor_name: s.instructor_name,
        weapon_name: s.weapon_name,
        lane_number: s.lane_number,
        total_score: s.total_score,
        hit_count: s.hit_count,
        miss_count: s.miss_count,
        total_shots: s.total_shots,
        accuracy: s.accuracy,
        qualification: qualification as ProtocolRecord['qualification'],
        qr_code: `SHAFTIR|${s.protocol_id}|${s.employee_id}|${s.total_score}|${s.accuracy}`,
        status: (s.protocol_status || 'DRAFT') as ProtocolRecord['status'],
        notes: s.notes,
      };
    });
}

export const useSessionsHistoryStore = defineStore('sessionsHistory', () => {
  // Try loading from localStorage, otherwise generate
  const stored = (() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch { /* ignore */ }
    return null;
  })();

  const sessions = ref<SessionRecord[]>(stored?.sessions || generateHistoricalSessions());
  const protocols = ref<ProtocolRecord[]>(stored?.protocols || generateProtocols(sessions.value));

  // --- Computed stats 
  const totalSessions = computed(() => sessions.value.length);
  const completedSessions = computed(() => sessions.value.filter(s => s.status === 'COMPLETED' || s.status === 'REVIEWED').length);
  const pendingSessions = computed(() => sessions.value.filter(s => s.status === 'PENDING').length);
  const totalShots = computed(() => sessions.value.reduce((sum, s) => sum + s.total_shots, 0));
  const totalHits = computed(() => sessions.value.reduce((sum, s) => sum + s.hit_count, 0));
  const avgAccuracy = computed(() => totalSessions.value > 0 ? Math.round(totalHits.value / totalShots.value * 100) : 0);
  const avgScore = computed(() => {
    const totalScore = sessions.value.reduce((sum, s) => sum + s.total_score, 0);
    return totalSessions.value > 0 ? Math.round(totalScore / totalSessions.value) : 0;
  });
  const passRate = computed(() => {
    const passed = sessions.value.filter(s => s.accuracy >= 60).length;
    return totalSessions.value > 0 ? Math.round((passed / totalSessions.value) * 100) : 0;
  });

  // --- Monthly trends 
  const monthlyTrends = computed(() => {
    const months: Record<string, { count: number; totalAcc: number; totalScore: number }> = {};
    sessions.value.forEach(s => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { count: 0, totalAcc: 0, totalScore: 0 };
      months[key].count++;
      months[key].totalAcc += s.accuracy;
      months[key].totalScore += s.total_score;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({
        label: key,
        avg_accuracy: Math.round(v.totalAcc / v.count),
        avg_score: Math.round(v.totalScore / v.count),
        session_count: v.count,
      }));
  });

  // --- Sessions by employee 
  const sessionsByEmployee = computed(() => {
    const map: Record<string, SessionRecord[]> = {};
    sessions.value.forEach(s => {
      if (!map[s.employee_id]) map[s.employee_id] = [];
      map[s.employee_id].push(s);
    });
    return map;
  });

  // --- Employee stats 
  const employeeStats = computed(() => {
    return EMPLOYEES.map(emp => {
      const empSessions = sessionsByEmployee.value[emp.id] || [];
      const totalScore = empSessions.reduce((sum, s) => sum + s.total_score, 0);
      const totalShots = empSessions.reduce((sum, s) => sum + s.total_shots, 0);
      const totalHits = empSessions.reduce((sum, s) => sum + s.hit_count, 0);
      return {
        employee_id: emp.id,
        employee_name: emp.name,
        rank: emp.rank,
        department: emp.dept,
        session_count: empSessions.length,
        total_score: totalScore,
        avg_accuracy: totalShots > 0 ? Math.round((totalHits / totalShots) * 100) : 0,
        best_score: empSessions.length > 0 ? Math.max(...empSessions.map(s => s.total_score)) : 0,
      };
    }).sort((a, b) => b.total_score - a.total_score);
  });

  // --- Top performers 
  const topPerformers = computed(() => employeeStats.value.slice(0, 5));

  // --- Weekly sessions 
  const weeklySessions = computed(() => {
    const days: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const now = new Date();
    sessions.value.forEach(s => {
      const d = new Date(s.created_at);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diffDays < 7) {
        days[d.getDay()]++;
      }
    });
    const dayLabelsRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayLabelsUz = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    return dayLabelsRu.map((label, i) => ({ label, labelUz: dayLabelsUz[i], value: days[i] }));
  });

  // --- Weapon usage distribution 
  const weaponDistribution = computed(() => {
    const dist: Record<string, number> = {};
    sessions.value.forEach(s => {
      dist[s.weapon_name] = (dist[s.weapon_name] || 0) + 1;
    });
    return Object.entries(dist).map(([label, value]) => ({ label, value }));
  });

  // --- Protocol methods 
  const totalProtocols = computed(() => protocols.value.length);
  const signedProtocols = computed(() => protocols.value.filter(p => p.status === 'SIGNED' || p.status === 'APPROVED').length);
  const draftProtocols = computed(() => protocols.value.filter(p => p.status === 'DRAFT').length);

  function getProtocol(protocolId: string): ProtocolRecord | undefined {
    return protocols.value.find(p => p.id === protocolId);
  }

  function getProtocolBySessionId(sessionId: string): ProtocolRecord | undefined {
    return protocols.value.find(p => p.session_id === sessionId);
  }

  function getProtocolsByEmployee(empId: string): ProtocolRecord[] {
    return protocols.value.filter(p => p.employee_id === empId);
  }

  function signProtocol(protocolId: string) {
    const p = protocols.value.find(p => p.id === protocolId);
    if (p && p.status === 'DRAFT') {
      p.status = 'SIGNED';
      p.signed_at = new Date().toISOString();
      saveToStorage();
    }
  }

  function approveProtocol(protocolId: string) {
    const p = protocols.value.find(p => p.id === protocolId);
    if (p && p.status === 'SIGNED') {
      p.status = 'APPROVED';
      saveToStorage();
    }
  }

  // --- Add new session from completed workflow 
  function addSession(record: Omit<SessionRecord, 'id' | 'created_at' | 'completed_at' | 'status'> & { id?: string }): SessionRecord {
    const now = new Date();
    const newRecord: SessionRecord = {
      ...record,
      id: record.id || `s-${now.getFullYear()}-${String(sessions.value.length + 1).padStart(3, '0')}`,
      created_at: now.toISOString(),
      completed_at: now.toISOString(),
      status: 'PENDING',
    };
    sessions.value.unshift(newRecord);
    saveToStorage();
    return newRecord;
  }

  // --- Update session status 

  function archiveProtocol(protocolId: string) {
    const p = protocols.value.find(p => p.id === protocolId)
    if (p && p.status === 'APPROVED') {
      p.status = 'ARCHIVED'
    }
  }

  function updateStatus(sessionId: string, status: SessionRecord['status']) {
    const s = sessions.value.find(x => x.id === sessionId);
    if (s) {
      s.status = status;
      // Auto-generate protocol when completed
      if (status === 'COMPLETED' && !s.protocol_id) {
        const protoId = `PR-2026-${String(protocols.value.length + 1).padStart(3, '0')}`;
        s.protocol_id = protoId;
        s.protocol_status = 'DRAFT';
        const qualification = s.accuracy >= 85 ? 'EXCELLENT' : s.accuracy >= 60 ? 'PASSED' : 'FAILED';
        protocols.value.unshift({
          id: protoId,
          session_id: s.id,
          protocol_number: `№${String(protocols.value.length + 1).padStart(4, '0')}/2026`,
          created_at: s.completed_at,
          signed_at: null,
          employee_id: s.employee_id,
          employee_name: s.employee_name,
          employee_rank: s.employee_rank,
          instructor_id: s.instructor_id,
          instructor_name: s.instructor_name,
          weapon_name: s.weapon_name,
          lane_number: s.lane_number,
          total_score: s.total_score,
          hit_count: s.hit_count,
          miss_count: s.miss_count,
          total_shots: s.total_shots,
          accuracy: s.accuracy,
          qualification: qualification as ProtocolRecord['qualification'],
          qr_code: `SHAFTIR|${protoId}|${s.employee_id}|${s.total_score}|${s.accuracy}`,
          status: 'DRAFT',
          notes: s.notes,
        });
      }
      saveToStorage();
    }
  }

  // --- Get single session 
  function getSession(sessionId: string): SessionRecord | undefined {
    return sessions.value.find(s => s.id === sessionId);
  }

  // --- Filter sessions 
  function filterSessions(filters: {
    employeeId?: string;
    employeeName?: string;
    status?: string;
    minScore?: number;
    maxScore?: number;
    dateFrom?: string;
    dateTo?: string;
  }): SessionRecord[] {
    return sessions.value.filter(s => {
      if (filters.employeeId && s.employee_id !== filters.employeeId) return false;
      if (filters.employeeName && !s.employee_name.toLowerCase().includes(filters.employeeName.toLowerCase())) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.minScore !== undefined && s.total_score < filters.minScore) return false;
      if (filters.maxScore !== undefined && s.total_score > filters.maxScore) return false;
      if (filters.dateFrom && new Date(s.created_at) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(s.created_at) > new Date(filters.dateTo)) return false;
      return true;
    });
  }

  // --- Get sessions by employee 
  function getSessionsByEmployee(empId: string): SessionRecord[] {
    return sessions.value.filter(s => s.employee_id === empId);
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessions: sessions.value,
        protocols: protocols.value,
      }));
    } catch { /* ignore */ }
  }

  return {
    sessions, protocols,
    totalSessions, completedSessions, pendingSessions,
    avgAccuracy, avgScore, totalShots, totalHits, passRate,
    monthlyTrends, weeklySessions, weaponDistribution,
    sessionsByEmployee, employeeStats, topPerformers,
    totalProtocols, signedProtocols, draftProtocols,
    getProtocol, getProtocolBySessionId, getProtocolsByEmployee,
    signProtocol, approveProtocol, archiveProtocol,
    addSession, updateStatus, getSession, filterSessions,
    getSessionsByEmployee,
  };
});
