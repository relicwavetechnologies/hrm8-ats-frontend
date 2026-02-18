import { apiClient } from './api';

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  isInbound: boolean;
}

export interface GmailThread {
  threadId: string;
  subject: string;
  snippet: string;
  lastMessageDate: string;
  messageCount: number;
  messages: GmailMessage[];
}

export interface EmailLogEntry {
  id: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
  user?: { id: string; name: string; email: string };
}

export interface EmailThreadsResponse {
  gmailThreads: GmailThread[];
  emailLogs: EmailLogEntry[];
  gmailConnected: boolean;
}

export const gmailThreadService = {
  async getEmailThreads(applicationId: string): Promise<EmailThreadsResponse> {
    const response = await apiClient.get<EmailThreadsResponse>(
      `/api/applications/${applicationId}/email-threads`
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch email threads');
    }
    return response.data;
  },
};
