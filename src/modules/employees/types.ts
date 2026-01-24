export type EmployeeStatus = 'active' | 'on-leave' | 'notice-period' | 'inactive' | 'terminated';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern' | 'casual';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface Employee {
  id: string;
  employeeId: string; // Employee number/code
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  avatar?: string;
  
  // Job Information
  jobTitle: string;
  department: string;
  location: string;
  managerId?: string;
  managerName?: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  startDate: string;
  endDate?: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Compensation
  salary: number;
  currency: string;
  payFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annually';
  
  // Additional Info
  skills?: string[];
  certifications?: string[];
  notes?: string;
  
  // Custom Fields
  customFields?: Record<string, any>;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastActivityAt?: string;
}

export interface EmploymentHistory {
  id: string;
  employeeId: string;
  position: string;
  department: string;
  location: string;
  startDate: string;
  endDate?: string;
  salary: number;
  changeReason?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: EmployeeDocumentType;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'archived';
  tags?: string[];
}

export type EmployeeDocumentType = 
  | 'contract'
  | 'identification'
  | 'certification'
  | 'tax-form'
  | 'visa'
  | 'license'
  | 'policy-acknowledgment'
  | 'performance-review'
  | 'resume'
  | 'other';

export interface EmployeeNote {
  id: string;
  employeeId: string;
  content: string;
  category: 'general' | 'performance' | 'disciplinary' | 'achievement' | 'feedback';
  isPrivate: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  options?: string[]; // For select/multiselect
  required: boolean;
  section: 'personal' | 'job' | 'compensation' | 'other';
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeePermission {
  id: string;
  role: 'admin' | 'hr-manager' | 'manager' | 'employee';
  canViewPersonalInfo: boolean;
  canEditPersonalInfo: boolean;
  canViewCompensation: boolean;
  canEditCompensation: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canViewNotes: boolean;
  canAddNotes: boolean;
  canViewHistory: boolean;
  canTerminate: boolean;
}
// Employee Relations Case Management Types

export type ERCaseType =
  | 'grievance'
  | 'complaint'
  | 'disciplinary'
  | 'investigation'
  | 'mediation';

export type ERCaseCategory =
  | 'harassment'
  | 'discrimination'
  | 'policy-violation'
  | 'performance'
  | 'conduct'
  | 'workplace-safety'
  | 'other';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type CaseStatus =
  | 'open'
  | 'investigating'
  | 'pending-action'
  | 'resolved'
  | 'closed';

export interface ERCase {
  id: string;
  caseNumber: string;
  type: ERCaseType;
  category: ERCaseCategory;
  priority: CasePriority;
  status: CaseStatus;
  confidential: boolean;
  reportedBy?: string;
  reportedByName?: string;
  affectedEmployees: string[];
  affectedEmployeeNames?: string[];
  description: string;
  openedDate: string;
  closedDate?: string;
  assignedTo: string[];
  assignedToNames?: string[];
  investigationNotes: InvestigationNote[];
  actionPlan?: ActionPlan;
  outcome?: CaseOutcome;
  accessControlList: string[];
  createdAt: string;
  updatedAt: string;
}

export type InvestigationNoteType =
  | 'interview'
  | 'evidence'
  | 'observation'
  | 'general';

export interface InvestigationNote {
  id: string;
  caseId: string;
  author: string;
  authorName: string;
  noteType: InvestigationNoteType;
  content: string;
  attachments?: string[];
  timestamp: string;
  isConfidential: boolean;
}

export interface ActionPlan {
  id: string;
  caseId: string;
  actions: CaseAction[];
  targetCompletionDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedDate?: string;
  notes?: string;
}

export interface CaseOutcome {
  id: string;
  caseId: string;
  decision: string;
  disciplinaryAction?: DisciplinaryAction;
  correctiveActions: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  documentUrl?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface DisciplinaryAction {
  type: 'verbal-warning' | 'written-warning' | 'suspension' | 'termination' | 'none';
  effectiveDate: string;
  expiryDate?: string;
  details: string;
}

export interface ERCaseStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  byType: Record<ERCaseType, number>;
  byCategory: Record<ERCaseCategory, number>;
  avgResolutionTime: number;
}
// Employee Self-Service Types

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  ssn?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  gender?: string;
  isStudent?: boolean;
  isDisabled?: boolean;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
}

export interface ESSPreferences {
  language: string;
  timezone: string;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  payslipNotification: boolean;
  leaveApprovalNotification: boolean;
  expenseApprovalNotification: boolean;
}

export interface ESSProfile {
  id: string;
  userId: string;
  employeeId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  emergencyContacts: EmergencyContact[];
  dependents: Dependent[];
  bankDetails?: BankDetails;
  preferences: ESSPreferences;
  updatedAt: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
  requiresPermission?: string;
  badge?: number;
}

export interface ESSStats {
  leaveBalance: number;
  pendingApprovals: number;
  upcomingReviews: number;
  unreadDocuments: number;
  attendancePercentage: number;
}
