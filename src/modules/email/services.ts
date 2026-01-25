import { z } from "zod";

/**
 * Email service for sending ATS notifications
 * Note: Currently using mock implementation for dev
 */



export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'stage_change' | 'interview_scheduled' | 'offer_sent' | 'rejection' | 'reminder';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  metadata?: Record<string, any>;
}

// Validation schema
const emailSchema = z.object({
  to: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
});

const mockNotifications: EmailNotification[] = [];

export function sendStageChangeEmail(
  candidateName: string,
  candidateEmail: string,
  fromStage: string,
  toStage: string,
  jobTitle: string
): EmailNotification {
  // Validate email
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Application Update: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nYour application for ${jobTitle} has been moved to ${toStage}.\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'stage_change',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      fromStage,
      toStage,
      jobTitle,
    },
  };

  mockNotifications.unshift(notification);

  // Simulate sending (in real app, would call email service API)
  console.log(`📧 Email notification sent to ${candidateEmail}:`, notification.subject);

  return notification;
}

export function sendInterviewScheduledEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  interviewDate: string,
  interviewType: string
): EmailNotification {
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Interview Scheduled: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nYour ${interviewType} interview for ${jobTitle} has been scheduled for ${new Date(interviewDate).toLocaleString()}.\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'interview_scheduled',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      jobTitle,
      interviewDate,
      interviewType,
    },
  };

  mockNotifications.unshift(notification);
  console.log(`📧 Interview email sent to ${candidateEmail}`);

  return notification;
}

export function sendOfferEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  offerDetails: string
): EmailNotification {
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Job Offer: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nCongratulations! We are pleased to extend an offer for the position of ${jobTitle}.\n\n${offerDetails}\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'offer_sent',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      jobTitle,
      offerDetails,
    },
  };

  mockNotifications.unshift(notification);
  console.log(`📧 Offer email sent to ${candidateEmail}`);

  return notification;
}

export function sendRejectionEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
): EmailNotification {
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Application Update: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nThank you for your interest in the ${jobTitle} position. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate your time and wish you the best in your job search.\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'rejection',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      jobTitle,
    },
  };

  mockNotifications.unshift(notification);
  console.log(`📧 Rejection email sent to ${candidateEmail}`);

  return notification;
}

export function getNotifications(limit: number = 50): EmailNotification[] {
  return mockNotifications.slice(0, limit);
}

export function getNotificationsByCandidate(candidateEmail: string): EmailNotification[] {
  return mockNotifications.filter((n) => n.to === candidateEmail);
}
import { EmailLog, EmailEvent, EmailStats } from '@/shared/types/emailTracking';
import { mockEmailLogs, mockEmailEvents } from './mockEmailLogs';

const EMAIL_LOGS_KEY = 'email_logs';
const EMAIL_EVENTS_KEY = 'email_events';

export function getEmailLogs(): EmailLog[] {
  const stored = localStorage.getItem(EMAIL_LOGS_KEY);
  if (!stored) {
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(mockEmailLogs));
    return mockEmailLogs;
  }
  return JSON.parse(stored);
}

export function getEmailLog(id: string): EmailLog | undefined {
  const logs = getEmailLogs();
  return logs.find(log => log.id === id);
}

export function saveEmailLog(log: EmailLog): void {
  const logs = getEmailLogs();
  const index = logs.findIndex(l => l.id === log.id);
  if (index >= 0) {
    logs[index] = log;
  } else {
    logs.push(log);
  }
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs));
}

export function deleteEmailLog(id: string): void {
  const logs = getEmailLogs();
  const filtered = logs.filter(log => log.id !== id);
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(filtered));
}

export function getEmailEvents(emailLogId?: string): EmailEvent[] {
  const stored = localStorage.getItem(EMAIL_EVENTS_KEY);
  let events: EmailEvent[] = [];

  if (!stored) {
    localStorage.setItem(EMAIL_EVENTS_KEY, JSON.stringify(mockEmailEvents));
    events = mockEmailEvents;
  } else {
    events = JSON.parse(stored);
  }

  if (emailLogId) {
    return events.filter(event => event.emailLogId === emailLogId);
  }
  return events;
}

export function addEmailEvent(event: EmailEvent): void {
  const events = getEmailEvents();
  events.push(event);
  localStorage.setItem(EMAIL_EVENTS_KEY, JSON.stringify(events));
}

export function getEmailStats(): EmailStats {
  const logs = getEmailLogs();
  const sent = logs.filter(log => log.status === 'sent');

  const totalSent = sent.length;
  const totalDelivered = sent.length; // In mock, all sent are delivered
  const totalOpened = sent.reduce((sum, log) => sum + (log.opens > 0 ? 1 : 0), 0);
  const totalClicked = sent.reduce((sum, log) => sum + (log.clicks > 0 ? 1 : 0), 0);
  const totalBounced = sent.reduce((sum, log) => sum + log.bounces.length, 0);
  const totalFailed = logs.filter(log => log.status === 'failed').length;

  return {
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    totalBounced,
    totalFailed,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
  };
}

export function getScheduledEmails(): EmailLog[] {
  const logs = getEmailLogs();
  return logs.filter(log => log.status === 'scheduled');
}

export function getRecentEmails(limit: number = 10): EmailLog[] {
  const logs = getEmailLogs();
  return logs
    .filter(log => log.status === 'sent')
    .sort((a, b) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime())
    .slice(0, limit);
}

export function getDraftEmails(): EmailLog[] {
  const logs = getEmailLogs();
  return logs.filter(log => log.status === 'draft');
}

export function getFilteredEmails(filters: {
  status?: EmailLog['status'];
  dateFrom?: Date;
  dateTo?: Date;
}): EmailLog[] {
  let logs = getEmailLogs();

  if (filters.status) {
    logs = logs.filter(log => log.status === filters.status);
  }

  if (filters.dateFrom) {
    logs = logs.filter(log => {
      const logDate = new Date(log.sentAt || log.scheduledFor || log.createdAt);
      return logDate >= filters.dateFrom!;
    });
  }

  if (filters.dateTo) {
    logs = logs.filter(log => {
      const logDate = new Date(log.sentAt || log.scheduledFor || log.createdAt);
      return logDate <= filters.dateTo!;
    });
  }

  return logs.sort((a, b) => {
    const dateA = new Date(a.sentAt || a.scheduledFor || a.createdAt);
    const dateB = new Date(b.sentAt || b.scheduledFor || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}
export interface EmailPreference {
  workflowId: string;
  employeeEmail: string;
  preferences: {
    welcomeEmails: boolean;
    taskReminders: boolean;
    documentRequests: boolean;
    statusUpdates: boolean;
    generalAnnouncements: boolean;
  };
  unsubscribedAt?: Date;
  isFullyUnsubscribed: boolean;
  updatedAt: Date;
}

const STORAGE_KEY = "email_preferences";

export function getEmailPreferences(): EmailPreference[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const prefs = JSON.parse(saved);
    return prefs.map((p: any) => ({
      ...p,
      unsubscribedAt: p.unsubscribedAt ? new Date(p.unsubscribedAt) : undefined,
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error) {
    console.error("Error loading email preferences:", error);
    return [];
  }
}

export function getPreferenceByWorkflowId(workflowId: string): EmailPreference | null {
  const prefs = getEmailPreferences();
  return prefs.find(p => p.workflowId === workflowId) || null;
}

export function getPreferenceByEmail(email: string): EmailPreference | null {
  const prefs = getEmailPreferences();
  return prefs.find(p => p.employeeEmail === email) || null;
}

export function createOrUpdatePreference(
  workflowId: string,
  employeeEmail: string,
  preferences: Partial<EmailPreference['preferences']>
): EmailPreference {
  const allPrefs = getEmailPreferences();
  const existingIndex = allPrefs.findIndex(p => p.workflowId === workflowId);

  const updatedPreference: EmailPreference = existingIndex >= 0
    ? {
      ...allPrefs[existingIndex],
      preferences: {
        ...allPrefs[existingIndex].preferences,
        ...preferences,
      },
      updatedAt: new Date(),
    }
    : {
      workflowId,
      employeeEmail,
      preferences: {
        welcomeEmails: preferences.welcomeEmails ?? true,
        taskReminders: preferences.taskReminders ?? true,
        documentRequests: preferences.documentRequests ?? true,
        statusUpdates: preferences.statusUpdates ?? true,
        generalAnnouncements: preferences.generalAnnouncements ?? true,
      },
      isFullyUnsubscribed: false,
      updatedAt: new Date(),
    };

  if (existingIndex >= 0) {
    allPrefs[existingIndex] = updatedPreference;
  } else {
    allPrefs.push(updatedPreference);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs));
  return updatedPreference;
}

export function unsubscribeFromAll(workflowId: string, employeeEmail: string): void {
  const allPrefs = getEmailPreferences();
  const existingIndex = allPrefs.findIndex(p => p.workflowId === workflowId);

  const unsubscribedPreference: EmailPreference = {
    workflowId,
    employeeEmail,
    preferences: {
      welcomeEmails: false,
      taskReminders: false,
      documentRequests: false,
      statusUpdates: false,
      generalAnnouncements: false,
    },
    isFullyUnsubscribed: true,
    unsubscribedAt: new Date(),
    updatedAt: new Date(),
  };

  if (existingIndex >= 0) {
    allPrefs[existingIndex] = unsubscribedPreference;
  } else {
    allPrefs.push(unsubscribedPreference);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs));
}

export function resubscribe(workflowId: string): void {
  const allPrefs = getEmailPreferences();
  const pref = allPrefs.find(p => p.workflowId === workflowId);

  if (pref) {
    pref.isFullyUnsubscribed = false;
    pref.unsubscribedAt = undefined;
    pref.preferences = {
      welcomeEmails: true,
      taskReminders: true,
      documentRequests: true,
      statusUpdates: true,
      generalAnnouncements: true,
    };
    pref.updatedAt = new Date();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrefs));
  }
}

export function canSendEmailType(workflowId: string, emailType: string): boolean {
  const pref = getPreferenceByWorkflowId(workflowId);

  if (!pref) return true; // No preferences set, allow all
  if (pref.isFullyUnsubscribed) return false;

  // Map email types to preference keys
  const typeMap: Record<string, keyof EmailPreference['preferences']> = {
    'welcome': 'welcomeEmails',
    'Welcome Email': 'welcomeEmails',
    'task_reminder': 'taskReminders',
    'Task Reminder': 'taskReminders',
    'document_request': 'documentRequests',
    'Document Request': 'documentRequests',
    'status_update': 'statusUpdates',
    'Status Update': 'statusUpdates',
    'announcement': 'generalAnnouncements',
    'General Announcement': 'generalAnnouncements',
  };

  const prefKey = typeMap[emailType];
  if (!prefKey) return true; // Unknown type, allow by default

  return pref.preferences[prefKey];
}

export function getUnsubscribeStats() {
  const prefs = getEmailPreferences();
  const totalWithPrefs = prefs.length;
  const fullyUnsubscribed = prefs.filter(p => p.isFullyUnsubscribed).length;
  const partiallyUnsubscribed = prefs.filter(p =>
    !p.isFullyUnsubscribed &&
    Object.values(p.preferences).some(v => !v)
  ).length;

  return {
    totalWithPrefs,
    fullyUnsubscribed,
    partiallyUnsubscribed,
    subscribed: totalWithPrefs - fullyUnsubscribed - partiallyUnsubscribed,
  };
}
