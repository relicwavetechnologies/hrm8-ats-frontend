
export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle?: string; // Optional as it might differ in some contexts
  employerName?: string; // Optional
  status: ApplicationStatus;
  stage: ApplicationStage;
  appliedDate: string | Date; // Allow Date object
  resumeUrl?: string;
  coverLetterUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  candidateName?: string; // Helpful for UI
  avatar?: string;
  email?: string;
  phone?: string;
  customAnswers?: any;
  questionnaireData?: any;
  isRead: boolean;
  isNew: boolean;
  tags: string[];
  score?: number;
  aiMatchScore?: number; // Alias for score
  rank?: number;
  shortlisted: boolean;
  shortlistedAt?: string | Date;
  shortlistedBy?: string;
  manuallyAdded: boolean;
  addedBy?: string;
  addedAt?: string | Date;
  recruiterNotes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  assignedTo?: string;
  assignedToName?: string;
  activities: any[]; // Define a stricter type if needed
  interviews: any[]; // Define a stricter type if needed

  // Missing fields based on usage in JobDetail.tsx
  candidateEmail?: string;
  candidatePhone?: string;
  candidateCity?: string;
  candidateState?: string;
  candidateCountry?: string;
  candidatePhoto?: string;
  roundId?: string;
  aiAnalysis?: any;
  notes?: any[];
  candidatePreferences?: any;
}

export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';

export type ApplicationStage =
  | 'New Application'
  | 'Resume Review'
  | 'Phone Screen'
  | 'Technical Interview'
  | 'Manager Interview'
  | 'Final Round'
  | 'Reference Check'
  | 'Offer Extended'
  | 'Offer Accepted'
  | 'Rejected'
  | 'Withdrawn';
