import { httpClient } from './httpClient';
import type { CameraHealthRequest, CameraHealthResponse } from '@/types';

export const cameraApi = {
  checkHealth: (data: CameraHealthRequest) =>
    httpClient.post<CameraHealthResponse>('/api/camera-health', data),
};
