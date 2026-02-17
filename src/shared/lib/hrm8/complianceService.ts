/**
 * Compliance Alerts Service (Frontend)
 * API client for compliance alerts and audit history
 */

import { apiClient } from '../api';

export interface ComplianceAlert {
    id: string;
    type: 'OVERDUE_PAYOUT' | 'INACTIVE_REGION' | 'REVENUE_DECLINE' | 'EXPIRED_AGREEMENT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    entityType: 'LICENSEE' | 'REGION';
    entityId: string;
    entityName: string;
    title: string;
    description: string;
    value?: number;
    threshold?: number;
    detectedAt: string;
}

export interface AlertSummary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
}

export interface AuditLogEntry {
    id: string;
    entityType?: string;
    entity_type?: string;
    entityId?: string;
    entity_id?: string;
    action: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    changes?: Record<string, unknown> | null;
    performedBy?: string;
    performed_by?: string;
    performedAt?: string;
    performed_at?: string;
    ipAddress?: string | null;
    ip_address?: string | null;
    notes?: string | null;
    description?: string | null;
}

class ComplianceService {
    private normalizeAuditEntry(entry: any): AuditLogEntry {
        return {
            id: entry.id,
            entityType: entry.entityType ?? entry.entity_type,
            entity_type: entry.entity_type ?? entry.entityType,
            entityId: entry.entityId ?? entry.entity_id,
            entity_id: entry.entity_id ?? entry.entityId,
            action: entry.action,
            oldValue: entry.oldValue ?? null,
            newValue: entry.newValue ?? null,
            changes: entry.changes ?? null,
            performedBy: entry.performedBy ?? entry.performed_by ?? 'System',
            performed_by: entry.performed_by ?? entry.performedBy ?? 'System',
            performedAt: entry.performedAt ?? entry.performed_at ?? null,
            performed_at: entry.performed_at ?? entry.performedAt ?? null,
            ipAddress: entry.ipAddress ?? entry.ip_address ?? null,
            ip_address: entry.ip_address ?? entry.ipAddress ?? null,
            notes: entry.notes ?? null,
            description: entry.description ?? null,
        };
    }

    async getAlerts() {
        return apiClient.get<{ alerts: ComplianceAlert[] }>('/api/hrm8/compliance/alerts');
    }

    async getAlertSummary() {
        return apiClient.get<AlertSummary>('/api/hrm8/compliance/summary');
    }

    async getAuditHistory(entityType: string, entityId: string, limit: number = 50) {
        const response = await apiClient.get<{ history: AuditLogEntry[] }>(
            `/api/hrm8/compliance/audit/${entityType}/${entityId}?limit=${limit}`
        );
        if (response.success && response.data?.history) {
            response.data.history = response.data.history.map((entry) => this.normalizeAuditEntry(entry));
        }
        return response;
    }

    async getRecentAudit(limit: number = 100) {
        const response = await apiClient.get<{ entries: AuditLogEntry[] | { logs?: AuditLogEntry[]; total?: number }; logs?: AuditLogEntry[]; total?: number }>(
            `/api/hrm8/compliance/audit/recent?limit=${limit}`
        );
        if (response.success && response.data) {
            const payload = response.data as any;
            const rawEntries = Array.isArray(payload.entries)
                ? payload.entries
                : Array.isArray(payload.entries?.logs)
                    ? payload.entries.logs
                    : Array.isArray(payload.logs)
                        ? payload.logs
                        : [];
            payload.entries = rawEntries.map((entry: AuditLogEntry) => this.normalizeAuditEntry(entry));
        }
        return response;
    }
}

export const complianceService = new ComplianceService();
