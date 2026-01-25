/**
 * API Service for User Notification Preferences
 * Handles communication with backend for notification preferences and alert rules
 */

import { apiClient } from './api';
import type { NotificationPreferences, AlertRule } from '@/shared/types/notificationPreferences';

export interface UpdatePreferencesData {
    eventPreferences?: Record<string, { enabled: boolean; channels: string[] }>;
    quietHours?: { enabled: boolean; start: string; end: string } | null;
}

export interface CreateAlertRuleData {
    name: string;
    description?: string;
    enabled?: boolean;
    eventType: string;
    conditions: Array<{
        field: string;
        operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
        value: string | number;
    }>;
    actions: {
        channels: string[];
        recipients: string[];
        priority: 'low' | 'medium' | 'high' | 'critical';
    };
}

export const userNotificationPreferencesService = {
    /**
     * Get notification preferences for the authenticated user
     */
    async getPreferences(): Promise<NotificationPreferences> {
        const response = await apiClient.get<{ preferences: NotificationPreferences }>('/api/users/preferences/notifications');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch preferences');
        }
        return response.data.preferences;
    },

    /**
     * Update notification preferences
     */
    async updatePreferences(data: UpdatePreferencesData): Promise<NotificationPreferences> {
        const response = await apiClient.put<{ preferences: NotificationPreferences }>('/api/users/preferences/notifications', data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to update preferences');
        }
        return response.data.preferences;
    },

    /**
     * Get all alert rules for the authenticated user
     */
    async getAlertRules(): Promise<AlertRule[]> {
        const response = await apiClient.get<{ rules: AlertRule[] }>('/api/users/alerts/rules');
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to fetch alert rules');
        }
        return response.data.rules;
    },

    /**
     * Create a new alert rule
     */
    async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
        const response = await apiClient.post<{ rule: AlertRule }>('/api/users/alerts/rules', data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to create alert rule');
        }
        return response.data.rule;
    },

    /**
     * Update an existing alert rule
     */
    async updateAlertRule(ruleId: string, data: Partial<CreateAlertRuleData>): Promise<AlertRule> {
        const response = await apiClient.put<{ rule: AlertRule }>(`/api/users/alerts/rules/${ruleId}`, data);
        if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to update alert rule');
        }
        return response.data.rule;
    },

    /**
     * Delete an alert rule
     */
    async deleteAlertRule(ruleId: string): Promise<void> {
        const response = await apiClient.delete(`/api/users/alerts/rules/${ruleId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete alert rule');
        }
    },
};
