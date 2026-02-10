/**
 * Settlement Service
 * API service for settlement management
 */

import { apiClient } from '../api';

export interface Settlement {
  id: string;
  licenseeId: string;
  licenseeName?: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  licenseeShare: number;
  hrm8Share: number;
  status: 'PENDING' | 'PAID';
  paymentDate?: string;
  reference?: string;
  generatedAt: string;
  licensee?: {
    id: string;
    name: string;
    email: string;
    revenueSharePercentage?: number;
  };
}

export interface SettlementStats {
  totalPending: number;
  totalPaid: number;
  pendingCount: number;
  paidCount: number;
  currentPeriodRevenue: number;
}

class SettlementService {
  /**
   * Get all settlements with filters
   */
  async getAll(filters?: {
    licenseeId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters?.licenseeId) queryParams.append('licenseeId', filters.licenseeId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.periodStart) queryParams.append('periodStart', filters.periodStart);
    if (filters?.periodEnd) queryParams.append('periodEnd', filters.periodEnd);

    const query = queryParams.toString();
    const response = await apiClient.get<{ settlements: any[] }>(`/api/hrm8/finance/settlements${query ? `?${query}` : ''}`);
    if (response.success && response.data?.settlements) {
      response.data.settlements = response.data.settlements.map((s: any) => ({
        id: s.id,
        licenseeId: s.licensee_id,
        licenseeName: s.licensee?.name,
        periodStart: s.period_start,
        periodEnd: s.period_end,
        totalRevenue: s.total_revenue,
        licenseeShare: s.licensee_share,
        hrm8Share: s.hrm8_share,
        status: s.status,
        paymentDate: s.paid_at,
        reference: s.payment_reference,
        generatedAt: s.created_at,
        licensee: s.licensee ? {
          id: s.licensee.id,
          name: s.licensee.name,
          email: s.licensee.email,
          revenueSharePercentage: s.licensee.revenue_share_percentage,
        } : undefined,
      }));
    }
    return response as any;
  }

  /**
   * Get settlement by ID
   */
  async getById(id: string) {
    const response = await apiClient.get<{ settlement: any }>(`/api/hrm8/finance/settlements/${id}`);
    if (response.success && response.data?.settlement) {
      const s = response.data.settlement;
      response.data.settlement = {
        id: s.id,
        licenseeId: s.licensee_id,
        licenseeName: s.licensee?.name,
        periodStart: s.period_start,
        periodEnd: s.period_end,
        totalRevenue: s.total_revenue,
        licenseeShare: s.licensee_share,
        hrm8Share: s.hrm8_share,
        status: s.status,
        paymentDate: s.paid_at,
        reference: s.payment_reference,
        generatedAt: s.created_at,
        licensee: s.licensee ? {
          id: s.licensee.id,
          name: s.licensee.name,
          email: s.licensee.email,
          revenueSharePercentage: s.licensee.revenue_share_percentage,
        } : undefined,
      };
    }
    return response as any;
  }

  /**
   * Calculate/Generate settlement for a period
   */
  async calculate(data: {
    licenseeId: string;
    periodStart: string;
    periodEnd: string;
  }) {
    const response = await apiClient.post<{ settlement: any }>('/api/hrm8/finance/settlements/calculate', data);
    if (response.success && response.data?.settlement) {
      const s = response.data.settlement;
      response.data.settlement = {
        id: s.id,
        licenseeId: s.licensee_id,
        licenseeName: s.licensee?.name,
        periodStart: s.period_start,
        periodEnd: s.period_end,
        totalRevenue: s.total_revenue,
        licenseeShare: s.licensee_share,
        hrm8Share: s.hrm8_share,
        status: s.status,
        paymentDate: s.paid_at,
        reference: s.payment_reference,
        generatedAt: s.created_at,
        licensee: s.licensee ? {
          id: s.licensee.id,
          name: s.licensee.name,
          email: s.licensee.email,
          revenueSharePercentage: s.licensee.revenue_share_percentage,
        } : undefined,
      };
    }
    return response as any;
  }

  /**
   * Mark settlement as paid
   */
  async markAsPaid(id: string, data: {
    paymentDate: string;
    reference: string;
  }) {
    const response = await apiClient.put<{ settlement: any }>(`/api/hrm8/finance/settlements/${id}/pay`, data);
    if (response.success && response.data?.settlement) {
      const s = response.data.settlement;
      response.data.settlement = {
        id: s.id,
        licenseeId: s.licensee_id,
        licenseeName: s.licensee?.name,
        periodStart: s.period_start,
        periodEnd: s.period_end,
        totalRevenue: s.total_revenue,
        licenseeShare: s.licensee_share,
        hrm8Share: s.hrm8_share,
        status: s.status,
        paymentDate: s.paid_at,
        reference: s.payment_reference,
        generatedAt: s.created_at,
        licensee: s.licensee ? {
          id: s.licensee.id,
          name: s.licensee.name,
          email: s.licensee.email,
          revenueSharePercentage: s.licensee.revenue_share_percentage,
        } : undefined,
      };
    }
    return response as any;
  }

  /**
   * Get settlement statistics
   */
  async getStats(licenseeId?: string) {
    const queryParams = new URLSearchParams();
    if (licenseeId) queryParams.append('licenseeId', licenseeId);

    const query = queryParams.toString();
    const response = await apiClient.get<{ stats: any }>(`/api/hrm8/finance/settlements/stats${query ? `?${query}` : ''}`);
    if (response.success && response.data?.stats) {
      const s = response.data.stats;
      response.data.stats = {
        totalPending: s.total_pending ?? s.totalPending,
        totalPaid: s.total_paid ?? s.totalPaid,
        pendingCount: s.pending_count ?? s.pendingCount,
        paidCount: s.paid_count ?? s.paidCount,
        currentPeriodRevenue: s.current_period_revenue ?? s.currentPeriodRevenue,
      };
    }
    return response as any;
  }
}

export const settlementService = new SettlementService();
