export type AssessmentType = 
  | 'cognitive' 
  | 'personality' 
  | 'technical-skills'
  | 'situational-judgment'
  | 'behavioral'
  | 'culture-fit'
  | 'custom';

export type AssessmentProvider = 
  | 'testgorilla'
  | 'vervoe'
  | 'criteria'
  | 'harver'
  | 'shl'
  | 'codility'
  | 'internal';

export type AssessmentStatus = 
  | 'draft'
  | 'pending-invitation'
  | 'invited'
  | 'in-progress'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface AssessmentResult {
  assessmentType: AssessmentType;
  score: number; // 0-100
  percentile?: number;
  status: 'passed' | 'failed' | 'needs-review';
  completedDate: string;
  timeSpent: number; // minutes
  details?: {
    categoryScores?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
  reportUrl?: string;
}

export interface Assessment {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId?: string;
  jobTitle?: string;
  employerId?: string;
  employerName?: string;
  employerLogo?: string;
  applicationId?: string;
  assessmentType: AssessmentType;
  provider: AssessmentProvider;
  status: AssessmentStatus;
  invitedBy: string;
  invitedByName: string;
  invitedDate: string;
  expiryDate: string;
  completedDate?: string;
  result?: AssessmentResult;
  overallScore?: number;
  passed?: boolean;
  passThreshold: number;
  invitationToken?: string;
  remindersSent: number;
  lastReminderDate?: string;
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  billedTo?: string;
  billedToName?: string;
  notes?: string;
  country?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  assessmentType: AssessmentType;
  provider: AssessmentProvider;
  duration: number; // minutes
  questionCount: number;
  passThreshold: number;
  categories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AssessmentComment {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string; // For threaded replies
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  mentions?: string[]; // User IDs mentioned in the comment
  attachments?: CommentAttachment[];
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AssessmentRating {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  category: RatingCategory;
  score: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export type RatingCategory =
  | 'technical-skills'
  | 'problem-solving'
  | 'communication'
  | 'cultural-fit'
  | 'overall';

export interface AssessmentDecision {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  decision: DecisionType;
  reasoning: string;
  createdAt: string;
  updatedAt: string;
}

export type DecisionType = 'proceed' | 'reject' | 'maybe' | 'pending';

export interface CollaboratorActivity {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  activityType: ActivityType;
  details: string;
  timestamp: string;
}

export type ActivityType =
  | 'viewed'
  | 'commented'
  | 'rated'
  | 'decided'
  | 'shared'
  | 'mentioned';

export interface AssessmentCollaborator {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: string;
  addedAt: string;
  lastViewedAt?: string;
  hasCommented: boolean;
  hasRated: boolean;
  hasDecided: boolean;
}

export interface CollaborationSummary {
  totalComments: number;
  totalRatings: number;
  decisions: {
    proceed: number;
    reject: number;
    maybe: number;
    pending: number;
  };
  averageRatings: Record<RatingCategory, number>;
  collaborators: AssessmentCollaborator[];
  lastActivity: string;
}
export type PredictionConfidence = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type SuccessLikelihood = 'very-unlikely' | 'unlikely' | 'neutral' | 'likely' | 'very-likely';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HistoricalPattern {
  scoreRange: { min: number; max: number };
  sampleSize: number;
  successRate: number;
  averageRetention: number; // months
  averagePerformanceRating: number; // 1-5
}

export interface RiskFactor {
  id: string;
  category: 'score' | 'time' | 'behavioral' | 'cultural' | 'technical';
  severity: RiskLevel;
  description: string;
  impact: string;
  mitigation?: string;
}

export interface SuccessIndicator {
  id: string;
  category: 'strength' | 'opportunity';
  description: string;
  confidence: PredictionConfidence;
  supportingData: string;
}

export interface PredictionMetrics {
  hiringSuccessRate: number; // percentage
  retentionProbability: number; // percentage
  expectedPerformanceRating: number; // 1-5
  timeToProductivity: number; // days
  culturalFitScore: number; // 0-100
}

export interface AssessmentPrediction {
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  overallSuccessLikelihood: SuccessLikelihood;
  confidenceScore: number; // 0-100
  predictionConfidence: PredictionConfidence;
  metrics: PredictionMetrics;
  riskFactors: RiskFactor[];
  successIndicators: SuccessIndicator[];
  historicalPattern: HistoricalPattern;
  recommendations: string[];
  comparisonToAverage: {
    betterThan: number; // percentage of candidates
    averageScore: number;
    candidateScore: number;
  };
  predictedAt: string;
  dataQuality: {
    sampleSize: number;
    dataRecency: string; // e.g., "last 12 months"
    confidence: PredictionConfidence;
  };
}
import { AssessmentType, AssessmentProvider } from './assessment';

export type ScheduledAssessmentStatus = 'scheduled' | 'sent' | 'cancelled' | 'failed';

export interface ScheduledAssessment {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId?: string;
  jobTitle?: string;
  assessmentType: AssessmentType;
  provider: AssessmentProvider;
  passThreshold: number;
  expiryDays: number;
  customInstructions?: string;
  scheduledDate: string; // ISO string
  scheduledTime: string; // HH:mm format
  timezone: string;
  status: ScheduledAssessmentStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  sentAt?: string;
  cancelledAt?: string;
  failureReason?: string;
  cost: number;
}
export type QuestionType = 
  | 'multiple-choice'
  | 'single-choice'
  | 'true-false'
  | 'text-short'
  | 'text-long'
  | 'coding'
  | 'video-response'
  | 'file-upload';

export type DifficultyLevel = 
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionVersion {
  version: number;
  text: string;
  options?: QuestionOption[];
  updatedBy: string;
  updatedAt: string;
  changeNotes?: string;
}

export interface QuestionUsageStats {
  totalUses: number;
  assessmentCount: number;
  lastUsedDate?: string;
  averageScore?: number;
  passRate?: number;
}

export interface QuestionBankItem {
  id: string;
  text: string;
  type: QuestionType;
  category: string[];
  difficulty: DifficultyLevel;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number; // seconds
  isActive: boolean;
  version: number;
  versionHistory: QuestionVersion[];
  usageStats: QuestionUsageStats;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  instructions?: string;
}
export type QuestionType = 
  | 'multiple-choice'
  | 'rating-scale'
  | 'yes-no'
  | 'short-text'
  | 'long-text'
  | 'numeric'
  | 'date'
  | 'file-upload';

export interface AnswerOption {
  id: string;
  text: string;
  score?: number;
}

export interface RatingScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

export interface QuestionnaireQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  order: number;
  
  // For multiple choice
  options?: AnswerOption[];
  allowMultiple?: boolean;
  
  // For rating scale
  ratingConfig?: RatingScaleConfig;
  
  // For text questions
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  
  // For numeric
  minValue?: number;
  maxValue?: number;
  
  // Scoring
  scoringEnabled?: boolean;
  maxScore?: number;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: QuestionnaireQuestion[];
  estimatedDuration: number; // minutes
  passingScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version: number;
}
