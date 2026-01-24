export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveApprovalStatus = 'pending' | 'approved' | 'rejected' | 'skipped';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  isPaid: boolean;
  requiresApproval: boolean;
  maxDaysPerYear?: number;
  allowNegativeBalance: boolean;
  carryoverAllowed: boolean;
  maxCarryoverDays?: number;
  requiresDocumentation: boolean;
  minNoticeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  attachments?: string[];
  approvalWorkflow: LeaveApproval[];
  currentApprovalLevel: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  responseNotes?: string;
}

export interface LeaveApproval {
  id: string;
  leaveRequestId: string;
  level: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: LeaveApprovalStatus;
  respondedAt?: string;
  notes?: string;
  isRequired: boolean;
}

export interface LeaveApprovalRule {
  id: string;
  leaveTypeId?: string; // If null, applies to all leave types
  level: number;
  roleOrEmployeeId: string;
  roleOrEmployeeName: string;
  isRole: boolean; // true = role, false = specific employee
  isRequired: boolean; // If false, can be skipped
  autoApproveAfterDays?: number;
  notifyOnSubmission: boolean;
  createdAt: string;
}

export interface LeaveCalendarEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  totalDays: number;
}
// Time Off Management Types

export type TimeOffStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'bereavement' | 'unpaid';

export interface TimeOffBalance {
  id: string;
  consultantId: string;
  consultantName: string;
  type: TimeOffType;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  available: number;
  carriedOver: number;
  expiresAt?: string;
}

export interface TimeOffRequest {
  id: string;
  consultantId: string;
  consultantName: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
  status: TimeOffStatus;
  coverageConsultantId?: string;
  coverageConsultantName?: string;
  coverageNotes?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockoutPeriod {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  reason: string;
  appliesToAll: boolean;
  consultantIds: string[];
  allowExceptions: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CoverageAssignment {
  id: string;
  requestId: string;
  consultantId: string;
  consultantName: string;
  coveringConsultantId: string;
  coveringConsultantName: string;
  startDate: string;
  endDate: string;
  tasks: string[];
  notes?: string;
  status: 'pending' | 'accepted' | 'declined';
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  createdAt: string;
}

export interface TimeOffCalendarEvent {
  id: string;
  consultantId: string;
  consultantName: string;
  type: TimeOffType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: TimeOffStatus;
  isBlockout?: boolean;
}

export interface TimeOffStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysOff: number;
  upcomingDaysOff: number;
  utilizationRate: number;
}
