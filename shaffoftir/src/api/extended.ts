// Extended API - HR, weapons, training, protocols, analytics, notifications
import { httpClientExtended as http } from './httpClientExtended';
import type {
  SystemUser, LoginRequest, LoginResponse,
  HREmployee, HREmployeeCreate, HRDepartment,
  Weapon, WeaponCreate, WeaponAssignment,
  TrainingPlan, TrainingPlanCreate, TrainingAssignment,
  Protocol, OperatorComment, OperatorCommentCreate,
  ReviewReason, ReviewReasonCreate,
  AnalyticsSummary, PerformanceTrend,
  AppNotification,
  RangeSchedule,
} from '@/types/extended';

// --- Auth 
export const authApi = {
  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/api/v1/auth/login/', data),
  me: () =>
    http.get<SystemUser>('/api/v1/auth/me/'),
  logout: () =>
    Promise.resolve({ message: 'Logged out' }),
};

// --- HR 
export const hrApi = {
  listEmployees: (params?: { search?: string; department?: string; status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department) query.set('department', params.department);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return http.get<HREmployee[]>(`/api/v1/employees/${qs ? '?' + qs : ''}`);
  },
  getEmployee: (id: string) => http.get<HREmployee>(`/api/v1/employees/${id}/`),
  createEmployee: (data: HREmployeeCreate) => http.post<HREmployee>('/api/v1/employees/', data),
  updateEmployee: (id: string, data: Partial<HREmployeeCreate>) => http.put<HREmployee>(`/api/v1/employees/${id}/`, data),
  deleteEmployee: (id: string) => http.delete<{ message: string }>(`/api/v1/employees/${id}/`),
  listDepartments: () => http.get<HRDepartment[]>('/api/v1/departments/'),
  getDepartment: (id: string) => http.get<HRDepartment>(`/api/v1/departments/${id}/`),
};

// --- Weapons 
export const weaponsApi = {
  list: (params?: { category?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return http.get<Weapon[]>(`/api/v1/weapons/${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => http.get<Weapon>(`/api/v1/weapons/${id}/`),
  create: (data: WeaponCreate) => http.post<Weapon>('/api/v1/weapons/', data),
  update: (id: string, data: WeaponCreate) => http.put<Weapon>(`/api/v1/weapons/${id}/`, data),
  delete: (id: string) => http.delete<{ message: string }>(`/api/v1/weapons/${id}/`),
  listAssignments: () => http.get<WeaponAssignment[]>('/api/v1/weapon-assignments/'),
};

// --- Training 
export const trainingApi = {
  listPlans: (params?: { difficulty?: string }) => {
    const query = new URLSearchParams();
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    const qs = query.toString();
    return http.get<TrainingPlan[]>(`/api/v1/training-plans/${qs ? '?' + qs : ''}`);
  },
  getPlan: (id: string) => http.get<TrainingPlan>(`/api/v1/training-plans/${id}/`),
  createPlan: (data: TrainingPlanCreate) => http.post<TrainingPlan>('/api/v1/training-plans/', data),
  updatePlan: (id: string, data: TrainingPlanCreate) => http.put<TrainingPlan>(`/api/v1/training-plans/${id}/`, data),
  deletePlan: (id: string) => http.delete<{ message: string }>(`/api/v1/training-plans/${id}/`),
  listAssignments: (params?: { status?: string; employee_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.employee_id) query.set('employee_id', params.employee_id);
    const qs = query.toString();
    return http.get<TrainingAssignment[]>(`/api/v1/training-assignments/${qs ? '?' + qs : ''}`);
  },
};

// --- Protocols 
export const protocolsApi = {
  list: (params?: { status?: string; employee_id?: string; session_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.employee_id) query.set('employee_id', params.employee_id);
    if (params?.session_id) query.set('session_id', params.session_id);
    const qs = query.toString();
    return http.get<Protocol[]>(`/api/v1/protocols/${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => http.get<Protocol>(`/api/v1/protocols/${id}/`),
  sign: (id: string) => http.post<Protocol>(`/api/v1/protocols/${id}/sign/`),
  approve: (id: string) => http.post<Protocol>(`/api/v1/protocols/${id}/approve/`),
  reject: (id: string, reason: string) => http.post<Protocol>(`/api/v1/protocols/${id}/reject/`, { reason }),
  listComments: (sessionId?: string) =>
    http.get<OperatorComment[]>(`/api/v1/operator-comments/${sessionId ? '?session_id=' + sessionId : ''}`),
  createComment: (data: OperatorCommentCreate) => http.post<OperatorComment>('/api/v1/operator-comments/', data),
  listReasons: (sessionId?: string) =>
    http.get<ReviewReason[]>(`/api/v1/review-reasons/${sessionId ? '?session_id=' + sessionId : ''}`),
  createReason: (data: ReviewReasonCreate) => http.post<ReviewReason>('/api/v1/review-reasons/', data),
};

// --- Analytics 
export const analyticsApi = {
  getSummary: () => http.get<AnalyticsSummary>('/api/v1/analytics/summary/'),
  getTrends: (days?: number) => http.get<PerformanceTrend[]>(`/api/v1/analytics/trends${days ? '?days=' + days : ''}`),
};

// --- Notifications 
export const notificationsApi = {
  list: (unreadOnly?: boolean) =>
    http.get<AppNotification[]>(`/api/v1/notifications/${unreadOnly ? '?unread_only=true' : ''}`),
  markRead: (id: string) => http.post<{ message: string }>(`/api/v1/notifications/${id}/mark_read/`),
  markAllRead: () => http.post<{ message: string }>('/api/v1/notifications/mark_all_read/'),
  delete: (id: string) => http.delete<{ message: string }>(`/api/v1/notifications/${id}/`),
};

// --- Schedule 
export const scheduleApi = {
  list: (params?: { date?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return http.get<RangeSchedule[]>(`/api/v1/range-schedules/${qs ? '?' + qs : ''}`);
  },
  create: (data: Partial<RangeSchedule>) => http.post<RangeSchedule>('/api/v1/range-schedules/', data),
  updateStatus: (id: string, status: string) =>
    http.patch<RangeSchedule>(`/api/v1/range-schedules/${id}/`, { status }),
  delete: (id: string) => http.delete<{ message: string }>(`/api/v1/range-schedules/${id}/`),
};
