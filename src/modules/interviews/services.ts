export interface Interview {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewerIds: string[];
  interviewerNames: string[];
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel';
  round: number;
  scheduledDate: string;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  notes?: string;
  feedback?: InterviewFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  interviewerId: string;
  interviewerName: string;
  rating: number; // 1-5
  recommendation: 'strong-hire' | 'hire' | 'neutral' | 'no-hire' | 'strong-no-hire';
  strengths: string[];
  concerns: string[];
  notes: string;
  submittedAt: string;
}

export interface InterviewSlot {
  date: string;
  startTime: string;
  endTime: string;
  interviewerId: string;
  available: boolean;
}

// Mock data
const mockInterviews: Interview[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'c1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.j@email.com',
    interviewerIds: ['i1', 'i2'],
    interviewerNames: ['John Doe', 'Jane Smith'],
    type: 'video',
    round: 1,
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'c2',
    candidateName: 'Michael Chen',
    candidateEmail: 'm.chen@email.com',
    interviewerIds: ['i1'],
    interviewerNames: ['John Doe'],
    type: 'technical',
    round: 2,
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getInterviews(filters?: {
  jobId?: string;
  candidateId?: string;
  status?: Interview['status'];
  startDate?: string;
  endDate?: string;
}): Interview[] {
  let filtered = [...mockInterviews];

  if (filters?.jobId) {
    filtered = filtered.filter((i) => i.jobId === filters.jobId);
  }
  if (filters?.candidateId) {
    filtered = filtered.filter((i) => i.candidateId === filters.candidateId);
  }
  if (filters?.status) {
    filtered = filtered.filter((i) => i.status === filters.status);
  }
  if (filters?.startDate) {
    filtered = filtered.filter((i) => i.scheduledDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter((i) => i.scheduledDate <= filters.endDate!);
  }

  return filtered.sort((a, b) =>
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
}

export function scheduleInterview(
  interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>
): Interview {
  const newInterview: Interview = {
    ...interview,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockInterviews.push(newInterview);
  return newInterview;
}

export function updateInterview(
  id: string,
  updates: Partial<Interview>
): Interview | null {
  const index = mockInterviews.findIndex((i) => i.id === id);
  if (index === -1) return null;

  mockInterviews[index] = {
    ...mockInterviews[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockInterviews[index];
}

export function cancelInterview(id: string): boolean {
  return updateInterview(id, { status: 'cancelled' }) !== null;
}

export function submitFeedback(
  interviewId: string,
  feedback: InterviewFeedback
): Interview | null {
  const interview = mockInterviews.find((i) => i.id === interviewId);
  if (!interview) return null;

  const existingFeedback = interview.feedback || [];
  const updatedFeedback = [
    ...existingFeedback.filter((f) => f.interviewerId !== feedback.interviewerId),
    feedback,
  ];

  return updateInterview(interviewId, { feedback: updatedFeedback });
}

export function getAvailableSlots(
  interviewerId: string,
  date: string
): InterviewSlot[] {
  // Mock available slots
  const slots: InterviewSlot[] = [];
  const hours = [9, 10, 11, 13, 14, 15, 16];

  hours.forEach((hour) => {
    slots.push({
      date,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      interviewerId,
      available: Math.random() > 0.3, // 70% chance of being available
    });
  });

  return slots;
}

export function getInterviewStats(jobId?: string) {
  const interviews = jobId ? getInterviews({ jobId }) : mockInterviews;

  return {
    total: interviews.length,
    scheduled: interviews.filter((i) => i.status === 'scheduled').length,
    completed: interviews.filter((i) => i.status === 'completed').length,
    cancelled: interviews.filter((i) => i.status === 'cancelled').length,
    upcoming: interviews.filter(
      (i) => i.status === 'scheduled' && new Date(i.scheduledDate) > new Date()
    ).length,
  };
}
/**
 * Video Interview Service
 * Handles video interview API calls
 */

import { apiClient } from '@/shared/lib/api';
// InterviewFeedback is defined above, removing duplicate import

export interface VideoInterview {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  scheduledDate: string;
  duration: number;
  meetingLink?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  interviewerIds: string[];
  recordingUrl?: string;
  transcript?: Record<string, unknown>;
  feedback?: InterviewFeedback[];
  interviewFeedbacks?: InterviewFeedback[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields from backend
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
  };
  application?: {
    id: string;
    candidateName: string;
    jobTitle: string;
  };
}

export interface CreateVideoInterviewRequest {
  applicationId: string;
  scheduledDate: string; // ISO string
  duration: number;
  type: 'VIDEO' | 'PHONE' | 'IN_PERSON';
  interviewerIds: string[];
  notes?: string;
}

export interface VideoInterviewFilters {
  jobId?: string;
  candidateId?: string;
  interviewerId?: string;
  status?: VideoInterview['status'];
  startDate?: string;
  endDate?: string;
}

class VideoInterviewService {
  /**
   * Get all video interviews with optional filters
   */
  async getInterviews(filters?: VideoInterviewFilters) {
    const queryParams = new URLSearchParams();
    if (filters?.jobId) queryParams.append('jobId', filters.jobId);
    if (filters?.candidateId) queryParams.append('candidateId', filters.candidateId);
    if (filters?.interviewerId) queryParams.append('interviewerId', filters.interviewerId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/api/video-interviews${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<{ interviews: VideoInterview[] }>(endpoint);
  }

  /**
   * Get interviews for a specific job
   */
  async getJobInterviews(jobId: string) {
    return apiClient.get<{ interviews: VideoInterview[] }>(`/api/video-interviews/job/${jobId}`);
  }

  /**
   * Get a single interview by ID
   */
  async getInterview(id: string) {
    return apiClient.get<{ interview: VideoInterview }>(`/api/video-interviews/${id}`);
  }

  /**
   * Create a new video interview
   */
  async createInterview(data: CreateVideoInterviewRequest) {
    return apiClient.post<{ interview: VideoInterview; message: string }>(
      '/api/video-interviews',
      data
    );
  }

  /**
   * Update interview status
   */
  async updateStatus(id: string, status: VideoInterview['status']) {
    return apiClient.patch<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}/status`,
      { status }
    );
  }

  /**
   * Check progression status
   */
  async getProgressionStatus(id: string) {
    return apiClient.get<{
      canProgress: boolean;
      missingInterviewers: string[];
      submittedCount: number;
      totalCount: number;
      requiresAllInterviewers: boolean;
    }>(`/api/video-interviews/${id}/progression-status`);
  }

  /**
   * Add feedback to an interview
   */
  async addFeedback(id: string, feedback: {
    overallRating?: number;
    notes?: string;
    interviewerId?: string;
    interviewerName?: string;
    interviewerEmail?: string;
  }) {
    return apiClient.post<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}/feedback`,
      feedback
    );
  }

  /**
   * Update an existing interview
   */
  async updateInterview(id: string, data: Partial<CreateVideoInterviewRequest & { status?: VideoInterview['status'] }>) {
    return apiClient.put<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}`,
      data
    );
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(id: string) {
    return apiClient.put<{ interview: VideoInterview; message: string }>(
      `/api/video-interviews/${id}/cancel`,
      {}
    );
  }

  /**
   * Delete an interview
   */
  async deleteInterview(id: string) {
    return apiClient.delete<{ message: string }>(`/api/video-interviews/${id}`);
  }

  /**
   * Generate AI-suggested interview times
   */
  async generateAISuggestions(data: {
    jobId: string;
    candidateIds: string[];
    preferredDuration?: number;
    preferredTimeSlots?: string[];
    preferredDays?: string[];
    timezone?: string;
    startDate?: string;
    endDate?: string;
    avoidTimes?: string[];
  }) {
    return apiClient.post<{
      suggestions: Array<{
        candidateId: string;
        applicationId: string;
        suggestedDate: string;
        alternativeDates: string[];
        reasoning?: string;
        confidence?: number;
      }>;
      generatedAt: string;
      jobInfo: {
        title: string;
        location: string;
        urgency?: string;
      };
    }>('/api/video-interviews/auto-schedule', data);
  }

  /**
   * Finalize and save interviews from AI suggestions
   */
  async finalizeInterviews(suggestions: Array<{
    applicationId: string;
    candidateId: string;
    jobId: string;
    scheduledDate: string;
    duration?: number;
    type?: 'VIDEO' | 'PHONE' | 'IN_PERSON';
    interviewerIds?: string[];
    notes?: string;
  }>) {
    return apiClient.post<{
      interviews: VideoInterview[];
      count: number;
      message: string;
    }>('/api/video-interviews/finalize', { suggestions });
  }

  /**
   * Get calendar events for a job
   */
  async getJobCalendarEvents(jobId: string, startDate: string, endDate: string) {
    return apiClient.get<{
      events: Array<{
        id: string;
        title: string;
        start: string;
        end: string;
        meetingLink?: string;
        status: string;
        type: string;
        candidateId: string;
        candidateName: string;
        candidateEmail: string;
        applicationId: string;
        calendarEventId?: string;
      }>;
    }>(`/api/video-interviews/job/${jobId}/calendar?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const videoInterviewService = new VideoInterviewService();


