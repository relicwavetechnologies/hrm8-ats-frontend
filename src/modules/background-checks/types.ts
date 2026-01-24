export type BackgroundCheckType = 
  | 'criminal' 
  | 'employment' 
  | 'education' 
  | 'credit' 
  | 'drug-screen' 
  | 'reference' 
  | 'identity' 
  | 'professional-license';

export interface BackgroundCheckTypeConfig {
  type: BackgroundCheckType;
  required: boolean;
}

export interface BackgroundCheckResult {
  checkType: BackgroundCheckType;
  status: 'clear' | 'review-required' | 'not-clear' | 'pending';
  details?: string;
  documents?: { name: string; url: string }[];
  completedDate?: string;
}

export interface BackgroundCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  applicationId?: string;
  offerLetterId?: string;
  jobId?: string;
  jobTitle?: string;
  employerId?: string;
  employerName?: string;
  employerLogo?: string;
  provider: 'checkr' | 'sterling' | 'hireright' | 'manual';
  checkTypes: BackgroundCheckTypeConfig[];
  status: 'not-started' | 'pending-consent' | 'in-progress' | 'completed' | 'issues-found' | 'cancelled';
  initiatedBy: string;
  initiatedByName: string;
  initiatedDate: string;
  completedDate?: string;
  consentGiven: boolean;
  consentDate?: string;
  consentRequestId?: string;
  results: BackgroundCheckResult[];
  overallStatus?: 'clear' | 'conditional' | 'not-clear';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewNotes?: string;
  expiryDate?: string;
  reportUrl?: string;
  cost?: number;
  totalCost?: number;
  costBreakdown?: Array<{ checkType: BackgroundCheckType; cost: number }>;
  referees?: string[];
  questionnaireTemplateId?: string;
  billedTo?: string;
  billedToName?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  country?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}
import type { AITranscriptionSummary, EditableReport } from './aiReferenceReport';

export type InterviewMode = 'video' | 'phone' | 'questionnaire';
export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
export type QuestionSource = 'pre-written' | 'ai-derived' | 'template' | 'dynamic';

export interface AIReferenceCheckSession {
  id: string;
  refereeId: string;
  candidateId: string;
  backgroundCheckId: string;
  mode: InterviewMode;
  status: SessionStatus;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // in seconds
  questionSource: QuestionSource;
  templateId?: string;
  aiPrompt?: string;
  transcript?: InterviewTranscript;
  recording?: SessionRecording;
  analysis?: AIAnalysis;
  transcriptionSummary?: AITranscriptionSummary;
  report?: EditableReport;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewTranscript {
  sessionId: string;
  turns: TranscriptTurn[];
  summary?: string;
  generatedAt: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'ai-recruiter' | 'referee';
  text: string;
  timestamp: number; // seconds from start
  confidence?: number; // speech recognition confidence
}

export interface SessionRecording {
  sessionId: string;
  videoUrl?: string;
  audioUrl?: string;
  duration: number;
  format: string;
  size: number; // bytes
  uploadedAt: string;
}

export interface AIAnalysis {
  sessionId: string;
  overallRating: number; // 1-5
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  keyInsights: string[];
  strengths: string[];
  concerns: string[];
  recommendationScore: number; // 0-100
  categories: CategoryScore[];
  aiConfidence: number; // 0-1
  generatedAt: string;
}

export interface CategoryScore {
  category: string;
  score: number; // 1-5
  evidence: string[];
}

export interface AIQuestionConfig {
  source: QuestionSource;
  templateId?: string;
  customPrompt?: string;
  focusAreas?: string[];
  adaptiveMode: boolean;
  maxQuestions?: number;
  estimatedDuration?: number; // minutes
}

export interface AvailableSlot {
  start: string; // ISO timestamp
  end: string; // ISO timestamp
}
export interface AITranscriptionSummary {
  sessionId: string;
  candidateName: string;
  candidateId: string;
  refereeInfo: {
    name: string;
    relationship: string;
    companyName: string;
    yearsKnown?: string;
  };
  sessionDetails: {
    mode: 'video' | 'phone';
    duration: number; // seconds
    completedAt: string;
    questionsAsked: number;
  };
  executiveSummary: string; // AI-generated 2-3 paragraph summary
  keyFindings: {
    strengths: string[];
    concerns: string[];
    neutralObservations: string[];
  };
  categoryBreakdown: {
    category: string;
    score: number; // 1-5
    summary: string;
    evidence: string[]; // quotes from transcript
  }[];
  recommendation: {
    overallScore: number; // 0-100
    hiringRecommendation: 'strongly-recommend' | 'recommend' | 'neutral' | 'concerns' | 'not-recommend';
    confidenceLevel: number; // 0-1
    reasoningSummary: string;
  };
  conversationHighlights: {
    question: string;
    answer: string;
    significance: string;
    timestamp: number;
  }[];
  redFlags: {
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    evidence: string;
  }[];
  verificationItems: {
    claim: string;
    verified: boolean;
    notes: string;
  }[];
  generatedAt: string;
  generatedBy: 'ai' | 'manual';
  lastEditedAt?: string;
  lastEditedBy?: string;
}

export interface EditableReport {
  id: string;
  sessionId: string;
  summary: AITranscriptionSummary;
  editableContent: string; // HTML content from TipTap editor
  version: number;
  status: 'draft' | 'reviewed' | 'finalized';
  createdAt: string;
  updatedAt: string;
}
