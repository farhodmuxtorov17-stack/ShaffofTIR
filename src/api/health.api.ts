import { httpClient } from './httpClient';
import type { HealthResponse } from '@/types';

export const healthApi = {
  check: () => httpClient.get<HealthResponse>('/health'),

  checkAi: () => httpClient.get<HealthResponse>('/health/ai'),
};
