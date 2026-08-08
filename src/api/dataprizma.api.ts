import { httpClient } from './httpClient';
import type {
  DataprizmaIncomingRequest,
  DataprizmaAckResponse,
  DataprizmaResultResponse,
} from '@/types';

export const dataprizmaApi = {
  sendShootingEvent: (data: DataprizmaIncomingRequest) =>
    httpClient.post<DataprizmaAckResponse | DataprizmaResultResponse>(
      '/api/dataprizma/shooting-event',
      data
    ),
};
