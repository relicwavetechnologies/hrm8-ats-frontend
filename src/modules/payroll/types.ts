export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'cancelled';
export type DeductionType = 'tax' | 'insurance' | 'loan' | 'advance' | 'other';
export type AllowanceType = 'housing' | 'transport' | 'meal' | 'bonus' | 'commission' | 'other';

export interface SalaryComponent {
  id: string;
  name: string;
  type: DeductionType | AllowanceType;
  amount: number;
  isPercentage: boolean;
  isRecurring: boolean;
}

export interface PayrollRun {
  id: string;
  period: string; // YYYY-MM format
  startDate: string;
  endDate: string;
  status: PayrollStatus;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossPay: number;
  netPay: number;
  workDays: number;
  overtimeHours: number;
  leaveDays: number;
  status: PayrollStatus;
  generatedAt: string;
  paidAt?: string;
}

export interface PayrollStats {
  totalPayrollBudget: number;
  monthlyAverage: number;
  yearToDateTotal: number;
  highestPaid: number;
  lowestPaid: number;
  averageSalary: number;
}
export type CompensationType = 'salary' | 'hourly' | 'commission' | 'bonus';
export type ReviewCycle = 'annual' | 'semi-annual' | 'quarterly';

export interface SalaryBand {
  id: string;
  jobLevel: string;
  jobTitle: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompensationReview {
  id: string;
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  proposedSalary: number;
  increasePercentage: number;
  increaseAmount: number;
  effectiveDate: string;
  reviewCycle: ReviewCycle;
  reviewYear: number;
  justification: string;
  performanceRating?: number;
  marketPosition?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BonusPlan {
  id: string;
  name: string;
  type: 'performance' | 'annual' | 'signing' | 'retention' | 'spot';
  targetAmount: number;
  eligibilityCriteria: string;
  payoutSchedule: string;
  fiscalYear: number;
  isActive: boolean;
}

export interface EquityGrant {
  id: string;
  employeeId: string;
  employeeName: string;
  grantType: 'stock-option' | 'rsu' | 'sar';
  shares: number;
  strikePrice?: number;
  grantDate: string;
  vestingStartDate: string;
  vestingSchedule: string;
  vestedShares: number;
  status: 'active' | 'fully-vested' | 'forfeited';
}

export interface CompensationStats {
  totalCompensationBudget: number;
  averageIncrease: number;
  budgetUtilization: number;
  pendingReviews: number;
  completedReviews: number;
}
