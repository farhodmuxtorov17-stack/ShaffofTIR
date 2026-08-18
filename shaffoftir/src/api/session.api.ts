import { httpClient } from './httpClient';
import type {
  StartSessionRequest,
  StartSessionResponse,
  SessionResponse,
  ProcessTurnCameraRequest,
  TargetProcessResponse,
  ProcessTurnUploadRequest,
} from '@/types';

export const sessionApi = {
  start: (data?: StartSessionRequest) =>
    httpClient.post<StartSessionResponse>('/api/session/start', data),

  getSummary: (sessionId: string) =>
    httpClient.get<SessionResponse>(
      `/api/session/summary?session_id=${encodeURIComponent(sessionId)}`
    ),

  processTurn: (data: ProcessTurnCameraRequest) =>
    httpClient.post<TargetProcessResponse>('/api/session/process_turn', data),

  processTurnUpload: (data: ProcessTurnUploadRequest) => {
    const formData = new FormData();
    formData.append('session_id', data.session_id);
    formData.append('soldier_seq', String(data.soldier_seq));
    formData.append('shot_type', data.shot_type);
    formData.append('expected_shots', String(data.expected_shots));
    formData.append('file', data.file);
    if (data.baseline_file) {
      formData.append('baseline_file', data.baseline_file);
    }
    return httpClient.post<TargetProcessResponse>(
      '/api/session/process_turn/upload',
      formData
    );
  },
};
