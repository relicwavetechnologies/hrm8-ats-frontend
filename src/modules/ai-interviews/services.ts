import { getAIInterviewSessions } from './aiInterviewStorage';

export function getAIInterviewStats() {
  const sessions = getAIInterviewSessions();
  
  const completed = sessions.filter(s => s.status === 'completed').length;
  const total = sessions.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Mock average score calculation
  const avgScore = 78; // Mock value since overallScore doesn't exist in session type yet
  
  return {
    total,
    completed,
    inProgress: sessions.filter(s => s.status === 'in-progress').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completionRate,
    avgScore,
    avgDuration: 32 // Mock average duration in minutes
  };
}
import type { InterviewReport, ReportComment, ReportVersion, ReportShare } from '@/shared/types/aiInterviewReport';

const REPORTS_KEY = 'hrm8_ai_interview_reports';
const COMMENTS_KEY = 'hrm8_ai_interview_comments';
const VERSIONS_KEY = 'hrm8_ai_interview_versions';
const SHARES_KEY = 'hrm8_ai_interview_shares';

function initializeStorage(key: string) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify([]));
  }
}

// Reports
export function saveInterviewReport(report: InterviewReport): void {
  initializeStorage(REPORTS_KEY);
  const reports = getInterviewReports();
  const existingIndex = reports.findIndex(r => r.id === report.id);
  
  if (existingIndex >= 0) {
    reports[existingIndex] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    reports.push(report);
  }
  
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getInterviewReports(): InterviewReport[] {
  initializeStorage(REPORTS_KEY);
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getInterviewReportById(id: string): InterviewReport | undefined {
  return getInterviewReports().find(report => report.id === id);
}

export function getInterviewReportBySession(sessionId: string): InterviewReport | undefined {
  return getInterviewReports().find(report => report.sessionId === sessionId);
}

export function updateInterviewReport(id: string, updates: Partial<InterviewReport>): void {
  const reports = getInterviewReports();
  const index = reports.findIndex(r => r.id === id);
  
  if (index >= 0) {
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }
}

export function deleteInterviewReport(id: string): void {
  const reports = getInterviewReports();
  const filtered = reports.filter(r => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
}

// Comments
export function saveReportComment(comment: ReportComment): void {
  initializeStorage(COMMENTS_KEY);
  const comments = getReportComments();
  comments.push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getReportComments(): ReportComment[] {
  initializeStorage(COMMENTS_KEY);
  const data = localStorage.getItem(COMMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCommentsByReport(reportId: string): ReportComment[] {
  return getReportComments().filter(c => c.reportId === reportId && !c.parentId);
}

export function updateReportComment(id: string, content: string): void {
  const comments = getReportComments();
  const index = comments.findIndex(c => c.id === id);
  
  if (index >= 0) {
    comments[index] = {
      ...comments[index],
      content,
      updatedAt: new Date().toISOString(),
      isEdited: true
    };
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
}

export function deleteReportComment(id: string): void {
  const comments = getReportComments();
  const filtered = comments.filter(c => c.id !== id);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
}

// Versions
export function saveReportVersion(version: ReportVersion & { reportId: string }): void {
  initializeStorage(VERSIONS_KEY);
  const versions = getReportVersions();
  versions.push(version);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

export function getReportVersions(): Array<ReportVersion & { reportId: string }> {
  initializeStorage(VERSIONS_KEY);
  const data = localStorage.getItem(VERSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getVersionsByReport(reportId: string): ReportVersion[] {
  return getReportVersions().filter(v => v.reportId === reportId);
}

// Shares
export function saveReportShare(share: ReportShare): void {
  initializeStorage(SHARES_KEY);
  const shares = getReportShares();
  shares.push(share);
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
}

export function getReportShares(): ReportShare[] {
  initializeStorage(SHARES_KEY);
  const data = localStorage.getItem(SHARES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getShareByToken(token: string): ReportShare | undefined {
  return getReportShares().find(s => s.shareToken === token);
}

export function getSharesByReport(reportId: string): ReportShare[] {
  return getReportShares().filter(s => s.reportId === reportId);
}
import type { AIInterviewSession, InterviewStatus } from '@/shared/types/aiInterview';

const STORAGE_KEY = 'hrm8_ai_interviews';

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export function saveAIInterviewSession(session: AIInterviewSession): void {
  initializeStorage();
  const sessions = getAIInterviewSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getAIInterviewSessions(): AIInterviewSession[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAIInterviewById(id: string): AIInterviewSession | undefined {
  return getAIInterviewSessions().find(session => session.id === id);
}

export function getAIInterviewByToken(token: string): AIInterviewSession | undefined {
  return getAIInterviewSessions().find(session => session.invitationToken === token);
}

export function getAIInterviewsByCandidate(candidateId: string): AIInterviewSession[] {
  return getAIInterviewSessions().filter(session => session.candidateId === candidateId);
}

export function getAIInterviewsByJob(jobId: string): AIInterviewSession[] {
  return getAIInterviewSessions().filter(session => session.jobId === jobId);
}

export function getAIInterviewsByStatus(status: InterviewStatus): AIInterviewSession[] {
  return getAIInterviewSessions().filter(session => session.status === status);
}

export function updateAIInterviewSession(id: string, updates: Partial<AIInterviewSession>): void {
  const sessions = getAIInterviewSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index >= 0) {
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

export function deleteAIInterviewSession(id: string): void {
  const sessions = getAIInterviewSessions();
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getScheduledInterviews(): AIInterviewSession[] {
  return getAIInterviewsByStatus('scheduled');
}

export function getActiveInterviews(): AIInterviewSession[] {
  return getAIInterviewsByStatus('in-progress');
}

export function getCompletedInterviews(): AIInterviewSession[] {
  return getAIInterviewsByStatus('completed');
}
import { getAIInterviewSessions } from './aiInterviewStorage';

export function getAIInterviewStats() {
  const sessions = getAIInterviewSessions();
  
  const completed = sessions.filter(s => s.status === 'completed').length;
  const total = sessions.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Mock average score calculation
  const avgScore = 78; // Mock value since overallScore doesn't exist in session type yet
  
  return {
    total,
    completed,
    inProgress: sessions.filter(s => s.status === 'in-progress').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completionRate,
    avgScore,
    avgDuration: 32 // Mock average duration in minutes
  };
}
import { getAIInterviewSessions } from './aiInterviewStorage';
import { getInterviewReports, getReportComments } from './aiInterviewReportStorage';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate data integrity for AI Interview module
 */
export function validateAIInterviewData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sessions = getAIInterviewSessions();
  const reports = getInterviewReports();
  const comments = getReportComments();

  // Validate sessions
  sessions.forEach(session => {
    // Check required fields
    if (!session.id || !session.candidateId || !session.jobId) {
      errors.push(`Session ${session.id || 'unknown'} missing required fields`);
    }

    // Check date consistency
    if (session.startedAt && session.completedAt) {
      const started = new Date(session.startedAt).getTime();
      const completed = new Date(session.completedAt).getTime();
      if (completed < started) {
        errors.push(`Session ${session.id}: completedAt before startedAt`);
      }
    }

    // Check completed sessions have analysis
    if (session.status === 'completed' && !session.analysis) {
      warnings.push(`Completed session ${session.id} missing analysis`);
    }

    // Check report linkage
    if (session.reportId) {
      const report = reports.find(r => r.id === session.reportId);
      if (!report) {
        errors.push(`Session ${session.id} references non-existent report ${session.reportId}`);
      }
    }
  });

  // Validate reports
  reports.forEach(report => {
    // Check required fields
    if (!report.id || !report.sessionId || !report.candidateId) {
      errors.push(`Report ${report.id || 'unknown'} missing required fields`);
    }

    // Check session linkage
    const session = sessions.find(s => s.id === report.sessionId);
    if (!session) {
      errors.push(`Report ${report.id} references non-existent session ${report.sessionId}`);
    } else {
      // Verify data consistency between session and report
      if (session.candidateId !== report.candidateId) {
        errors.push(`Report ${report.id} candidateId mismatch with session`);
      }
      if (session.jobId !== report.jobId) {
        errors.push(`Report ${report.id} jobId mismatch with session`);
      }
    }

    // Check finalized reports have required data
    if (report.status === 'finalized') {
      if (!report.finalizedAt || !report.finalizedBy) {
        warnings.push(`Finalized report ${report.id} missing finalization metadata`);
      }
    }
  });

  // Validate comments
  comments.forEach(comment => {
    // Check required fields
    if (!comment.id || !comment.reportId || !comment.userId) {
      errors.push(`Comment ${comment.id || 'unknown'} missing required fields`);
    }

    // Check report linkage
    const report = reports.find(r => r.id === comment.reportId);
    if (!report) {
      errors.push(`Comment ${comment.id} references non-existent report ${comment.reportId}`);
    }

    // Check parent comment exists for replies
    if (comment.parentId) {
      const parentComment = comments.find(c => c.id === comment.parentId);
      if (!parentComment) {
        errors.push(`Comment ${comment.id} references non-existent parent ${comment.parentId}`);
      }
    }
  });

  // Check for orphaned reports
  const sessionsWithReports = new Set(reports.map(r => r.sessionId));
  const completedSessions = sessions.filter(s => s.status === 'completed');
  completedSessions.forEach(session => {
    if (!sessionsWithReports.has(session.id) && session.analysis) {
      warnings.push(`Completed session ${session.id} should have a report`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get validation summary as string
 */
export function getValidationSummary(): string {
  const result = validateAIInterviewData();
  
  let summary = `AI Interview Data Validation\n`;
  summary += `Status: ${result.isValid ? '✓ Valid' : '✗ Invalid'}\n\n`;
  
  if (result.errors.length > 0) {
    summary += `Errors (${result.errors.length}):\n`;
    result.errors.forEach(error => summary += `  • ${error}\n`);
    summary += '\n';
  }
  
  if (result.warnings.length > 0) {
    summary += `Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach(warning => summary += `  • ${warning}\n`);
  }
  
  if (result.isValid && result.warnings.length === 0) {
    summary += 'All data validated successfully!';
  }
  
  return summary;
}

/**
 * Check for orphaned records
 */
export function findOrphanedRecords() {
  const sessions = getAIInterviewSessions();
  const reports = getInterviewReports();
  const comments = getReportComments();

  const sessionIds = new Set(sessions.map(s => s.id));
  const reportIds = new Set(reports.map(r => r.id));

  return {
    orphanedReports: reports.filter(r => !sessionIds.has(r.sessionId)),
    orphanedComments: comments.filter(c => !reportIds.has(c.reportId)),
    sessionsWithoutReports: sessions.filter(s => 
      s.status === 'completed' && s.analysis && !s.reportId
    )
  };
}
/**
 * Development utilities for AI Interview module
 * Access these via browser console for testing/debugging
 */

import { getAIInterviewSessions } from './aiInterviewStorage';
import { getInterviewReports, getReportComments } from './aiInterviewReportStorage';
import { validateAIInterviewData, getValidationSummary, findOrphanedRecords } from './dataValidation';
import { reinitializeMockData, clearAllAIInterviewData } from './initializeMockData';

// Expose utilities to window for console access in development
if (import.meta.env.DEV) {
  (window as any).aiInterviewDebug = {
    // Data inspection
    getSessions: getAIInterviewSessions,
    getReports: getInterviewReports,
    getComments: getReportComments,
    
    // Validation
    validate: validateAIInterviewData,
    validateSummary: () => console.log(getValidationSummary()),
    findOrphaned: findOrphanedRecords,
    
    // Data management
    reinitialize: reinitializeMockData,
    clearAll: clearAllAIInterviewData,
    
    // Stats
    stats: () => {
      const sessions = getAIInterviewSessions();
      const reports = getInterviewReports();
      const comments = getReportComments();
      
      console.log('AI Interview Data Statistics:');
      console.log('============================');
      console.log(`Sessions: ${sessions.length}`);
      console.log(`  - Scheduled: ${sessions.filter(s => s.status === 'scheduled').length}`);
      console.log(`  - In Progress: ${sessions.filter(s => s.status === 'in-progress').length}`);
      console.log(`  - Completed: ${sessions.filter(s => s.status === 'completed').length}`);
      console.log(`  - Cancelled: ${sessions.filter(s => s.status === 'cancelled').length}`);
      console.log(`  - No Show: ${sessions.filter(s => s.status === 'no-show').length}`);
      console.log(`\nReports: ${reports.length}`);
      console.log(`  - Draft: ${reports.filter(r => r.status === 'draft').length}`);
      console.log(`  - In Review: ${reports.filter(r => r.status === 'in-review').length}`);
      console.log(`  - Finalized: ${reports.filter(r => r.status === 'finalized').length}`);
      console.log(`\nComments: ${comments.length}`);
      
      const orphaned = findOrphanedRecords();
      if (orphaned.orphanedReports.length > 0 || orphaned.orphanedComments.length > 0) {
        console.log('\n⚠️  Orphaned Records Detected:');
        if (orphaned.orphanedReports.length > 0) {
          console.log(`  - Orphaned Reports: ${orphaned.orphanedReports.length}`);
        }
        if (orphaned.orphanedComments.length > 0) {
          console.log(`  - Orphaned Comments: ${orphaned.orphanedComments.length}`);
        }
      }
    },
    
    // Help
    help: () => {
      console.log('AI Interview Debug Utilities:');
      console.log('============================');
      console.log('aiInterviewDebug.getSessions()    - Get all interview sessions');
      console.log('aiInterviewDebug.getReports()     - Get all reports');
      console.log('aiInterviewDebug.getComments()    - Get all comments');
      console.log('aiInterviewDebug.validate()       - Validate data integrity');
      console.log('aiInterviewDebug.validateSummary()- Print validation summary');
      console.log('aiInterviewDebug.findOrphaned()   - Find orphaned records');
      console.log('aiInterviewDebug.stats()          - Print data statistics');
      console.log('aiInterviewDebug.reinitialize()   - Reset and regenerate all data');
      console.log('aiInterviewDebug.clearAll()       - Clear all AI interview data');
      console.log('aiInterviewDebug.help()           - Show this help message');
    }
  };

  console.log('🔧 AI Interview debug utilities loaded. Type aiInterviewDebug.help() for commands.');
}
import { v4 as uuidv4 } from 'uuid';
import type { AIInterviewSession, InterviewStatus, InterviewMode, QuestionSource } from '@/shared/types/aiInterview';
import type { InterviewReport, ReportComment, ReportVersion } from '@/shared/types/aiInterviewReport';
import { getCandidates } from '@/shared/lib/mockCandidateStorage';
import { getJobs } from '@/shared/lib/mockJobStorage';
import { 
  saveAIInterviewSession, 
  getAIInterviewSessions,
  updateAIInterviewSession 
} from './aiInterviewStorage';
import {
  saveInterviewReport,
  getInterviewReports,
  saveReportComment,
  saveReportVersion
} from './aiInterviewReportStorage';
import { generateQuestionsForJob } from './questionGenerator';
import { calculateInterviewScore } from './scoreCalculator';
import { generateReportFromSession } from './reportGenerator';

const INIT_VERSION_KEY = 'hrm8_ai_interview_init_version';
const CURRENT_INIT_VERSION = '1.0.0';

/**
 * Check if mock data has been initialized
 */
export function isDataInitialized(): boolean {
  const version = localStorage.getItem(INIT_VERSION_KEY);
  return version === CURRENT_INIT_VERSION;
}

/**
 * Mark data as initialized
 */
function markAsInitialized(): void {
  localStorage.setItem(INIT_VERSION_KEY, CURRENT_INIT_VERSION);
}

/**
 * Clear all AI interview data
 */
export function clearAllAIInterviewData(): void {
  localStorage.removeItem('hrm8_ai_interviews');
  localStorage.removeItem('hrm8_ai_interview_reports');
  localStorage.removeItem('hrm8_ai_interview_comments');
  localStorage.removeItem('hrm8_ai_interview_versions');
  localStorage.removeItem('hrm8_ai_interview_shares');
  localStorage.removeItem(INIT_VERSION_KEY);
}

/**
 * Reinitialize all mock data from scratch
 */
export function reinitializeMockData(): void {
  clearAllAIInterviewData();
  initializeAIInterviewMockData();
}

/**
 * Generate varied transcript based on interview performance
 */
function generateTranscript(score: number): any[] {
  const baseTranscripts = [
    {
      speaker: 'ai' as const,
      content: 'Hello! Thank you for joining this AI interview. Are you ready to begin?',
      duration: 5
    },
    {
      speaker: 'candidate' as const,
      content: 'Yes, I\'m ready. Thank you for the opportunity.',
      duration: 3
    }
  ];

  if (score >= 80) {
    baseTranscripts.push(
      {
        speaker: 'ai' as const,
        content: 'Can you describe a complex technical problem you solved recently?',
        duration: 4
      },
      {
        speaker: 'candidate' as const,
        content: 'In my last project, we had performance issues with our API taking 3-4 seconds. I analyzed database queries, implemented batching and caching, reducing response time to under 500ms. The solution improved user experience significantly.',
        duration: 15
      },
      {
        speaker: 'ai' as const,
        content: 'Excellent approach! What metrics did you use to measure success?',
        duration: 3
      },
      {
        speaker: 'candidate' as const,
        content: 'We tracked response times, throughput, and user satisfaction scores. All metrics improved by over 80%.',
        duration: 8
      }
    );
  } else if (score >= 60) {
    baseTranscripts.push(
      {
        speaker: 'ai' as const,
        content: 'Tell me about a challenging project you worked on.',
        duration: 4
      },
      {
        speaker: 'candidate' as const,
        content: 'I worked on a project to improve our system, and we made some changes that helped.',
        duration: 6
      },
      {
        speaker: 'ai' as const,
        content: 'Can you be more specific about the changes?',
        duration: 3
      },
      {
        speaker: 'candidate' as const,
        content: 'We updated the code and fixed some bugs.',
        duration: 4
      }
    );
  } else {
    baseTranscripts.push(
      {
        speaker: 'ai' as const,
        content: 'What programming languages are you comfortable with?',
        duration: 4
      },
      {
        speaker: 'candidate' as const,
        content: 'Um, I know some JavaScript.',
        duration: 3
      },
      {
        speaker: 'ai' as const,
        content: 'Can you describe a project where you used JavaScript?',
        duration: 3
      },
      {
        speaker: 'candidate' as const,
        content: 'I made a simple website once.',
        duration: 2
      }
    );
  }

  return baseTranscripts.map((entry, index) => ({
    id: `transcript-${index}`,
    timestamp: new Date(Date.now() - (baseTranscripts.length - index) * 60000).toISOString(),
    ...entry
  }));
}

/**
 * Generate analysis based on score
 */
function generateAnalysis(score: number) {
  const variance = 5;
  const technical = score + Math.floor(Math.random() * variance - variance / 2);
  const communication = score + Math.floor(Math.random() * variance - variance / 2);
  const culturalFit = score + Math.floor(Math.random() * variance - variance / 2);
  const experience = score + Math.floor(Math.random() * variance - variance / 2);
  const problemSolving = score + Math.floor(Math.random() * variance - variance / 2);

  let recommendation: 'strongly-recommend' | 'recommend' | 'maybe' | 'not-recommend';
  if (score >= 85) recommendation = 'strongly-recommend';
  else if (score >= 70) recommendation = 'recommend';
  else if (score >= 55) recommendation = 'maybe';
  else recommendation = 'not-recommend';

  const strengths = score >= 70 
    ? ['Strong technical skills', 'Excellent communication', 'Good problem-solving approach', 'Relevant experience']
    : score >= 55
    ? ['Shows potential', 'Basic understanding of concepts', 'Willing to learn']
    : ['Enthusiasm for the role'];

  const concerns = score >= 70
    ? ['Could provide more leadership examples', 'Limited experience with distributed systems']
    : score >= 55
    ? ['Needs more hands-on experience', 'Communication could be more detailed', 'Technical depth could improve']
    : ['Lacks required technical experience', 'Unclear communication', 'Insufficient problem-solving examples'];

  const redFlags = score < 50
    ? ['Insufficient technical knowledge for role', 'Unable to provide concrete examples']
    : score < 65
    ? ['Limited practical experience']
    : [];

  return {
    overallScore: score,
    categoryScores: {
      technical: Math.max(0, Math.min(100, technical)),
      communication: Math.max(0, Math.min(100, communication)),
      culturalFit: Math.max(0, Math.min(100, culturalFit)),
      experience: Math.max(0, Math.min(100, experience)),
      problemSolving: Math.max(0, Math.min(100, problemSolving))
    },
    strengths,
    concerns,
    redFlags,
    keyHighlights: score >= 70 ? [
      {
        quote: 'Demonstrated strong technical problem-solving abilities',
        context: 'Technical assessment',
        sentiment: 'positive' as const
      }
    ] : [],
    recommendation,
    confidenceScore: score >= 70 ? 85 : score >= 55 ? 70 : 55,
    summary: score >= 80
      ? 'Excellent candidate with strong technical skills and clear communication. Highly recommended for next round.'
      : score >= 70
      ? 'Solid candidate with good technical foundation. Recommend proceeding to next stage.'
      : score >= 55
      ? 'Candidate shows potential but needs more experience. Consider for junior positions or with additional training.'
      : 'Candidate does not meet the requirements for this position at this time.'
  };
}

/**
 * Generate comprehensive mock interview sessions
 */
function generateMockSessions(): AIInterviewSession[] {
  const candidates = getCandidates();
  const jobs = getJobs();
  
  if (candidates.length === 0 || jobs.length === 0) {
    console.warn('No candidates or jobs found. Using fallback data.');
    return generateFallbackSessions();
  }

  const sessions: AIInterviewSession[] = [];
  const statuses: InterviewStatus[] = ['scheduled', 'ready', 'in-progress', 'completed', 'completed', 'completed', 'completed', 'cancelled', 'no-show'];
  const modes: InterviewMode[] = ['video', 'video', 'phone', 'text'];
  const sources: QuestionSource[] = ['hybrid', 'hybrid', 'ai-generated', 'predefined'];
  const scores = [92, 88, 85, 78, 72, 68, 58, 45];

  // Create 15 sessions with variety
  for (let i = 0; i < Math.min(15, candidates.length); i++) {
    const candidate = candidates[i % candidates.length];
    const job = jobs[i % jobs.length];
    const status = statuses[i % statuses.length];
    const mode = modes[i % modes.length];
    const source = sources[i % sources.length];
    const score = scores[i % scores.length];

    const daysAgo = i < 5 ? i : i < 10 ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 60) + 30;
    const scheduledDate = new Date(Date.now() - daysAgo * 86400000);
    
    const questions = generateQuestionsForJob(job.title, 8);
    
    const session: AIInterviewSession = {
      id: `ai-int-${uuidv4()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      applicationId: `app-${i}`,
      jobId: job.id,
      jobTitle: job.title,
      status,
      scheduledDate: scheduledDate.toISOString(),
      interviewMode: mode,
      questionSource: source,
      questions,
      currentQuestionIndex: 0,
      transcript: [],
      invitationToken: uuidv4(),
      createdAt: new Date(scheduledDate.getTime() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    // Add details for non-scheduled sessions
    if (status !== 'scheduled' && status !== 'ready') {
      const startedAt = new Date(scheduledDate.getTime() + 3600000);
      session.startedAt = startedAt.toISOString();
      session.currentQuestionIndex = status === 'completed' ? questions.length : Math.floor(questions.length / 2);
      
      if (status === 'completed') {
        const completedAt = new Date(startedAt.getTime() + 3600000);
        session.completedAt = completedAt.toISOString();
        session.duration = 3600;
        session.transcript = generateTranscript(score);
        session.analysis = generateAnalysis(score);
      } else if (status === 'in-progress') {
        session.transcript = generateTranscript(score).slice(0, 3);
      }
    }

    sessions.push(session);
  }

  return sessions;
}

/**
 * Fallback sessions when no candidates/jobs exist
 */
function generateFallbackSessions(): AIInterviewSession[] {
  const mockCandidates = [
    { id: 'cand-1', name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    { id: 'cand-2', name: 'Michael Chen', email: 'michael.c@email.com' },
    { id: 'cand-3', name: 'Emily Rodriguez', email: 'emily.r@email.com' }
  ];
  
  const mockJobs = [
    { id: 'job-1', title: 'Senior Software Engineer' },
    { id: 'job-2', title: 'Product Manager' },
    { id: 'job-3', title: 'UX Designer' }
  ];

  return mockCandidates.map((candidate, i) => {
    const job = mockJobs[i];
    return {
      id: `ai-int-${uuidv4()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobId: job.id,
      jobTitle: job.title,
      status: 'completed' as InterviewStatus,
      scheduledDate: new Date(Date.now() - i * 86400000).toISOString(),
      startedAt: new Date(Date.now() - i * 86400000 + 3600000).toISOString(),
      completedAt: new Date(Date.now() - i * 86400000 + 7200000).toISOString(),
      duration: 3600,
      interviewMode: 'video' as InterviewMode,
      questionSource: 'hybrid' as QuestionSource,
      questions: generateQuestionsForJob(job.title, 8),
      currentQuestionIndex: 8,
      transcript: generateTranscript(85),
      analysis: generateAnalysis(85),
      invitationToken: uuidv4(),
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };
  });
}

/**
 * Generate mock comments for a report
 */
function generateCommentsForReport(reportId: string): ReportComment[] {
  const comments: ReportComment[] = [];
  const commentTemplates = [
    { userName: 'John Smith', content: 'Great candidate! Strong technical skills and communication.' },
    { userName: 'Lisa Anderson', content: 'I agree. The problem-solving approach was impressive.' },
    { userName: 'Mike Johnson', content: 'Should we schedule a technical deep-dive?' },
    { userName: 'Sarah Wilson', content: 'Let\'s move forward with the next round.' },
    { userName: 'David Brown', content: 'One concern: limited distributed systems experience.' }
  ];

  const numComments = Math.floor(Math.random() * 3) + 2; // 2-4 comments

  for (let i = 0; i < numComments; i++) {
    const template = commentTemplates[i % commentTemplates.length];
    comments.push({
      id: uuidv4(),
      reportId,
      userId: `user-${i}`,
      userName: template.userName,
      content: template.content,
      mentions: [],
      replies: [],
      createdAt: new Date(Date.now() - (numComments - i) * 3600000).toISOString(),
      isEdited: false
    });
  }

  return comments;
}

/**
 * Generate report version history
 */
function generateReportVersion(reportId: string, version: number): ReportVersion & { reportId: string } {
  return {
    reportId,
    version,
    timestamp: new Date(Date.now() - (3 - version) * 86400000).toISOString(),
    userId: 'admin',
    userName: 'System Admin',
    changes: version === 1 ? 'Initial report created' : `Updated executive summary and recommendations (v${version})`,
    snapshot: {}
  };
}

/**
 * Main initialization function
 */
export function initializeAIInterviewMockData(): void {
  // Check if already initialized
  if (isDataInitialized()) {
    console.log('AI Interview mock data already initialized');
    return;
  }

  console.log('Initializing AI Interview mock data...');

  // Generate and save sessions
  const sessions = generateMockSessions();
  sessions.forEach(session => saveAIInterviewSession(session));
  console.log(`Generated ${sessions.length} interview sessions`);

  // Generate reports for completed sessions
  let reportCount = 0;
  let commentCount = 0;
  
  sessions.forEach(session => {
    if (session.status === 'completed' && session.analysis) {
      const report = generateReportFromSession(session);
      
      // Some reports are finalized
      if (Math.random() > 0.5) {
        report.status = 'finalized';
        report.finalizedAt = new Date().toISOString();
        report.finalizedBy = 'admin';
      } else if (Math.random() > 0.5) {
        report.status = 'in-review';
      }
      
      saveInterviewReport(report);
      reportCount++;

      // Update session with report ID
      updateAIInterviewSession(session.id, { reportId: report.id });

      // Generate comments for finalized reports
      if (report.status === 'finalized') {
        const comments = generateCommentsForReport(report.id);
        comments.forEach(comment => saveReportComment(comment));
        commentCount += comments.length;
      }

      // Generate version history for some reports
      if (Math.random() > 0.6) {
        saveReportVersion(generateReportVersion(report.id, 2));
        if (Math.random() > 0.7) {
          saveReportVersion(generateReportVersion(report.id, 3));
        }
      }
    }
  });

  console.log(`Generated ${reportCount} reports with ${commentCount} comments`);
  
  markAsInitialized();
  console.log('AI Interview mock data initialization complete');
}
import type { AIInterviewSession, TranscriptEntry } from '@/shared/types/aiInterview';
import type { InterviewReport, ReportComment } from '@/shared/types/aiInterviewReport';
import { generateQuestionsForJob } from './questionGenerator';

export function generateMockTranscript(): TranscriptEntry[] {
  return [
    {
      id: '1',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      speaker: 'ai',
      content: 'Hello! Thank you for joining this AI interview. I\'m excited to learn more about you. Are you ready to begin?',
      duration: 5
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 590000).toISOString(),
      speaker: 'candidate',
      content: 'Yes, I\'m ready. Thank you for having me.',
      duration: 3
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 580000).toISOString(),
      speaker: 'ai',
      content: 'Great! Let\'s start with your background. Can you walk me through a complex technical problem you solved recently?',
      duration: 4
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 570000).toISOString(),
      speaker: 'candidate',
      content: 'Sure. In my last project, we had a performance issue where our API was taking 3-4 seconds to respond. I analyzed the database queries and found we were making multiple redundant calls. I implemented query batching and caching, which reduced response time to under 500ms.',
      duration: 15
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 550000).toISOString(),
      speaker: 'ai',
      content: 'That\'s impressive! What alternative approaches did you consider?',
      duration: 3
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 545000).toISOString(),
      speaker: 'candidate',
      content: 'We considered horizontal scaling and switching to a different database, but those were more expensive solutions. The query optimization gave us the best ROI.',
      duration: 8
    }
  ];
}

// Note: This function is kept for backwards compatibility
// The main initialization now happens in initializeMockData.ts
export function generateMockSessions(): AIInterviewSession[] {
  // Return just 3 basic sessions for initial testing
  // Full initialization is handled by initializeAIInterviewMockData()
  return [
    {
      id: 'ai-int-1',
      candidateId: 'cand-1',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.j@email.com',
      applicationId: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Senior Software Engineer',
      status: 'completed',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      startedAt: new Date(Date.now() - 82800000).toISOString(),
      completedAt: new Date(Date.now() - 79200000).toISOString(),
      duration: 3600,
      interviewMode: 'video',
      questionSource: 'hybrid',
      questions: generateQuestionsForJob('Senior Software Engineer', 10),
      currentQuestionIndex: 10,
      transcript: generateMockTranscript(),
      analysis: {
        overallScore: 85,
        categoryScores: {
          technical: 88,
          communication: 90,
          culturalFit: 82,
          experience: 85,
          problemSolving: 87
        },
        strengths: [
          'Strong technical problem-solving skills',
          'Excellent communication and articulation',
          'Proven experience with performance optimization',
          'Good understanding of cost-benefit analysis'
        ],
        concerns: [
          'Limited experience with distributed systems',
          'Could elaborate more on leadership examples'
        ],
        redFlags: [],
        keyHighlights: [
          {
            quote: 'I implemented query batching and caching, which reduced response time to under 500ms',
            context: 'Discussing technical problem-solving',
            sentiment: 'positive'
          }
        ],
        recommendation: 'recommend',
        confidenceScore: 88,
        summary: 'Strong candidate with excellent technical skills and communication abilities. Demonstrated practical problem-solving experience with measurable results.'
      },
      invitationToken: 'token-1',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    },
    {
      id: 'ai-int-2',
      candidateId: 'cand-2',
      candidateName: 'Michael Chen',
      candidateEmail: 'michael.c@email.com',
      jobId: 'job-2',
      jobTitle: 'Product Manager',
      status: 'scheduled',
      scheduledDate: new Date(Date.now() + 172800000).toISOString(),
      interviewMode: 'video',
      questionSource: 'ai-generated',
      questions: generateQuestionsForJob('Product Manager', 8),
      currentQuestionIndex: 0,
      transcript: [],
      invitationToken: 'token-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    },
    {
      id: 'ai-int-3',
      candidateId: 'cand-3',
      candidateName: 'Emily Rodriguez',
      candidateEmail: 'emily.r@email.com',
      jobId: 'job-3',
      jobTitle: 'UX Designer',
      status: 'in-progress',
      scheduledDate: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      interviewMode: 'phone',
      questionSource: 'predefined',
      questions: generateQuestionsForJob('UX Designer', 8),
      currentQuestionIndex: 4,
      transcript: generateMockTranscript().slice(0, 4),
      invitationToken: 'token-3',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    }
  ];
}
import type { InterviewQuestion, QuestionCategory } from '@/shared/types/aiInterview';

const PREDEFINED_QUESTIONS: Record<QuestionCategory, InterviewQuestion[]> = {
  technical: [
    {
      id: 'tech-1',
      question: 'Can you walk me through a complex technical problem you solved recently?',
      category: 'technical',
      rationale: 'Assesses problem-solving and technical depth',
      expectedKeywords: ['problem', 'solution', 'approach', 'result'],
      followUpQuestions: ['What alternative approaches did you consider?', 'How did you measure success?'],
      order: 1
    },
    {
      id: 'tech-2',
      question: 'How do you stay current with new technologies and industry trends?',
      category: 'technical',
      rationale: 'Evaluates continuous learning and growth mindset',
      expectedKeywords: ['learning', 'courses', 'community', 'practice'],
      followUpQuestions: ['What technology are you most excited about learning next?'],
      order: 2
    },
    {
      id: 'tech-3',
      question: 'Describe a time when you had to debug a particularly difficult issue.',
      category: 'technical',
      rationale: 'Tests debugging skills and persistence',
      expectedKeywords: ['debugging', 'tools', 'investigation', 'resolved'],
      followUpQuestions: ['What debugging strategies do you typically use?'],
      order: 3
    }
  ],
  behavioral: [
    {
      id: 'behav-1',
      question: 'Tell me about a time when you had to work with a difficult team member.',
      category: 'behavioral',
      rationale: 'Evaluates interpersonal skills and conflict resolution',
      expectedKeywords: ['communication', 'resolution', 'outcome', 'learned'],
      followUpQuestions: ['How would you handle it differently now?'],
      order: 1
    },
    {
      id: 'behav-2',
      question: 'Describe a situation where you had to meet a tight deadline.',
      category: 'behavioral',
      rationale: 'Assesses time management and stress handling',
      expectedKeywords: ['prioritize', 'manage', 'deliver', 'pressure'],
      followUpQuestions: ['What strategies do you use to manage competing priorities?'],
      order: 2
    },
    {
      id: 'behav-3',
      question: 'Can you give an example of when you showed leadership?',
      category: 'behavioral',
      rationale: 'Evaluates leadership potential and initiative',
      expectedKeywords: ['led', 'initiative', 'motivated', 'result'],
      followUpQuestions: ['What leadership style resonates most with you?'],
      order: 3
    }
  ],
  situational: [
    {
      id: 'sit-1',
      question: 'How would you handle disagreeing with a decision made by senior leadership?',
      category: 'situational',
      rationale: 'Tests judgment and professional communication',
      expectedKeywords: ['approach', 'communicate', 'respect', 'perspective'],
      followUpQuestions: ['Have you been in this situation before?'],
      order: 1
    },
    {
      id: 'sit-2',
      question: 'What would you do if you discovered a critical bug right before a major release?',
      category: 'situational',
      rationale: 'Evaluates decision-making under pressure',
      expectedKeywords: ['assess', 'communicate', 'decision', 'stakeholders'],
      followUpQuestions: ['How do you balance quality with timelines?'],
      order: 2
    }
  ],
  cultural: [
    {
      id: 'cult-1',
      question: 'What kind of work environment helps you do your best work?',
      category: 'cultural',
      rationale: 'Assesses cultural fit and work preferences',
      expectedKeywords: ['environment', 'collaborate', 'autonomy', 'support'],
      followUpQuestions: ['How do you handle remote vs office work?'],
      order: 1
    },
    {
      id: 'cult-2',
      question: 'How do you define success in your role?',
      category: 'cultural',
      rationale: 'Evaluates values alignment and motivation',
      expectedKeywords: ['success', 'impact', 'goals', 'measure'],
      followUpQuestions: ['What motivates you most in your work?'],
      order: 2
    }
  ],
  experience: [
    {
      id: 'exp-1',
      question: 'What was your biggest professional achievement in the last year?',
      category: 'experience',
      rationale: 'Identifies accomplishments and impact',
      expectedKeywords: ['achievement', 'impact', 'result', 'proud'],
      followUpQuestions: ['What made this particularly meaningful to you?'],
      order: 1
    },
    {
      id: 'exp-2',
      question: 'Tell me about a project that didn\'t go as planned.',
      category: 'experience',
      rationale: 'Assesses learning from failure and resilience',
      expectedKeywords: ['challenge', 'learned', 'adapt', 'improve'],
      followUpQuestions: ['How did this experience change your approach?'],
      order: 2
    }
  ]
};

export function getPredefinedQuestions(category?: QuestionCategory): InterviewQuestion[] {
  if (category) {
    return PREDEFINED_QUESTIONS[category] || [];
  }
  return Object.values(PREDEFINED_QUESTIONS).flat();
}

export function generateQuestionsForJob(jobTitle: string, count: number = 10): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  const categories: QuestionCategory[] = ['technical', 'behavioral', 'cultural', 'experience'];
  
  categories.forEach((category, idx) => {
    const categoryQuestions = PREDEFINED_QUESTIONS[category];
    const questionsToAdd = Math.ceil(count / categories.length);
    
    categoryQuestions.slice(0, questionsToAdd).forEach((q, qIdx) => {
      questions.push({
        ...q,
        id: `${category}-${idx}-${qIdx}`,
        order: questions.length + 1
      });
    });
  });
  
  return questions.slice(0, count);
}

export function generateQuestionsForCandidate(
  candidateName: string,
  jobTitle: string,
  count: number = 10
): InterviewQuestion[] {
  return generateQuestionsForJob(jobTitle, count);
}

export function generateHybridQuestions(jobTitle: string, count: number = 10): InterviewQuestion[] {
  const predefined = getPredefinedQuestions().slice(0, Math.ceil(count / 2));
  const aiGenerated = generateQuestionsForJob(jobTitle, Math.floor(count / 2));
  
  return [...predefined, ...aiGenerated].slice(0, count);
}
import type { AIInterviewSession } from '@/shared/types/aiInterview';
import type { InterviewReport } from '@/shared/types/aiInterviewReport';
import { v4 as uuidv4 } from 'uuid';

export function generateReportFromSession(session: AIInterviewSession): InterviewReport {
  if (!session.analysis) {
    throw new Error('Interview session must have analysis before generating report');
  }

  return {
    id: uuidv4(),
    sessionId: session.id,
    candidateId: session.candidateId,
    candidateName: session.candidateName,
    jobId: session.jobId,
    jobTitle: session.jobTitle,
    status: 'draft',
    version: 1,
    executiveSummary: session.analysis.summary,
    analysis: session.analysis,
    recommendations: generateRecommendations(session.analysis),
    nextSteps: generateNextSteps(session.analysis),
    isShared: false,
    sharedWith: [],
    permissions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: session.createdBy
  };
}

function generateRecommendations(analysis: AIInterviewSession['analysis']): string {
  if (!analysis) return '';
  
  const recommendations: string[] = [];
  
  if (analysis.recommendation === 'strongly-recommend') {
    recommendations.push('**Strong recommendation to proceed immediately.** This candidate demonstrates exceptional qualifications.');
  } else if (analysis.recommendation === 'recommend') {
    recommendations.push('**Recommend moving forward** with next interview stages.');
  } else if (analysis.recommendation === 'maybe') {
    recommendations.push('**Consider for alternative positions** or additional screening.');
  } else {
    recommendations.push('**Not recommended** for this position at this time.');
  }
  
  if (analysis.overallScore >= 80) {
    recommendations.push('Candidate scored in the top tier across multiple categories.');
  }
  
  if (analysis.concerns.length > 0) {
    recommendations.push(`\n**Areas to explore in next rounds:**\n${analysis.concerns.map(c => `- ${c}`).join('\n')}`);
  }
  
  if (analysis.redFlags.length > 0) {
    recommendations.push(`\n**⚠️ Red Flags to Address:**\n${analysis.redFlags.map(f => `- ${f}`).join('\n')}`);
  }
  
  return recommendations.join('\n\n');
}

function generateNextSteps(analysis: AIInterviewSession['analysis']): string {
  if (!analysis) return '';
  
  const steps: string[] = [];
  
  if (analysis.recommendation === 'strongly-recommend' || analysis.recommendation === 'recommend') {
    steps.push('1. Schedule technical panel interview with senior team members');
    steps.push('2. Conduct system design assessment');
    steps.push('3. Arrange team fit conversation with potential colleagues');
    steps.push('4. Complete reference checks');
  } else if (analysis.recommendation === 'maybe') {
    steps.push('1. Consider alternative roles that match skill set');
    steps.push('2. Schedule follow-up discussion to address concerns');
    steps.push('3. Request additional work samples or portfolio');
  } else {
    steps.push('1. Send professional rejection notice');
    steps.push('2. Keep in talent pipeline for future opportunities');
  }
  
  return steps.join('\n');
}
import type { InterviewAnalysis, TranscriptEntry } from '@/shared/types/aiInterview';

export function calculateInterviewScore(transcript: TranscriptEntry[]): InterviewAnalysis {
  // Mock AI scoring - in production, this would call an actual AI service
  
  const technicalScore = Math.floor(Math.random() * 30) + 70;
  const communicationScore = Math.floor(Math.random() * 30) + 70;
  const culturalFitScore = Math.floor(Math.random() * 30) + 70;
  const experienceScore = Math.floor(Math.random() * 30) + 70;
  const problemSolvingScore = Math.floor(Math.random() * 30) + 70;
  
  const overallScore = Math.round(
    (technicalScore + communicationScore + culturalFitScore + experienceScore + problemSolvingScore) / 5
  );
  
  const strengths = generateStrengths(overallScore);
  const concerns = generateConcerns(overallScore);
  const redFlags = overallScore < 60 ? ['Concerns about overall qualification level'] : [];
  
  return {
    overallScore,
    categoryScores: {
      technical: technicalScore,
      communication: communicationScore,
      culturalFit: culturalFitScore,
      experience: experienceScore,
      problemSolving: problemSolvingScore
    },
    strengths,
    concerns,
    redFlags,
    keyHighlights: extractKeyHighlights(transcript),
    recommendation: getRecommendation(overallScore),
    confidenceScore: Math.floor(Math.random() * 20) + 80,
    summary: generateSummary(overallScore, strengths, concerns)
  };
}

function generateStrengths(score: number): string[] {
  const allStrengths = [
    'Strong technical problem-solving abilities',
    'Excellent communication and articulation',
    'Proven track record of delivering results',
    'Good understanding of best practices',
    'Demonstrates continuous learning mindset',
    'Collaborative team player',
    'Adaptable to changing requirements'
  ];
  
  const count = score >= 85 ? 5 : score >= 70 ? 4 : 3;
  return allStrengths.slice(0, count);
}

function generateConcerns(score: number): string[] {
  if (score >= 85) return [];
  if (score >= 70) {
    return ['Could provide more specific examples in some areas'];
  }
  return [
    'Limited depth in technical responses',
    'Could improve communication clarity',
    'Needs more experience in key areas'
  ];
}

function extractKeyHighlights(transcript: TranscriptEntry[]) {
  const candidateResponses = transcript.filter(t => t.speaker === 'candidate');
  
  return candidateResponses.slice(0, 3).map(response => ({
    quote: response.content.substring(0, 100) + (response.content.length > 100 ? '...' : ''),
    context: 'Interview response',
    sentiment: 'positive' as const
  }));
}

function getRecommendation(score: number): InterviewAnalysis['recommendation'] {
  if (score >= 85) return 'strongly-recommend';
  if (score >= 70) return 'recommend';
  if (score >= 60) return 'maybe';
  return 'not-recommend';
}

function generateSummary(score: number, strengths: string[], concerns: string[]): string {
  let summary = '';
  
  if (score >= 85) {
    summary = 'Exceptional candidate who demonstrates strong qualifications across all key areas. ';
  } else if (score >= 70) {
    summary = 'Solid candidate with good qualifications and relevant experience. ';
  } else if (score >= 60) {
    summary = 'Candidate shows potential but has some areas that need development. ';
  } else {
    summary = 'Candidate may not be the best fit for this position at this time. ';
  }
  
  summary += `Key strengths include ${strengths[0]?.toLowerCase() || 'various capabilities'}.`;
  
  if (concerns.length > 0) {
    summary += ` Areas for potential growth: ${concerns[0]?.toLowerCase()}.`;
  }
  
  return summary;
}
