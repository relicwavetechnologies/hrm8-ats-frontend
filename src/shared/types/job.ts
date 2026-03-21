import { ApplicationFormConfig } from './applicationForm';

export type DistributionScope = 'HRM8_ONLY' | 'GLOBAL';

export interface GlobalPublishConfig {
  channels: string[];
  budgetTier: 'basic' | 'standard' | 'premium' | 'executive' | 'custom' | 'none';
  customBudget?: number;
  hrm8ServiceRequiresApproval: boolean;
  hrm8ServiceApproved: boolean;
  easyApplyConfig?: {
    enabled: boolean;
    type: 'basic' | 'full';
    hostedApply: boolean;
    questionnaireEnabled: boolean;
  };
}

export interface JobTargetSyncSummary {
  remoteJobId?: string;
  syncStatus: 'NOT_SYNCED' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CLOSED';
  lastSyncedAt?: string | Date;
  lastError?: string;
  postingsLastRefreshedAt?: string | Date;
  postingsLastError?: string;
  approved: boolean;
  selectedChannels: string[];
  budget?: number;
  budgetSpent?: number;
  promotionStatus?: string;
}

export interface JobTargetPostingSnapshot {
  id: string;
  postingId: string;
  siteId?: string;
  productId?: string;
  siteName?: string;
  status?: string;
  createdAt?: string | null;
  expiredAt?: string | null;
  orderId?: string;
  retailCost?: number | null;
  postingCost?: number | null;
  savings?: number | null;
  taxesAndFees?: number | null;
  totalCost?: number | null;
  viewUrl?: string;
  click2ApplyUrl?: string;
  easyApply: boolean;
  location?: Record<string, unknown> | null;
  analytics: {
    clicks: number;
    apps: number;
  };
  user: {
    createdByName?: string;
    createdByEmail?: string;
    createdDtm?: string | null;
    stoppedByName?: string;
    stoppedByEmail?: string;
    stoppedDtm?: string | null;
  };
  isActiveSnapshot: boolean;
  lastRefreshedAt?: string | null;
}

export interface JobTargetDistributionRow {
  jobId: string;
  title: string;
  localStatus: string;
  syncStatus: string;
  remoteJobId?: string;
  activePostingCount: number;
  totalClicks: number;
  totalApplies: number;
  activeSites: string[];
  lastPostingsRefreshAt?: string | null;
  easyApplyEnabled: boolean;
  questionnaireEnabled: boolean;
  attentionState: 'LIVE' | 'NOT_LAUNCHED' | 'STALE' | 'NEEDS_ATTENTION' | 'SYNCED';
  primaryCta: 'Launch' | 'Refresh' | 'View distribution';
  lastError?: string | null;
  feedState: 'READY' | 'NOT_ENABLED_BY_JOBTARGET' | 'SYNCING' | 'ERROR';
  integrationHealth: JobTargetIntegrationHealth;
  trackingHealth: JobTargetTrackingHealth;
  careerMetrics: JobCareerMetrics;
  totals: JobApplyTotals;
}

export interface JobTargetIntegrationHealth {
  company: 'HEALTHY' | 'ATTENTION';
  user: 'HEALTHY' | 'ATTENTION';
  job: 'HEALTHY' | 'ATTENTION';
  feed: 'READY' | 'NOT_ENABLED_BY_JOBTARGET' | 'SYNCING' | 'ERROR';
  applicantTracking: 'HEALTHY' | 'PENDING' | 'ERROR';
}

export interface JobTargetTrackingHealth {
  status: 'HEALTHY' | 'PENDING' | 'ERROR';
  lastSuccessfulSyncAt?: string | null;
  pendingNewApplicationSyncs: number;
  pendingStageSyncs: number;
  failedNewApplicationSyncs: number;
  failedStageSyncs: number;
  latestError?: string | null;
}

export interface JobTargetOrderSummary {
  totalSpend: number;
  orderCount: number;
  latestOrderAt?: string | null;
  receiptUrl?: string | null;
  recentOrders: Array<{
    orderId: string;
    createdAt?: string | null;
    cost?: number | null;
    receiptUrl?: string | null;
    siteName?: string | null;
  }>;
}

export interface JobTargetLaunchSession {
  launchUrl: string;
  destination: 'MARKETPLACE';
  remoteCompanyId: string;
  remoteUserId: string;
  remoteJobId: string;
  feedState: 'READY' | 'PENDING_ENABLEMENT' | 'ERROR';
  warnings: string[];
  syncSummary: {
    company: 'CREATED' | 'UPDATED' | 'UNCHANGED';
    user: 'CREATED' | 'UPDATED' | 'UNCHANGED';
    job: 'CREATED' | 'UPDATED' | 'UNCHANGED';
  };
}

export interface JobCareerMetrics {
  views: number;
  applyClicks: number;
  applies: number;
  applyCoverage: 'EXACT' | 'PARTIAL_LEGACY';
  lastActivityAt?: string | null;
  trend: {
    labels: string[];
    views: number[];
    applies: number[];
  };
}

export interface JobApplyTotals {
  totalAtsApplies: number;
  careerApplies: number;
  jobTargetAttributedApplies: number;
  otherAtsApplies: number;
}

export interface JobOverviewHeader {
  jobId: string;
  title: string;
  status: string;
  serviceType: string;
  distributionScope: string;
  visibility: string;
  postedAt?: string | null;
  updatedAt?: string | null;
  assignedConsultantName?: string | null;
  consultantState: 'ASSIGNED' | 'PENDING' | 'NOT_REQUIRED';
  paymentStatus?: string | null;
  jobTargetSyncStatus?: string | null;
  jobTargetNeedsAttention: boolean;
}

export interface JobOverviewKpis {
  applicants: number;
  views: number;
  applies: number;
  boardsLive: number;
}

export interface JobOverviewFunnelRound {
  roundId: string;
  label: string;
  count: number;
  fixedKey?: string;
}

export interface JobOverviewFunnelStage {
  key: string;
  label: string;
  count: number;
}

export interface JobOverviewFunnel {
  totalApplicants: number;
  shortlisted: number;
  rounds: JobOverviewFunnelRound[];
  stages: JobOverviewFunnelStage[];
}

export interface JobOverviewSourceBreakdownEntry {
  source: string;
  label: string;
  count: number;
  percent: number;
}

export interface JobOverviewDistributionBoard {
  siteName: string;
  status?: string;
  clicks: number;
  applies: number;
  spend: number;
  easyApply: boolean;
  viewUrl?: string;
}

export interface JobOverviewDistributionSummary {
  enabled: boolean;
  syncStatus?: string;
  attentionState?: string;
  feedState?: 'READY' | 'NOT_ENABLED_BY_JOBTARGET' | 'SYNCING' | 'ERROR';
  boardsLive: number;
  totalClicks: number;
  totalApplies: number;
  totalSpend: number;
  lastRefreshAt?: string | null;
  topBoards: JobOverviewDistributionBoard[];
  easyApplyState: 'disabled' | 'configured' | 'enabled' | 'mixed';
}

export interface JobOverviewOperations {
  screening: {
    pending: number;
    analyzed: number;
    averageScore: number | null;
  };
  tasks: {
    total: number;
    pending: number;
    overdue: number;
    urgent: number;
    lastActivityAt?: string | null;
  };
  messages: {
    conversations: number;
    waitingOnCandidate: number;
    waitingOnHiringTeam: number;
    lastMessageAt?: string | null;
  };
  email: {
    sent: number;
    lastSentAt?: string | null;
  };
  interviews: {
    upcoming: number;
    upcoming7d: number;
    completed: number;
    noShowOrCancelled: number;
    lastActivityAt?: string | null;
  };
  offers: {
    draft: number;
    sent: number;
    accepted: number;
    expired: number;
    docsPending: number;
    lastActivityAt?: string | null;
  };
}

export interface JobOverviewTeam {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  roleCount: number;
  roundsWithAssignedRoles: number;
  totalRounds: number;
  assignedConsultantName?: string | null;
  consultantState: 'ASSIGNED' | 'PENDING' | 'NOT_REQUIRED';
}

export interface JobOverviewRoleSnapshot {
  summary?: string | null;
  requirementsPreview: string[];
  responsibilitiesPreview: string[];
  totalRequirements: number;
  totalResponsibilities: number;
}

export interface JobOverviewMilestone {
  id: string;
  type: string;
  title: string;
  description?: string;
  occurredAt: string;
  hrefTab?: string;
}

export interface JobOverviewResponse {
  header: JobOverviewHeader;
  kpis: JobOverviewKpis;
  funnel: JobOverviewFunnel;
  career: JobCareerMetrics;
  sourceMix: {
    totalAtsApplies: number;
    breakdown: JobOverviewSourceBreakdownEntry[];
  };
  distribution: JobOverviewDistributionSummary;
  operations: JobOverviewOperations;
  team: JobOverviewTeam;
  roleSnapshot: JobOverviewRoleSnapshot;
  milestones: JobOverviewMilestone[];
}

export type PublishedJobSetupState =
  | 'PENDING_CONSULTANT'
  | 'PENDING_SETUP'
  | 'ADVANCED'
  | 'SIMPLE'
  | 'UNKNOWN';

export type PublishedJobDistributionState =
  | 'HRM8_ONLY'
  | 'LAUNCH_PENDING'
  | 'SYNC_NEEDED'
  | 'LIVE'
  | 'CLOSED';

export interface PublishedJobListRow {
  job: Job;
  distribution?: JobTargetDistributionRow;
  setupState: PublishedJobSetupState;
  distributionState: PublishedJobDistributionState;
  primaryAction?: 'complete_setup' | 'launch_marketplace' | 'sync' | 'view_distribution';
  careerMetrics: JobCareerMetrics;
  totals: JobApplyTotals;
  careerViewSeries: number[];
  atsApplySeries: number[];
}

export interface JobTargetDistributionOverview {
  summary: {
    totalGlobalJobs: number;
    jobsLiveOnBoards: number;
    jobsNeedingAttention: number;
    totalClicks: number;
    totalApplies: number;
    totalCareerViews: number;
    totalCareerApplyClicks: number;
    totalCareerApplies: number;
    feedPendingCount: number;
    trackingIssueCount: number;
    liveBoardCount: number;
    launchReadyCount: number;
  };
  rows: JobTargetDistributionRow[];
}

export interface JobTargetDistributionDetail {
  job: {
    id: string;
    title: string;
    localStatus: string;
    distributionScope: string;
    remoteJobId?: string | null;
  };
  company: {
    remoteCompanyId?: string;
    feedUrl?: string;
    lastSyncedAt?: string;
    feedLastSyncedAt?: string;
    feedLastAttemptAt?: string;
    feedLastError?: string;
    feedLastStatus?: number;
    feedRegistrationState?: 'NEVER_REGISTERED' | 'REGISTERED' | 'INVALID';
    lastError?: string;
  };
  sync: {
    syncStatus: string;
    lastSyncedAt?: string | null;
    lastError?: string | null;
    postingsLastRefreshedAt?: string | null;
    postingsLastError?: string | null;
    isStale: boolean;
  };
  feedState: 'READY' | 'NOT_ENABLED_BY_JOBTARGET' | 'SYNCING' | 'ERROR';
  integrationHealth: JobTargetIntegrationHealth;
  easyApply: {
    enabled: boolean;
    type: 'basic' | 'full';
    hostedApply: boolean;
    questionnaireEnabled: boolean;
    deliveredApplications: number;
    questionnaireResponseCount: number;
  };
  easyApplyState: 'ALL_ON' | 'MIXED' | 'OFF';
  rollups: {
    activePostingCount: number;
    totalClicks: number;
    totalApplies: number;
    activeSites: string[];
    totalSpend: number;
  };
  topBoards: Array<{
    siteId?: string;
    siteName?: string;
    status?: string;
    clicks: number;
    applies: number;
    totalCost: number;
    viewUrl?: string;
    hostedApplyUrl?: string | null;
  }>;
  orderSummary: JobTargetOrderSummary;
  postings: JobTargetPostingSnapshot[];
  attribution: {
    totalJobTargetAttributedApplications: number;
    sourceBreakdown: Array<{ source: string; count: number }>;
    mediumBreakdown: Array<{ medium: string; count: number }>;
    topCampaigns: Array<{ campaign: string; count: number }>;
  };
  syncIssues: {
    totalJobTargetAttributedApplications: number;
    failedNewApplicationSyncs: number;
    failedStageSyncs: number;
    lastFailedSyncAt?: string | null;
    errorSnippets: string[];
  };
  trackingHealth: JobTargetTrackingHealth;
  careerMetrics: JobCareerMetrics;
  totals: JobApplyTotals;
  sourceBreakdownAll: Array<{ source: string; count: number }>;
}

export interface JobTargetEasyApplyReadiness {
  enabled: boolean;
  type: 'basic' | 'full';
  hostedApply: boolean;
  questionnaireEnabled: boolean;
  questionnaireReady: boolean;
  deliveryReady: boolean;
  questionnaireWebhookUrl?: string;
  applicationDeliveryWebhookUrl?: string;
  issues: string[];
}

/** Per-job role (e.g. Technical Interviewer, Hiring Manager). Production-grade: each job has its own roles. */
export interface JobRole {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface HiringTeamMember {
  id: string;
  userId?: string;
  email: string;
  name: string;
  /** Legacy single role (system enum). Prefer `roles` for per-job role assignment. */
  role: 'admin' | 'member' | 'hiring_manager' | 'recruiter' | 'interviewer' | 'coordinator' | 'shortlisting' | 'ADMIN' | 'MEMBER' | 'SHORTLISTING';
  /** Per-job role IDs (JobRole.id). Multi-role support for production. */
  roles?: string[];
  /** Resolved role details when API returns roleDetails */
  roleDetails?: Array<{ id: string; name: string }>;
  permissions: {
    canViewApplications: boolean;
    canShortlist: boolean;
    canScheduleInterviews: boolean;
    canMakeOffers: boolean;
  };
  status: 'active' | 'pending_invite' | 'ACTIVE' | 'PENDING';
  invitedAt?: string;
  addedBy?: string;
}

export type JobPipelineStage =
  | 'INTAKE'
  | 'SOURCING'
  | 'SCREENING'
  | 'SHORTLIST_SENT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'PLACED'
  | 'ON_HOLD'
  | 'CLOSED';

export interface JobPipelineStatus {
  stage: JobPipelineStage;
  progress?: number;
  note?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  consultantId?: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerLogo?: string;
  createdBy: string;
  createdByName: string;
  title: string;
  numberOfVacancies: number;
  jobCode: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  department: string;
  location: string;
  country?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  salaryDescription?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  status: 'draft' | 'open' | 'closed' | 'on-hold' | 'filled' | 'cancelled' | 'template';
  visibility: 'public' | 'private';
  stealth: boolean;
  postingDate: string;
  closeDate?: string;
  tags: string[];
  workArrangement: 'on-site' | 'remote' | 'hybrid';
  aiGeneratedDescription: boolean;
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  serviceStatus?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedConsultantId?: string;
  assignedConsultantName?: string;
  /** True when job has managed service, no consultant, and a ConsultantAssignmentRequest is PENDING */
  pendingConsultantAssignment?: boolean;
  /** For managed jobs with consultant: true when roles and rounds are configured (advance setup done) */
  advanceSetupComplete?: boolean;
  pipeline?: JobPipelineStatus;
  jobBoardDistribution: string[];
  applicantsCount: number;
  unreadApplicants?: number;
  viewsCount: number;
  clicksCount?: number;
  careerMetrics?: JobCareerMetrics;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  /** Wizard step index (1-based) when saved as draft */
  draftStep?: number;
  hiringTeam?: HiringTeamMember[];
  applicationForm?: ApplicationFormConfig;

  // JobTarget Promotion & Payment
  distributionScope?: DistributionScope;
  globalPublishConfig?: GlobalPublishConfig;
  jobTargetSync?: JobTargetSyncSummary;
  hasJobTargetPromotion?: boolean;
  jobTargetPromotionId?: string;
  jobTargetChannels?: string[];
  jobTargetBudget?: number;
  jobTargetBudgetTier?: 'basic' | 'standard' | 'premium' | 'executive' | 'custom' | 'none';
  jobTargetBudgetSpent?: number;
  jobTargetBudgetRemaining?: number;
  jobTargetStatus?: 'pending' | 'active' | 'paused' | 'completed';
  jobTargetApproved?: boolean;
  jobTargetPromotions?: string[];
  paymentId?: string;
  requiresPayment?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'PENDING' | 'PAID' | 'FAILED' | 'PROCESSING' | 'REFUNDED';
  serviceFee?: number;
  servicePackage?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentCompletedAt?: Date | string;
  paymentFailedAt?: Date | string;
  termsAccepted?: boolean;
  /** Post-job setup: 'simple' = manual pipeline only; 'advanced' = full ATS. */
  setupType?: 'simple' | 'advanced';
  /** Post-job setup: 'self-managed' | 'hrm8-managed'. */
  managementType?: string;
  termsAcceptedAt?: Date;
  termsAcceptedBy?: string;

  // Post-Launch Configuration
  alertsEnabled?: {
    newApplicants?: boolean;
    inactivity?: boolean;
    deadlines?: boolean;
    inactivityDays?: number;
  };
  shareLink?: string;
  referralLink?: string;
  savedAsTemplate?: boolean;
  templateId?: string;

  // Internal Job Posting Fields
  isInternal?: boolean;
  internalOnly?: boolean;
  eligibleDepartments?: string[];
  internalApplyDeadline?: string;
  currentEmployeePriority?: boolean;

  // Requisition Link
  requisitionId?: string;

  // AI Interview Configuration
  aiInterviewConfig?: {
    defaultMode: 'video' | 'phone' | 'text';
    questionSource: 'predefined' | 'ai-generated' | 'hybrid';
    defaultQuestions?: Array<{
      question: string;
      category: 'technical' | 'behavioral' | 'situational' | 'cultural' | 'experience';
    }>;
  };

  // Video Interviewing
  videoInterviewingEnabled?: boolean;
}

export interface JobTemplate {
  id: string;
  employerId?: string;
  templateName: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  employmentType: string;
  department: string;
  experienceLevel: string;
  isActive: boolean;
  isSystemTemplate: boolean;
  createdAt: string;
}

export interface JobActivity {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  activityType: 'created' | 'updated' | 'status-changed' | 'service-activated' | 'candidate-moved' | 'published' | 'closed';
  activityDescription: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface JobFormData {
  // Service Type
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';

  // Step 1: Basic Details
  title: string;
  numberOfVacancies: number;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  workArrangement: 'on-site' | 'remote' | 'hybrid';
  tags: string[]; // Legacy field - keep for backward compatibility
  category_id?: string; // NEW: FK to JobCategory
  tag_ids?: string[]; // NEW: Array of JobTag IDs

  // Step 2: Job Description
  positionDescriptionFile?: File | null;
  positionDescriptionText?: string;
  extractedJobData?: {
    title?: string;
    description?: string;
    requirements: string[];
    responsibilities: string[];
    qualifications?: string[];
    benefits?: string[];
    salaryRange?: {
      min?: number;
      max?: number;
      currency?: string;
      period?: string;
    };
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    department?: string;
  };
  description: string;
  requirements: Array<{ id: string; text: string; order: number }>;
  responsibilities: Array<{ id: string; text: string; order: number }>;

  // Step 3: Compensation, Details & Hiring Team
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
  salaryDescription?: string;
  hideSalary: boolean;
  closeDate?: string;
  visibility: 'public' | 'private';
  stealth: boolean;
  hiringTeam: HiringTeamMember[];

  // Step 4: Application Form
  applicationForm: ApplicationFormConfig;

  // Step 5: Review & Publish
  status: 'draft' | 'open';
  jobBoardDistribution: string[];

  // Step 6: Payment & JobTarget
  distributionScope?: DistributionScope;
  globalPublishConfig?: GlobalPublishConfig;
  includeJobTargetPromotion?: boolean;
  jobTargetBudgetTier?: 'basic' | 'standard' | 'premium' | 'executive' | 'custom' | 'none';
  jobTargetBudgetCustom?: number;
  selectedPaymentMethod?: 'account' | 'credit_card';
  paymentInvoiceRequested?: boolean;
  termsAccepted?: boolean;
  saveAsTemplate?: boolean;
  templateName?: string;

  // Video Interviewing
  videoInterviewingEnabled?: boolean;

  // Consultant Assignment
  assignedConsultantId?: string;
  assignmentMode?: 'AUTO' | 'MANUAL';
  regionId?: string;

  // Screening
  screeningEnabled?: boolean;
  automatedScreeningEnabled?: boolean;
  screeningCriteria?: unknown;
  preInterviewQuestionnaireEnabled?: boolean;

  // Job Rounds (for future use)
  jobRounds?: unknown[];
}
