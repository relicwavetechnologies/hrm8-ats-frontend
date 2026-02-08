import { apiClient } from './api';

export type JobRoundType = 'ASSESSMENT' | 'INTERVIEW';

export interface JobRound {
  id: string;
  jobId: string;
  name: string;
  order: number;
  type: JobRoundType;
  isFixed: boolean;
  fixedKey?: string | null;
  /** When set (Simple Flow), members with this job role are auto-assigned as round interviewers */
  assignedRoleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRoundRequest {
  name: string;
  type: JobRoundType;
  /** When set (Simple Flow), members with this job role are auto-assigned as round interviewers */
  assignedRoleId?: string;
}

export interface UpdateJobRoundRequest {
  name?: string;
  type?: JobRoundType;
  order?: number;
  assignedRoleId?: string | null;
}

class JobRoundService {
  /**
   * Get all rounds for a job
   */
  async getJobRounds(jobId: string) {
    return apiClient.get<{ rounds: JobRound[] }>(`/api/jobs/${jobId}/rounds`);
  }

  /**
   * Create a new round for a job
   */
  async createRound(jobId: string, data: CreateJobRoundRequest) {
    return apiClient.post<{ round: JobRound }>(`/api/jobs/${jobId}/rounds`, data);
  }

  /**
   * Update a round
   */
  async updateRound(jobId: string, roundId: string, data: UpdateJobRoundRequest) {
    return apiClient.put<{ round: JobRound }>(`/api/jobs/${jobId}/rounds/${roundId}`, data);
  }

  /**
   * Delete a round
   */
  async deleteRound(jobId: string, roundId: string) {
    return apiClient.delete(`/api/jobs/${jobId}/rounds/${roundId}`);
  }

  /**
   * Get email configuration for a round
   */
  async getEmailConfig(jobId: string, roundId: string) {
    return apiClient.get<{ enabled: boolean; templateId?: string }>(`/api/jobs/${jobId}/rounds/${roundId}/email-config`);
  }

  /**
   * Update email configuration for a round
   */
  async updateEmailConfig(jobId: string, roundId: string, config: { enabled: boolean; templateId?: string }) {
    return apiClient.put<{ round: JobRound }>(`/api/jobs/${jobId}/rounds/${roundId}/email-config`, config);
  }
}

export const jobRoundService = new JobRoundService();

