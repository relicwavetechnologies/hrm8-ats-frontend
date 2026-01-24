export type RPOTaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type RPOTaskPriority = 'high' | 'medium' | 'low';
export type RPOTaskType = 'sourcing' | 'screening' | 'interview' | 'offer' | 'admin' | 'reporting';

export interface RPOTask {
  id: string;
  contractId: string;
  contractName: string;
  title: string;
  description: string;
  assignedConsultantId: string;
  assignedConsultantName: string;
  status: RPOTaskStatus;
  priority: RPOTaskPriority;
  type: RPOTaskType;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RPOTaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  byType: {
    [key in RPOTaskType]: number;
  };
}
export type ServiceType = 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
export type ServiceStatus = 'active' | 'on-hold' | 'completed' | 'cancelled';
export type ServicePriority = 'high' | 'medium' | 'low';
export type ServiceStage = 'initiated' | 'in-progress' | 'shortlisting' | 'interviewing' | 'offer' | 'completed';

export interface RPOFeeStructure {
  id: string;
  type: 'consultant-monthly' | 'per-vacancy' | 'milestone' | 'one-time' | 'custom';
  name: string;
  amount: number;
  frequency?: 'one-time' | 'monthly' | 'quarterly' | 'per-placement' | 'per-vacancy';
  description?: string;
  isGuidePrice?: boolean; // Flag for guide vs. actual negotiated price
}

export interface RPOConsultantAssignment {
  id: string;
  consultantId: string;
  consultantName: string;
  monthlyRate: number; // Can differ from guide price
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface ServiceProject {
  id: string;
  name: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  priority: ServicePriority;
  stage: ServiceStage;
  
  // Client/Employer info
  clientId: string;
  clientName: string;
  clientLogo?: string;
  location: string; // "City, State" format for display
  country: string;
  
  // Assigned consultants
  consultants: Array<{
    id: string;
    name: string;
    role: 'lead' | 'support';
    avatar?: string;
  }>;
  
  // Progress metrics
  progress: number; // 0-100
  candidatesShortlisted: number;
  candidatesInterviewed: number;
  numberOfVacancies: number; // Number of positions for this service (from job)
  
  // Financial (linked to JobPayment)
  jobId?: string; // Reference to the job this service is for
  jobTitle?: string; // For quick display
  jobPaymentId?: string; // Reference to JobPayment record
  projectValue: number; // Total service fee (serviceFee from JobPayment)
  upfrontPaid: number; // Amount paid upfront (50%)
  balanceDue: number; // Amount due on completion (50%)
  currency: string;
  
  // Dates
  startDate: string;
  deadline: string;
  completedDate?: string;
  
  // Additional info
  description?: string;
  requirements?: string[];
  tags?: string[];
  customHours?: number; // Override default service hours for custom workload management
  
  // RPO-specific fields
  isRPO?: boolean;
  rpoStartDate?: string;
  rpoEndDate?: string;
  rpoDuration?: number; // Duration in months
  rpoFeeStructures?: RPOFeeStructure[];
  rpoAssignedConsultants?: RPOConsultantAssignment[]; // NEW - track individual consultants
  rpoNumberOfConsultants?: number; // NEW - for guide pricing calculation
  rpoMonthlyRatePerConsultant?: number; // NEW - actual negotiated rate (vs guide)
  rpoMonthlyRetainer?: number;
  rpoPerVacancyFee?: number; // NEW - actual negotiated per-vacancy fee
  rpoEstimatedVacancies?: number; // NEW - for pricing calculation
  rpoTotalContractValue?: number;
  rpoIsCustomPricing?: boolean; // NEW - flag if using custom pricing vs guide
  rpoAutoRenew?: boolean;
  rpoNoticePeriod?: number; // Notice period in days
  rpoNotes?: string;
  targetPlacements?: number; // Expected number of placements
  rpoCountry?: string; // Standardized country name
  rpoPrimaryContactId?: string; // Reference to EmployerContact.id
  rpoPrimaryContactName?: string; // Cached for display
  rpoAdditionalContactIds?: string[]; // Array of additional contact IDs
  
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTask {
  id: string;
  serviceProjectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: ServicePriority;
  dueDate: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceActivity {
  id: string;
  serviceProjectId: string;
  type: 'created' | 'updated' | 'status-changed' | 'consultant-assigned' | 'task-added' | 'milestone-reached' | 'note-added';
  description: string;
  userId: string;
  userName: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ServiceStats {
  totalActive: number;
  byType: {
    shortlisting: number;
    fullService: number;
    executiveSearch: number;
    rpo: number;
  };
  totalRevenue: number;
  avgSuccessRate: number;
  completedThisMonth: number;
}
export interface CandidateToEmployee {
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  jobId: string;
  jobTitle: string;
  serviceProjectId?: string;
  status: 'offer-accepted' | 'onboarding' | 'hired' | 'declined';
  offerDate: string;
  startDate: string;
  employeeId?: string;
  onboardingProgress: number; // 0-100
  onboardingTasks: OnboardingTask[];
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'equipment' | 'training' | 'access' | 'orientation';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  dueDate: string;
  completedDate?: string;
}

export interface HiringPipeline {
  jobId: string;
  jobTitle: string;
  department: string;
  candidatesApplied: number;
  candidatesScreened: number;
  candidatesInterviewed: number;
  candidatesOffered: number;
  candidatesHired: number;
  avgTimeToHire: number; // days
  costPerHire: number;
}

export interface RecruitmentROI {
  serviceProjectId: string;
  projectName: string;
  serviceType: string;
  serviceFee: number;
  candidatesPlaced: number;
  averageRetention: number; // months
  costPerPlacement: number;
  timeToFill: number; // days
  clientSatisfaction: number; // 1-5
  roi: number; // percentage
}
