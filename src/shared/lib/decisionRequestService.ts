import { apiClient } from './api';

export interface DecisionRequest {
  id: string;
  application_id: string;
  job_id: string;
  consultant_id: string;
  action: 'OFFER' | 'REJECT';
  target_round_id: string | null;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  application?: {
    candidate?: { first_name?: string; last_name?: string; email?: string };
  };
  consultant?: { first_name?: string; last_name?: string };
}

export const decisionRequestService = {
  listByJob: async (jobId: string, status?: string) => {
    const params = status ? `?status=${status}` : '';
    const res = await apiClient.get<{ requests: DecisionRequest[] }>(
      `/api/decision-requests/jobs/${jobId}${params}`
    );
    return res;
  },

  listByCompany: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const res = await apiClient.get<{ requests: DecisionRequest[] }>(
      `/api/decision-requests/company${params}`
    );
    return res;
  },

  approve: async (requestId: string) => {
    return apiClient.post<{ approved: boolean; requestId: string }>(
      `/api/decision-requests/${requestId}/approve`,
      {}
    );
  },

  reject: async (requestId: string, rejectionReason: string) => {
    return apiClient.post<{ rejected: boolean; requestId: string }>(
      `/api/decision-requests/${requestId}/reject`,
      { rejectionReason }
    );
  },
};
