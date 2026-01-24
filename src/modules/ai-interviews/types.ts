export type InterviewStatus = 'scheduled' | 'ready' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type InterviewMode = 'video' | 'phone' | 'text';
export type QuestionSource = 'predefined' | 'ai-generated' | 'hybrid';
export type QuestionCategory = 'technical' | 'behavioral' | 'situational' | 'cultural' | 'experience';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  rationale?: string;
  expectedKeywords?: string[];
  followUpQuestions?: string[];
  order: number;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: 'ai' | 'candidate';
  content: string;
  duration?: number;
}

export interface InterviewAnalysis {
  overallScore: number;
  categoryScores: {
    technical: number;
    communication: number;
    culturalFit: number;
    experience: number;
    problemSolving: number;
  };
  strengths: string[];
  concerns: string[];
  redFlags: string[];
  keyHighlights: Array<{
    quote: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  recommendation: 'strongly-recommend' | 'recommend' | 'maybe' | 'not-recommend';
  confidenceScore: number;
  summary: string;
}

export interface AIInterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  applicationId?: string;
  jobId: string;
  jobTitle: string;
  status: InterviewStatus;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  interviewMode: InterviewMode;
  questionSource: QuestionSource;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  transcript: TranscriptEntry[];
  recordingUrl?: string;
  analysis?: InterviewAnalysis;
  reportId?: string;
  invitationToken: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InterviewInvitation {
  sessionId: string;
  token: string;
  candidateEmail: string;
  expiresAt: string;
  sent: boolean;
  sentAt?: string;
}
import type { InterviewAnalysis } from './aiInterview';

export type ReportStatus = 'draft' | 'in-review' | 'finalized';
export type PermissionLevel = 'view' | 'comment' | 'edit';

export interface InterviewReport {
  id: string;
  sessionId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  status: ReportStatus;
  version: number;
  executiveSummary: string;
  analysis: InterviewAnalysis;
  recommendations: string;
  nextSteps: string;
  isShared: boolean;
  sharedWith: string[];
  permissions: ReportPermission[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  finalizedAt?: string;
  finalizedBy?: string;
}

export interface ReportPermission {
  userId: string;
  userName: string;
  level: PermissionLevel;
  grantedAt: string;
  grantedBy: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  parentId?: string;
  replies: ReportComment[];
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
}

export interface ReportVersion {
  version: number;
  timestamp: string;
  userId: string;
  userName: string;
  changes: string;
  snapshot: Partial<InterviewReport>;
}

export interface ReportShare {
  id: string;
  reportId: string;
  shareToken: string;
  expiresAt?: string;
  isPublic: boolean;
  allowComments: boolean;
  createdBy: string;
  createdAt: string;
  viewCount: number;
}
export interface BiasDetection {
  detected: boolean;
  type?: 'gender' | 'age' | 'cultural' | 'appearance' | 'personal';
  severity: 'low' | 'medium' | 'high';
  excerpt: string;
  suggestion: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative' | 'mixed';
  score: number; // -1 to 1
  emotions: {
    confidence: number;
    enthusiasm: number;
    concern: number;
    objectivity: number;
  };
}

export interface SmartSuggestion {
  type: 'improvement' | 'strength' | 'clarification' | 'example';
  title: string;
  suggestion: string;
}

export interface AIFeedbackAnalysis {
  biasDetection: BiasDetection[];
  sentiment: SentimentAnalysis;
  suggestions: SmartSuggestion[];
  summary: string;
  keyPoints: string[];
  confidenceScore: number;
}
