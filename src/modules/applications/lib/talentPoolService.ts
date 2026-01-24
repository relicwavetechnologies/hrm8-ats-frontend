
import { apiClient } from '@/shared/services/api';

export interface TalentPoolCandidate {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    photo?: string;
    linkedInUrl?: string;
    city?: string;
    state?: string;
    country?: string;
    visaStatus?: string;
    workEligibility?: string;
    jobTypePreference: string[];
    salaryPreference?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    relocationWilling?: boolean;
    remotePreference?: string;
    emailVerified: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
}

class TalentPoolService {
    /**
     * Search candidates in talent pool
     */
    async searchCandidates(filters?: {
        search?: string;
        city?: string;
        state?: string;
        country?: string;
        status?: string;
        jobId?: string; // To check if candidates have already applied
        limit?: number;
        offset?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.city) queryParams.append('city', filters.city);
        if (filters?.state) queryParams.append('state', filters.state);
        if (filters?.country) queryParams.append('country', filters.country);
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.jobId) queryParams.append('jobId', filters.jobId);
        if (filters?.limit) queryParams.append('limit', filters.limit.toString());
        if (filters?.offset) queryParams.append('offset', filters.offset.toString());

        const queryString = queryParams.toString();
        const endpoint = `/api/talent-pool/search${queryString ? `?${queryString}` : ''}`;

        return apiClient.get<{
            candidates: (TalentPoolCandidate & { hasApplied?: boolean })[];
            total: number;
            limit: number;
            offset: number;
        }>(endpoint);
    }

    /**
     * Send job invitation email to non-user
     */
    async sendJobInvitation(data: {
        email: string;
        jobId: string;
    }) {
        return apiClient.post<{ message: string }>('/api/talent-pool/invite', data);
    }
}

export const talentPoolService = new TalentPoolService();
