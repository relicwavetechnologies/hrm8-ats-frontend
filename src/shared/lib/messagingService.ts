/**
 * Messaging Service
 * Handles API calls for conversations and messages
 */

import { apiClient } from './api';
import { ConversationData, MessageData } from '@/shared/types/websocket';

export interface GetConversationsResponse {
    conversations: ConversationData[];
}

export interface GetConversationResponse {
    conversation: ConversationData;
}

export interface GetMessagesResponse {
    messages: MessageData[];
}

const normalizeMessage = (raw: any): MessageData => ({
    id: String(raw?.id || ''),
    conversationId: String(raw?.conversationId || raw?.conversation_id || ''),
    senderEmail: String(raw?.senderEmail || raw?.sender_email || ''),
    senderType: (raw?.senderType || raw?.sender_type || 'SYSTEM') as MessageData['senderType'],
    senderId: raw?.senderId || raw?.sender_id,
    content: String(raw?.content || ''),
    contentType: (raw?.contentType || raw?.content_type || 'TEXT') as MessageData['contentType'],
    readBy: Array.isArray(raw?.readBy) ? raw.readBy : (Array.isArray(raw?.read_by) ? raw.read_by : []),
    deliveredAt: raw?.deliveredAt || raw?.delivered_at,
    readAt: raw?.readAt || raw?.read_at,
    createdAt: String(raw?.createdAt || raw?.created_at || new Date().toISOString()),
    updatedAt: String(raw?.updatedAt || raw?.updated_at || raw?.createdAt || raw?.created_at || new Date().toISOString()),
    isOwn: raw?.isOwn,
});

const normalizeConversation = (raw: any): ConversationData => {
    const participants = Array.isArray(raw?.participants) ? raw.participants : [];
    const rawMessages = Array.isArray(raw?.messages) ? raw.messages : [];
    const normalizedLastMessage = raw?.lastMessage
        ? normalizeMessage(raw.lastMessage)
        : (rawMessages[0] ? normalizeMessage(rawMessages[0]) : undefined);
    const rawJob = raw?.job;

    return {
        id: String(raw?.id || ''),
        jobId: raw?.jobId || raw?.job_id || rawJob?.id || null,
        candidateId: raw?.candidateId || raw?.candidate_id || raw?.candidate?.id || null,
        participants: participants.map((participant: any) => ({
            participantType: participant?.participantType || participant?.participant_type || 'SYSTEM',
            participantId: String(participant?.participantId || participant?.participant_id || ''),
            participantEmail: String(participant?.participantEmail || participant?.participant_email || ''),
            displayName: participant?.displayName || participant?.display_name || null,
        })),
        status: (raw?.status || 'ACTIVE') as ConversationData['status'],
        lastMessageId: raw?.lastMessageId || raw?.last_message_id || normalizedLastMessage?.id,
        createdAt: String(raw?.createdAt || raw?.created_at || new Date().toISOString()),
        updatedAt: String(raw?.updatedAt || raw?.updated_at || new Date().toISOString()),
        job: rawJob
            ? {
                id: String(rawJob?.id || raw?.jobId || raw?.job_id || ''),
                title: String(rawJob?.title || raw?.job_title || 'Unknown Job'),
            }
            : undefined,
        lastMessage: normalizedLastMessage,
    };
};

const normalizeConversationsResponse = (raw: any): ConversationData[] => {
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.conversations) ? raw.conversations : []);
    return list.map(normalizeConversation);
};

export default class MessagingService {
    /**
     * Get all conversations for the current user (CANDIDATE endpoint)
     */
    async getConversations(): Promise<{
        success: boolean;
        data?: ConversationData[];
        error?: string;
    }> {
        try {
            const response = await apiClient.get<GetConversationsResponse>(
                '/api/candidate/messages/conversations'
            );
            if (response.success && response.data) {
                return {
                    success: true,
                    data: normalizeConversationsResponse(response.data),
                };
            }
            return {
                success: false,
                error: response.error || 'Failed to fetch conversations',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    /**
     * Get all conversations for admin/HR users (EMPLOYER endpoint)
     */
    async getAdminConversations(): Promise<{
        success: boolean;
        data?: ConversationData[];
        error?: string;
    }> {
        try {
            const response = await apiClient.get<ConversationData[] | { conversations?: ConversationData[] }>(
                '/api/messaging/conversations'
            );
            if (response.success && response.data) {
                return {
                    success: true,
                    data: normalizeConversationsResponse(response.data),
                };
            }
            // Backward-compatible fallback for older API paths.
            const fallback = await apiClient.get<ConversationData[] | { conversations?: ConversationData[] }>(
                '/api/messages/conversations'
            );
            if (fallback.success && fallback.data) {
                return {
                    success: true,
                    data: normalizeConversationsResponse(fallback.data),
                };
            }
            return {
                success: false,
                error: fallback.error || response.error || 'Failed to fetch conversations',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    /**
     * Get a specific conversation for admin/HR users (EMPLOYER endpoint)
     */
    async getAdminConversation(
        conversationId: string
    ): Promise<{
        success: boolean;
        data?: ConversationData;
        error?: string;
    }> {
        try {
            const response = await apiClient.get<ConversationData>(
                `/api/messaging/conversations/${conversationId}`
            );
            if (response.success && response.data) {
                return {
                    success: true,
                    data: normalizeConversation(response.data),
                };
            }
            // Backward-compatible fallback for older API paths.
            const fallback = await apiClient.get<ConversationData>(
                `/api/messages/conversations/${conversationId}`
            );
            if (fallback.success && fallback.data) {
                return {
                    success: true,
                    data: normalizeConversation(fallback.data),
                };
            }
            return {
                success: false,
                error: fallback.error || response.error || 'Failed to fetch conversation',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }


    /**
     * Get a specific conversation by ID (CANDIDATE endpoint)
     */
    async getConversation(
        conversationId: string
    ): Promise<{
        success: boolean;
        data?: ConversationData;
        error?: string;
    }> {
        try {
            const response = await apiClient.get<GetConversationResponse>(
                `/api/candidate/messages/conversations/${conversationId}`
            );
            if (response.success && response.data) {
                return {
                    success: true,
                    data: normalizeConversation((response.data as any)?.conversation || response.data),
                };
            }
            return {
                success: false,
                error: response.error || 'Failed to fetch conversation',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(
        conversationId: string
    ): Promise<{
        success: boolean;
        data?: MessageData[];
        error?: string;
    }> {
        try {
            const response = await apiClient.get<GetMessagesResponse>(
                `/api/candidate/messages/conversations/${conversationId}`
            );
            if (response.success && response.data) {
                const payload = (response.data as any)?.messages || response.data;
                const normalized = (Array.isArray(payload) ? payload : []).map(normalizeMessage);
                // Backend returns newest-first; keep as-is for UI to handle ordering
                return {
                    success: true,
                    data: normalized,
                };
            }
            return {
                success: false,
                error: response.error || 'Failed to fetch messages',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    /**
     * Mark a conversation as read
     */
    async markConversationRead(
        conversationId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await apiClient.put(
                `/api/candidate/messages/conversations/${conversationId}/read`
            );
            if (response.success) {
                return { success: true };
            }
            return { success: false, error: response.error || 'Failed to mark as read' };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    /**
     * Get conversation by job and candidate (for candidates)
     */
    async getConversationByJobAndCandidate(
        jobId: string,
        candidateId: string
    ): Promise<{
        success: boolean;
        data?: ConversationData;
        error?: string;
    }> {
        try {
            const response = await apiClient.get<GetConversationResponse>(
                `/api/conversations/job/${jobId}/candidate/${candidateId}`
            );
            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data.conversation,
                };
            }
            return {
                success: false,
                error: response.error || 'Failed to fetch conversation',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }
}

export const messagingService = new MessagingService();
