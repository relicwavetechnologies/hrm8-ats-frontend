import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import { getReferees, getOverdueReferees } from './refereeStorage';
import { getConsentRequests } from './consentStorage';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface BackgroundCheckStats {
  total: number;
  active: number;
  completed: number;
  issuesFound: number;
  cancelled: number;
  completionRate: number;
  avgCompletionTime: number;
  pendingConsents: number;
  overdueReferees: number;
  requiresReview: number;
  changeFromLastMonth: {
    total: number;
    active: number;
    completionRate: number;
    avgCompletionTime: number;
  };
}

export function getBackgroundCheckStats(): BackgroundCheckStats {
  const checks = getBackgroundChecks();
  const referees = getReferees();
  const consents = getConsentRequests();
  
  const completed = checks.filter(c => c.status === 'completed').length;
  const active = checks.filter(c => ['pending-consent', 'in-progress'].includes(c.status)).length;
  const issuesFound = checks.filter(c => c.status === 'issues-found').length;
  const cancelled = checks.filter(c => c.status === 'cancelled').length;
  
  const completionRate = checks.length > 0 ? (completed / checks.length) * 100 : 0;
  const avgCompletionTime = calculateAvgCompletionTime(checks);
  
  return {
    total: checks.length,
    active,
    completed,
    issuesFound,
    cancelled,
    completionRate,
    avgCompletionTime,
    pendingConsents: consents.filter(c => c.status === 'pending' || c.status === 'sent').length,
    overdueReferees: getOverdueReferees().length,
    requiresReview: checks.filter(c => c.overallStatus === 'conditional' || c.status === 'issues-found').length,
    changeFromLastMonth: {
      total: 12.5,
      active: -5.2,
      completionRate: 3.8,
      avgCompletionTime: -2.1,
    }
  };
}

export function calculateAvgCompletionTime(checks: BackgroundCheck[]): number {
  const completedChecks = checks.filter(c => c.completedDate);
  if (completedChecks.length === 0) return 0;
  
  const totalDays = completedChecks.reduce((sum, check) => {
    const initiated = new Date(check.initiatedDate);
    const completed = new Date(check.completedDate!);
    const days = Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / completedChecks.length);
}

export function getCheckVolumeData() {
  return [
    { month: 'Jan', initiated: 45, completed: 38, avgDays: 12 },
    { month: 'Feb', initiated: 52, completed: 45, avgDays: 11 },
    { month: 'Mar', initiated: 48, completed: 50, avgDays: 10 },
    { month: 'Apr', initiated: 61, completed: 48, avgDays: 11 },
    { month: 'May', initiated: 58, completed: 55, avgDays: 9 },
    { month: 'Jun', initiated: 67, completed: 61, avgDays: 9 },
  ];
}

export function getStatusDistributionData() {
  const checks = getBackgroundChecks();
  return [
    { status: 'Not Started', count: checks.filter(c => c.status === 'not-started').length },
    { status: 'Pending Consent', count: checks.filter(c => c.status === 'pending-consent').length },
    { status: 'In Progress', count: checks.filter(c => c.status === 'in-progress').length },
    { status: 'Completed', count: checks.filter(c => c.status === 'completed').length },
    { status: 'Issues Found', count: checks.filter(c => c.status === 'issues-found').length },
    { status: 'Cancelled', count: checks.filter(c => c.status === 'cancelled').length },
  ];
}

export function getCheckTypeDistribution() {
  const checks = getBackgroundChecks();
  const typeCounts: Record<string, number> = {};
  
  checks.forEach(check => {
    check.checkTypes.forEach(ct => {
      typeCounts[ct.type] = (typeCounts[ct.type] || 0) + 1;
    });
  });
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    type: formatCheckType(type),
    count,
    percentage: Math.round((count / checks.length) * 100)
  }));
}

export function getProviderUsageData() {
  const checks = getBackgroundChecks();
  const providers = ['checkr', 'sterling', 'hireright', 'manual'];
  
  return providers.map(provider => ({
    provider: provider.charAt(0).toUpperCase() + provider.slice(1),
    count: checks.filter(c => c.provider === provider).length,
    successRate: Math.floor(Math.random() * 20) + 80, // Mock success rate
  }));
}

export function getResultsOverview() {
  const checks = getBackgroundChecks();
  return [
    { status: 'Clear', count: checks.filter(c => c.overallStatus === 'clear').length, color: 'hsl(var(--success))' },
    { status: 'Conditional', count: checks.filter(c => c.overallStatus === 'conditional').length, color: 'hsl(var(--warning))' },
    { status: 'Not Clear', count: checks.filter(c => c.overallStatus === 'not-clear').length, color: 'hsl(var(--destructive))' },
    { status: 'Pending', count: checks.filter(c => !c.overallStatus).length, color: 'hsl(var(--muted))' },
  ];
}

export function getRecentActivity() {
  const checks = getBackgroundChecks();
  const activities = checks
    .flatMap(check => [
      {
        type: 'initiated',
        candidateName: check.candidateName,
        timestamp: check.initiatedDate,
        checkId: check.id,
      },
      ...(check.consentGiven ? [{
        type: 'consent-received',
        candidateName: check.candidateName,
        timestamp: check.consentDate!,
        checkId: check.id,
      }] : []),
      ...(check.completedDate ? [{
        type: 'completed',
        candidateName: check.candidateName,
        timestamp: check.completedDate,
        checkId: check.id,
      }] : []),
    ])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  return activities;
}

function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import type { 
  RevenueMetrics, 
  UsageMetrics, 
  ProfitabilityMetrics, 
  TrendData,
  ClientRevenueData,
  GeographicData,
  TypeDistribution,
  ClientLifetimeValue,
  RetentionMetrics
} from '@/shared/types/businessMetrics';

// Background check pricing by type
export const BACKGROUND_CHECK_PRICING = {
  'reference': 69,
  'criminal-record': 49,
  'qualification': 59,
  'identity': 39,
  'employment': 55,
  'education': 49,
};

// Provider costs for third-party checks
const PROVIDER_COSTS = {
  'checkr': 30,
  'sterling': 35,
  'hireright': 32,
  'goodhire': 28,
  'certn': 30,
  'internal': 15, // Internal cost for HRM8 native reference checks
};

function getCheckPrice(checkType: string): number {
  return BACKGROUND_CHECK_PRICING[checkType as keyof typeof BACKGROUND_CHECK_PRICING] || 49;
}

function getProviderCost(provider: string): number {
  return PROVIDER_COSTS[provider as keyof typeof PROVIDER_COSTS] || 25;
}

export function getBackgroundCheckRevenueMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): RevenueMetrics {
  let checks = getBackgroundChecks().filter(c => c.status === 'completed');
  
  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const completedDate = new Date(c.completedDate || c.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }
  
  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }
  
  const totalRevenue = checks.reduce((sum, c) => sum + (c.cost || 0), 0);
  const totalCosts = checks.reduce((sum, c) => sum + getProviderCost(c.provider), 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
  
  // Calculate revenue by type
  const revenueByType: Record<string, number> = {};
  checks.forEach(c => {
    // Use the first check type as primary type for revenue breakdown
    const type = c.checkTypes[0]?.type || 'unknown';
    revenueByType[type] = (revenueByType[type] || 0) + (c.cost || 0);
  });
  
  // Calculate unique clients
  const uniqueClients = new Set(checks.map(c => c.billedTo)).size;
  const revenuePerClient = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;
  
  // Mock month-over-month growth
  const monthOverMonthGrowth = 15.3;
  
  return {
    totalRevenue,
    revenueByType,
    monthOverMonthGrowth,
    revenuePerClient,
    profitMargin,
  };
}

export function getBackgroundCheckUsageMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): UsageMetrics {
  let checks = getBackgroundChecks();
  
  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= dateRange.from && createdDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }
  
  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }
  
  const totalVolume = checks.length;
  
  // Calculate volume by location
  const locationMap = new Map<string, GeographicData>();
  checks.forEach(c => {
    const key = `${c.country || 'Unknown'}-${c.region || 'Unknown'}`;
    const existing = locationMap.get(key);
    const revenue = c.status === 'completed' ? (c.cost || 0) : 0;
    
    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: c.country || 'Unknown',
        region: c.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });
  
  const volumeByLocation = Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
  
  // Calculate top clients
  const clientMap = new Map<string, ClientRevenueData>();
  checks.forEach(c => {
    const clientId = c.billedTo || 'unknown';
    const clientName = c.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = c.status === 'completed' ? (c.cost || 0) : 0;
    
    if (existing) {
      existing.volume++;
      existing.revenue += revenue;
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      clientMap.set(clientId, {
        clientId,
        clientName,
        volume: 1,
        revenue,
        avgPrice: revenue,
      });
    }
  });
  
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Mock client adoption rate
  const totalPossibleClients = 100;
  const activeClients = new Set(checks.map(c => c.billedTo)).size;
  const clientAdoptionRate = (activeClients / totalPossibleClients) * 100;
  
  return {
    totalVolume,
    volumeByLocation,
    clientAdoptionRate,
    topClients,
  };
}

export function getBackgroundCheckProfitability(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): ProfitabilityMetrics {
  let checks = getBackgroundChecks().filter(c => c.status === 'completed');
  
  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const completedDate = new Date(c.completedDate || c.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }
  
  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }
  
  const totalRevenue = checks.reduce((sum, c) => sum + (c.cost || 0), 0);
  const providerCosts = checks.reduce((sum, c) => sum + getProviderCost(c.provider), 0);
  const internalCosts = checks.length * 8; // Mock internal operational cost per check
  const netProfit = totalRevenue - providerCosts - internalCosts;
  const costPerUnit = checks.length > 0 ? (providerCosts + internalCosts) / checks.length : 0;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    providerCosts,
    internalCosts,
    netProfit,
    costPerUnit,
    marginPercentage,
  };
}

export function getBackgroundCheckRevenueTrends(): TrendData[] {
  const checks = getBackgroundChecks();
  const monthMap = new Map<string, TrendData>();
  
  // Generate last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push(monthKey);
    monthMap.set(monthKey, {
      month: monthKey,
      revenue: 0,
      volume: 0,
      profit: 0,
      newClients: 0,
    });
  }
  
  // Populate with check data
  checks.forEach(c => {
    const date = new Date(c.completedDate || c.createdAt);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const data = monthMap.get(monthKey);
    
    if (data && c.status === 'completed') {
      const revenue = c.cost || 0;
      const cost = getProviderCost(c.provider) + 8;
      data.revenue += revenue;
      data.volume++;
      data.profit += (revenue - cost);
    }
  });
  
  // Mock new clients per month
  monthMap.forEach((data) => {
    data.newClients = Math.floor(Math.random() * 4) + 1;
  });
  
  return months.map(m => monthMap.get(m)!);
}

export function getRevenueByTypeDistribution(): TypeDistribution[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const typeMap = new Map<string, TypeDistribution>();
  
  checks.forEach(c => {
    // Use the first check type as primary type for revenue breakdown
    const type = c.checkTypes[0]?.type || 'unknown';
    const existing = typeMap.get(type);
    const revenue = c.cost || 0;
    const providerCost = getProviderCost(c.provider);
    
    if (existing) {
      existing.revenue += revenue;
      existing.volume++;
      existing.providerCost = (existing.providerCost || 0) + providerCost;
      existing.profit = existing.revenue - (existing.providerCost || 0);
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      typeMap.set(type, {
        type: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        revenue,
        volume: 1,
        avgPrice: revenue,
        providerCost,
        profit: revenue - providerCost,
      });
    }
  });
  
  return Array.from(typeMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export function getTopClientsByRevenue(limit: number = 10): ClientRevenueData[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const clientMap = new Map<string, ClientRevenueData>();
  
  checks.forEach(c => {
    const clientId = c.billedTo || 'unknown';
    const clientName = c.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = c.cost || 0;
    
    if (existing) {
      existing.volume++;
      existing.revenue += revenue;
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      clientMap.set(clientId, {
        clientId,
        clientName,
        volume: 1,
        revenue,
        avgPrice: revenue,
      });
    }
  });
  
  return Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getGeographicRevenueDistribution(): GeographicData[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const locationMap = new Map<string, GeographicData>();
  
  checks.forEach(c => {
    const key = c.country || 'Unknown';
    const existing = locationMap.get(key);
    const revenue = c.cost || 0;
    
    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: c.country || 'Unknown',
        region: c.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });
  
  return Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
}

export function getClientLifetimeValues(): ClientLifetimeValue[] {
  const checks = getBackgroundChecks();
  const clientMap = new Map<string, {
    name: string;
    revenue: number;
    transactions: number;
    firstDate: Date;
    lastDate: Date;
  }>();

  // Group by client
  checks.forEach((check) => {
    const clientId = check.billedTo || 'unknown';
    const clientName = check.billedToName || 'Unknown Client';
    const revenue = check.status === 'completed' ? (check.cost || 0) : 0;
    const date = new Date(check.createdAt);

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        name: clientName,
        revenue: 0,
        transactions: 0,
        firstDate: date,
        lastDate: date,
      });
    }

    const client = clientMap.get(clientId)!;
    client.revenue += revenue;
    client.transactions += 1;
    client.lastDate = date > client.lastDate ? date : client.lastDate;
    client.firstDate = date < client.firstDate ? date : client.firstDate;
  });

  // Calculate CLV metrics
  const clvData: ClientLifetimeValue[] = [];
  clientMap.forEach((data, clientId) => {
    const monthsActive = Math.max(1, 
      Math.floor((data.lastDate.getTime() - data.firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    const avgMonthlyRevenue = data.revenue / monthsActive;
    const avgTransactionValue = data.revenue / data.transactions;
    
    // Simple prediction: average monthly revenue * growth factor
    const growthFactor = data.transactions > 5 ? 1.1 : data.transactions > 2 ? 1.05 : 1.0;
    const predictedNextMonth = avgMonthlyRevenue * growthFactor;
    const predictedAnnual = predictedNextMonth * 12;
    
    // Retention probability based on recency and frequency
    const daysSinceLastPurchase = Math.floor((Date.now() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const retentionProbability = Math.max(20, Math.min(95, 
      100 - (daysSinceLastPurchase / 10) + (data.transactions * 2)
    ));

    // Determine trend
    let trend: 'growing' | 'stable' | 'declining' = 'stable';
    if (growthFactor > 1.05) trend = 'growing';
    else if (daysSinceLastPurchase > 60) trend = 'declining';

    clvData.push({
      clientId,
      clientName: data.name,
      totalRevenue: data.revenue,
      monthsActive,
      averageMonthlyRevenue: avgMonthlyRevenue,
      predictedNextMonthRevenue: predictedNextMonth,
      predictedAnnualRevenue: predictedAnnual,
      retentionProbability,
      lastPurchaseDate: data.lastDate.toISOString(),
      totalTransactions: data.transactions,
      averageTransactionValue: avgTransactionValue,
      trend,
    });
  });

  return clvData.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getRetentionMetrics(): RetentionMetrics {
  const clvData = getClientLifetimeValues();
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const activeClients = clvData.filter(c => 
    new Date(c.lastPurchaseDate).getTime() > thirtyDaysAgo
  ).length;

  const churnedClients = clvData.length - activeClients;
  const retentionRate = clvData.length > 0 ? (activeClients / clvData.length) * 100 : 0;
  const avgLifespan = clvData.reduce((sum, c) => sum + c.monthsActive, 0) / clvData.length;

  // Group by tenure
  const tenureBuckets = {
    '0-3 months': 0,
    '3-6 months': 0,
    '6-12 months': 0,
    '12+ months': 0,
  };

  clvData.forEach(c => {
    if (c.monthsActive <= 3) tenureBuckets['0-3 months']++;
    else if (c.monthsActive <= 6) tenureBuckets['3-6 months']++;
    else if (c.monthsActive <= 12) tenureBuckets['6-12 months']++;
    else tenureBuckets['12+ months']++;
  });

  return {
    totalClients: clvData.length,
    activeClients,
    churnedClients,
    retentionRate,
    averageClientLifespan: avgLifespan,
    clientsByTenure: Object.entries(tenureBuckets).map(([tenure, count]) => ({ tenure, count })),
  };
}
import type { AIReferenceCheckSession } from '@/shared/types/aiReferenceCheck';

const AI_SESSIONS_KEY = 'hrm8_ai_reference_sessions';

function initializeStorage() {
  if (!localStorage.getItem(AI_SESSIONS_KEY)) {
    localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify([]));
  }
}

export function saveAISession(session: AIReferenceCheckSession): void {
  initializeStorage();
  const sessions = getAISessions();
  sessions.push(session);
  localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(sessions));
}

export function getAISessions(): AIReferenceCheckSession[] {
  initializeStorage();
  const data = localStorage.getItem(AI_SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAISessionById(id: string): AIReferenceCheckSession | undefined {
  return getAISessions().find(session => session.id === id);
}

export function getAISessionsByReferee(refereeId: string): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.refereeId === refereeId);
}

export function getAISessionsByCandidate(candidateId: string): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.candidateId === candidateId);
}

export function getAISessionsByBackgroundCheck(backgroundCheckId: string): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.backgroundCheckId === backgroundCheckId);
}

export function updateAISession(id: string, updates: Partial<AIReferenceCheckSession>): void {
  const sessions = getAISessions();
  const index = sessions.findIndex(session => session.id === id);
  if (index !== -1) {
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(sessions));
  }
}

export function deleteAISession(id: string): void {
  const sessions = getAISessions();
  const filtered = sessions.filter(session => session.id !== id);
  localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(filtered));
}

export function getActiveAISessions(): AIReferenceCheckSession[] {
  return getAISessions().filter(session => 
    session.status === 'scheduled' || session.status === 'in-progress'
  );
}

export function getCompletedAISessions(): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.status === 'completed');
}

export function getAISessionsByStatus(status: AIReferenceCheckSession['status']): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.status === status);
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EditableReport, AITranscriptionSummary } from '@/shared/types/aiReferenceReport';
import type { AIReferenceCheckSession } from '@/shared/types/aiReferenceCheck';
import { getRecommendationLabel } from './aiSummaryService';

interface PDFExportOptions {
  includeTranscript?: boolean;
  includeMetadata?: boolean;
  includeSignature?: boolean;
}

export function exportAIReferencePDF(
  report: EditableReport,
  session: AIReferenceCheckSession,
  options: PDFExportOptions = {}
): void {
  const {
    includeTranscript = false,
    includeMetadata = true,
    includeSignature = true,
  } = options;

  const doc = new jsPDF('p', 'mm', 'a4');
  const summary = report.summary;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let yPos = margin;
  let pageNumber = 1;

  // Helper function to add page header
  const addPageHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Reference Check Report', margin, 10);
    doc.text(`${summary.candidateName}`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(200);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // Helper function to add page footer
  const addPageFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text(new Date().toLocaleDateString(), margin, pageHeight - 10);
    pageNumber++;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      addPageFooter();
      doc.addPage();
      yPos = 20;
      addPageHeader();
      yPos = 20;
    }
  };

  // Helper function to add section title
  const addSectionTitle = (title: string) => {
    checkNewPage(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 103, 243); // Primary color
    doc.text(title, margin, yPos);
    yPos += 8;
    doc.setDrawColor(91, 103, 243);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  };

  // Helper function to add body text
  const addBodyText = (text: string, indent = 0) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    
    for (const line of lines) {
      checkNewPage(7);
      doc.text(line, margin + indent, yPos);
      yPos += 6;
    }
    yPos += 2;
  };

  // Helper function to add bullet point
  const addBullet = (text: string, level = 0) => {
    const indent = level * 10;
    checkNewPage(7);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.circle(margin + indent + 2, yPos - 1.5, 1, 'F');
    const lines = doc.splitTextToSize(text, contentWidth - indent - 10);
    doc.text(lines, margin + indent + 6, yPos);
    yPos += lines.length * 6 + 2;
  };

  // Helper function to draw score bar
  const drawScoreBar = (score: number, maxScore: number, label: string) => {
    checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.text(label, margin, yPos);
    yPos += 5;

    const barWidth = 100;
    const barHeight = 6;
    const fillWidth = (score / maxScore) * barWidth;

    // Background
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPos, barWidth, barHeight, 'F');

    // Fill based on score
    let fillColor: [number, number, number] = [91, 103, 243]; // Primary blue
    if (score / maxScore >= 0.8) {
      fillColor = [34, 197, 94]; // Green
    } else if (score / maxScore >= 0.6) {
      fillColor = [59, 130, 246]; // Blue
    } else if (score / maxScore >= 0.4) {
      fillColor = [251, 146, 60]; // Orange
    } else {
      fillColor = [239, 68, 68]; // Red
    }

    doc.setFillColor(...fillColor);
    doc.rect(margin, yPos, fillWidth, barHeight, 'F');

    // Score text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}/${maxScore}`, margin + barWidth + 5, yPos + 4);
    yPos += 12;
  };

  // Helper function to add severity badge
  const addSeverityBadge = (severity: 'critical' | 'moderate' | 'minor') => {
    const colors: Record<typeof severity, [number, number, number]> = {
      critical: [239, 68, 68],
      moderate: [251, 146, 60],
      minor: [250, 204, 21],
    };

    const color = colors[severity];
    doc.setFillColor(...color);
    doc.roundedRect(margin, yPos - 3, 25, 6, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(severity.toUpperCase(), margin + 12.5, yPos + 1, { align: 'center' });
    doc.setTextColor(50);
  };

  // ==================== COVER PAGE ====================
  doc.setFillColor(91, 103, 243);
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('REFERENCE CHECK', pageWidth / 2, 40, { align: 'center' });
  doc.text('REPORT', pageWidth / 2, 52, { align: 'center' });

  yPos = 100;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Candidate Information', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoData = [
    ['Candidate:', summary.candidateName],
    ['Referee:', summary.refereeInfo.name],
    ['Relationship:', summary.refereeInfo.relationship],
    ['Company:', summary.refereeInfo.companyName],
  ];

  if (summary.refereeInfo.yearsKnown) {
    infoData.push(['Years Known:', summary.refereeInfo.yearsKnown]);
  }

  infoData.push(
    ['Interview Mode:', summary.sessionDetails.mode],
    ['Duration:', `${Math.round(summary.sessionDetails.duration / 60)} minutes`],
    ['Questions Asked:', summary.sessionDetails.questionsAsked.toString()],
    ['Completed:', new Date(summary.sessionDetails.completedAt).toLocaleDateString()],
  );

  autoTable(doc, {
    startY: yPos,
    body: infoData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Report Metadata
  if (includeMetadata) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Information', margin, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      body: [
        ['Report ID:', report.id],
        ['Generated:', new Date(summary.generatedAt).toLocaleString()],
        ['Status:', report.status.toUpperCase()],
        ['Version:', report.version.toString()],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
    });
  }

  // ==================== NEW PAGE: EXECUTIVE SUMMARY ====================
  addPageFooter();
  doc.addPage();
  yPos = 20;
  addPageHeader();
  yPos = 25;

  addSectionTitle('Executive Summary');
  addBodyText(summary.executiveSummary);

  // Overall Score Visual
  yPos += 5;
  checkNewPage(40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Assessment', margin, yPos);
  yPos += 8;

  // Score circle
  const centerX = pageWidth / 2;
  const radius = 20;
  doc.setDrawColor(200);
  doc.setLineWidth(3);
  doc.circle(centerX, yPos + radius, radius);

  const scoreAngle = (summary.recommendation.overallScore / 100) * 360;
  doc.setDrawColor(91, 103, 243);
  doc.setLineWidth(3);
  
  // Draw arc for score
  for (let i = 0; i < scoreAngle; i++) {
    const angle = (i - 90) * (Math.PI / 180);
    const x1 = centerX + radius * Math.cos(angle);
    const y1 = yPos + radius + radius * Math.sin(angle);
    doc.circle(x1, y1, 0.5, 'F');
  }

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 103, 243);
  doc.text(`${summary.recommendation.overallScore}`, centerX, yPos + radius + 2, { align: 'center' });
  doc.setFontSize(10);
  doc.text('/100', centerX, yPos + radius + 8, { align: 'center' });

  yPos += radius * 2 + 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Recommendation:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(getRecommendationLabel(summary.recommendation.hiringRecommendation), margin + 45, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Confidence:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${Math.round(summary.recommendation.confidenceLevel * 100)}%`, margin + 45, yPos);
  yPos += 10;

  // ==================== KEY FINDINGS ====================
  addSectionTitle('Key Findings');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green
  doc.text('Strengths', margin, yPos);
  yPos += 7;

  summary.keyFindings.strengths.forEach((strength) => {
    addBullet(strength);
  });

  yPos += 3;
  doc.setTextColor(239, 68, 68); // Red
  doc.text('Concerns', margin, yPos);
  yPos += 7;

  if (summary.keyFindings.concerns.length > 0) {
    summary.keyFindings.concerns.forEach((concern) => {
      addBullet(concern);
    });
  } else {
    addBodyText('No significant concerns identified.');
  }

  if (summary.keyFindings.neutralObservations.length > 0) {
    yPos += 3;
    doc.setTextColor(100, 116, 139); // Gray
    doc.text('Additional Observations', margin, yPos);
    yPos += 7;

    summary.keyFindings.neutralObservations.forEach((obs) => {
      addBullet(obs);
    });
  }

  // ==================== CATEGORY BREAKDOWN ====================
  addSectionTitle('Category Analysis');

  summary.categoryBreakdown.forEach((category) => {
    checkNewPage(35);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text(category.category, margin, yPos);
    yPos += 7;

    drawScoreBar(category.score, 5, '');
    
    addBodyText(category.summary);

    if (category.evidence.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text('Supporting Evidence:', margin, yPos);
      yPos += 6;

      category.evidence.forEach((evidence) => {
        checkNewPage(10);
        doc.setFontSize(9);
        doc.setTextColor(100);
        const evidenceText = `"${evidence}"`;
        const lines = doc.splitTextToSize(evidenceText, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
    }

    yPos += 5;
  });

  // ==================== CONVERSATION HIGHLIGHTS ====================
  addSectionTitle('Conversation Highlights');

  summary.conversationHighlights.forEach((highlight, index) => {
    checkNewPage(40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 103, 243);
    doc.text(`Highlight ${index + 1}`, margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text('Q:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const qLines = doc.splitTextToSize(highlight.question, contentWidth - 10);
    doc.text(qLines, margin + 8, yPos);
    yPos += qLines.length * 6 + 3;

    doc.setFont('helvetica', 'bold');
    doc.text('A:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const aLines = doc.splitTextToSize(highlight.answer, contentWidth - 10);
    doc.text(aLines, margin + 8, yPos);
    yPos += aLines.length * 6 + 3;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(`Significance: ${highlight.significance}`, margin, yPos);
    yPos += 10;
  });

  // ==================== RED FLAGS ====================
  if (summary.redFlags.length > 0) {
    addSectionTitle('Red Flags & Concerns');

    summary.redFlags.forEach((flag) => {
      checkNewPage(25);

      addSeverityBadge(flag.severity);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50);
      const descLines = doc.splitTextToSize(flag.description, contentWidth);
      doc.text(descLines, margin, yPos);
      yPos += descLines.length * 6 + 3;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text('Evidence:', margin, yPos);
      yPos += 5;
      const evidenceLines = doc.splitTextToSize(`"${flag.evidence}"`, contentWidth - 5);
      doc.text(evidenceLines, margin + 5, yPos);
      yPos += evidenceLines.length * 5 + 8;
    });
  }

  // ==================== VERIFICATION ITEMS ====================
  addSectionTitle('Verification Items');

  if (summary.verificationItems.length > 0) {
    summary.verificationItems.forEach((item) => {
      checkNewPage(15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);
      
      const checkbox = item.verified ? '☑' : '☐';
      doc.text(checkbox, margin, yPos);
      
      const claimLines = doc.splitTextToSize(item.claim, contentWidth - 10);
      doc.text(claimLines, margin + 8, yPos);
      yPos += claimLines.length * 6;

      if (item.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'italic');
        const noteLines = doc.splitTextToSize(`Notes: ${item.notes}`, contentWidth - 10);
        doc.text(noteLines, margin + 8, yPos);
        yPos += noteLines.length * 5;
      }
      
      yPos += 5;
    });
  } else {
    addBodyText('No verification items identified.');
  }

  // ==================== FINAL RECOMMENDATION ====================
  addSectionTitle('Final Recommendation');

  doc.setFillColor(240, 249, 255);
  const boxHeight = 45;
  checkNewPage(boxHeight + 10);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Overall Score:', margin + 5, yPos);
  doc.setFontSize(14);
  doc.setTextColor(91, 103, 243);
  doc.text(`${summary.recommendation.overallScore}/100`, margin + 40, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Recommendation:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(getRecommendationLabel(summary.recommendation.hiringRecommendation), margin + 45, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const reasoningLines = doc.splitTextToSize(summary.recommendation.reasoningSummary, contentWidth - 10);
  doc.text(reasoningLines, margin + 5, yPos);
  yPos += boxHeight - 24 + 10;

  // ==================== OPTIONAL: FULL TRANSCRIPT ====================
  if (includeTranscript && session.transcript) {
    addSectionTitle('Full Interview Transcript');

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Total conversation turns: ${session.transcript.turns.length}`, margin, yPos);
    yPos += 10;

    session.transcript.turns.forEach((turn, index) => {
      checkNewPage(20);

      const speaker = turn.speaker === 'ai-recruiter' ? 'AI Recruiter' : 'Referee';
      const timestamp = `${Math.floor(turn.timestamp / 60)}:${String(Math.floor(turn.timestamp % 60)).padStart(2, '0')}`;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      if (turn.speaker === 'ai-recruiter') {
        doc.setTextColor(59, 130, 246);
      } else {
        doc.setTextColor(100, 116, 139);
      }
      doc.text(`[${timestamp}] ${speaker}:`, margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);
      const textLines = doc.splitTextToSize(turn.text, contentWidth - 5);
      doc.text(textLines, margin + 5, yPos);
      yPos += textLines.length * 5 + 5;
    });
  }

  // ==================== SIGNATURE SECTION ====================
  if (includeSignature) {
    checkNewPage(40);
    yPos += 10;
    
    doc.setDrawColor(200);
    doc.line(margin, yPos, margin + 60, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Reviewed By', margin, yPos);
    
    yPos -= 5;
    doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
    yPos += 5;
    doc.text('Date', pageWidth - margin - 30, yPos, { align: 'center' });
  }

  // Final page footer
  addPageFooter();

  // Save the PDF
  const filename = `Reference_Check_${summary.candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
import type { EditableReport } from '@/shared/types/aiReferenceReport';

const AI_REPORTS_KEY = 'hrm8_ai_reports';

function initializeStorage() {
  if (!localStorage.getItem(AI_REPORTS_KEY)) {
    localStorage.setItem(AI_REPORTS_KEY, JSON.stringify([]));
  }
}

export function saveAIReport(report: EditableReport): void {
  initializeStorage();
  const reports = getAIReports();
  
  // Check if report already exists and update it
  const existingIndex = reports.findIndex(r => r.id === report.id);
  if (existingIndex !== -1) {
    reports[existingIndex] = {
      ...report,
      updatedAt: new Date().toISOString(),
    };
  } else {
    reports.push(report);
  }
  
  localStorage.setItem(AI_REPORTS_KEY, JSON.stringify(reports));
}

export function getAIReports(): EditableReport[] {
  initializeStorage();
  const data = localStorage.getItem(AI_REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getReportById(reportId: string): EditableReport | undefined {
  return getAIReports().find(r => r.id === reportId);
}

export function getReportBySessionId(sessionId: string): EditableReport | undefined {
  return getAIReports().find(r => r.sessionId === sessionId);
}

export function getReportsByCandidateId(candidateId: string): EditableReport[] {
  const allReports = getAIReports();
  return allReports.filter(r => r.summary.candidateId === candidateId);
}

export function updateAIReport(reportId: string, updates: Partial<EditableReport>): void {
  const reports = getAIReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index !== -1) {
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(AI_REPORTS_KEY, JSON.stringify(reports));
  }
}

export function deleteAIReport(reportId: string): void {
  const reports = getAIReports();
  const filtered = reports.filter(r => r.id !== reportId);
  localStorage.setItem(AI_REPORTS_KEY, JSON.stringify(filtered));
}

export function finalizeReport(reportId: string, finalizedBy: string): void {
  updateAIReport(reportId, {
    status: 'finalized',
    summary: {
      ...getReportById(reportId)!.summary,
      lastEditedBy: finalizedBy,
      lastEditedAt: new Date().toISOString(),
    },
  });
}

export function getReportsByStatus(status: EditableReport['status']): EditableReport[] {
  return getAIReports().filter(r => r.status === status);
}

export function getDraftReports(): EditableReport[] {
  return getReportsByStatus('draft');
}

export function getReviewedReports(): EditableReport[] {
  return getReportsByStatus('reviewed');
}

export function getFinalizedReports(): EditableReport[] {
  return getReportsByStatus('finalized');
}

export function getRecentReports(limit: number = 10): EditableReport[] {
  return getAIReports()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function searchReports(query: string): EditableReport[] {
  const lowerQuery = query.toLowerCase();
  return getAIReports().filter(r => 
    r.summary.candidateName.toLowerCase().includes(lowerQuery) ||
    r.summary.refereeInfo.name.toLowerCase().includes(lowerQuery) ||
    r.summary.executiveSummary.toLowerCase().includes(lowerQuery)
  );
}

export function getReportStats() {
  const reports = getAIReports();
  return {
    total: reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    finalized: reports.filter(r => r.status === 'finalized').length,
    avgRecommendationScore: reports.length > 0
      ? reports.reduce((sum, r) => sum + r.summary.recommendation.overallScore, 0) / reports.length
      : 0,
  };
}
import type { AIReferenceCheckSession, InterviewTranscript, AIAnalysis } from '@/shared/types/aiReferenceCheck';
import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

// Frontend-only mock implementation - actual AI integration deferred for backend phase
export async function generateTranscriptionSummary(
  session: AIReferenceCheckSession,
  transcript: InterviewTranscript,
  analysis: AIAnalysis,
  candidateName: string,
  refereeInfo: {
    name: string;
    relationship: string;
    companyName: string;
    yearsKnown?: string;
  }
): Promise<AITranscriptionSummary> {
  try {
    console.log('Generating transcription summary for session (mock):', session.id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock summary based on the analysis data
    const summary: AITranscriptionSummary = {
      sessionId: session.id,
      candidateId: session.candidateId,
      candidateName,
      refereeInfo,
      sessionDetails: {
        mode: (session.mode === 'questionnaire' ? 'phone' : session.mode) as 'video' | 'phone',
        duration: session.duration || 0,
        completedAt: session.completedAt || new Date().toISOString(),
        questionsAsked: transcript.turns.filter(t => t.speaker === 'ai-recruiter').length,
      },
      executiveSummary: `Based on a comprehensive ${session.mode} interview with ${refereeInfo.name} (${refereeInfo.relationship} at ${refereeInfo.companyName}), ${candidateName} demonstrates strong professional capabilities. The conversation revealed consistent patterns of reliability, technical competence, and positive interpersonal skills. ${refereeInfo.name} provided detailed examples of ${candidateName}'s contributions and impact on team outcomes.`,
      keyFindings: {
        strengths: analysis.strengths.length > 0 ? analysis.strengths : [
          'Strong technical skills and problem-solving ability',
          'Excellent communication and collaboration with team members',
          'Consistent reliability and meeting deadlines'
        ],
        concerns: analysis.concerns.length > 0 ? analysis.concerns : [],
        neutralObservations: [
          'Relatively short tenure in current role',
          'Limited experience with specific tools mentioned in job requirements'
        ]
      },
      categoryBreakdown: analysis.categories.map(cat => ({
        category: cat.category,
        score: cat.score,
        summary: `${candidateName} demonstrated ${cat.score >= 4 ? 'excellent' : cat.score >= 3 ? 'good' : 'satisfactory'} performance in ${cat.category.toLowerCase()}.`,
        evidence: cat.evidence.slice(0, 3)
      })),
      conversationHighlights: transcript.turns
        .filter(t => t.speaker === 'referee')
        .slice(0, 5)
        .map((turn, idx) => ({
          question: transcript.turns[idx * 2]?.text || 'Question about candidate performance',
          answer: turn.text,
          significance: 'This response provides valuable insight into the candidate\'s capabilities',
          timestamp: turn.timestamp
        })),
      redFlags: analysis.concerns.length > 0 ? [{
        description: analysis.concerns[0],
        severity: 'moderate' as const,
        evidence: 'Mentioned during discussion of team dynamics'
      }] : [],
      verificationItems: [
        { claim: 'Employment dates', verified: true, notes: 'Confirmed by referee' },
        { claim: 'Job title', verified: true, notes: 'Matches candidate claims' }
      ],
      recommendation: {
        overallScore: analysis.overallRating * 20,
        hiringRecommendation: analysis.recommendationScore >= 80 ? 'strongly-recommend' :
                            analysis.recommendationScore >= 60 ? 'recommend' :
                            analysis.recommendationScore >= 40 ? 'neutral' :
                            analysis.recommendationScore >= 20 ? 'concerns' : 'not-recommend',
        confidenceLevel: analysis.aiConfidence,
        reasoningSummary: `Based on the comprehensive interview, ${candidateName} receives a ${analysis.recommendationScore >= 80 ? 'strong recommendation' : analysis.recommendationScore >= 60 ? 'positive recommendation' : 'conditional recommendation'}. The assessment reveals consistent strengths in key competency areas with ${analysis.concerns.length > 0 ? 'some areas for development' : 'no significant concerns'}. The referee's detailed responses and examples provide reliable insight into the candidate's professional capabilities.`
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai',
    };

    console.log('Successfully generated mock transcription summary');
    return summary;
  } catch (error) {
    console.error('Error in generateTranscriptionSummary:', error);
    throw error;
  }
}

export function calculateReportCompleteness(summary: AITranscriptionSummary): number {
  let score = 0;
  const maxScore = 10;

  if (summary.executiveSummary && summary.executiveSummary.length > 100) score += 2;
  if (summary.keyFindings.strengths.length > 0) score += 1;
  if (summary.keyFindings.concerns.length > 0) score += 1;
  if (summary.categoryBreakdown.length >= 4) score += 2;
  if (summary.conversationHighlights.length >= 3) score += 2;
  if (summary.recommendation.reasoningSummary && summary.recommendation.reasoningSummary.length > 50) score += 2;

  return Math.round((score / maxScore) * 100);
}

export function getRecommendationLabel(recommendation: AITranscriptionSummary['recommendation']['hiringRecommendation']): string {
  const labels: Record<typeof recommendation, string> = {
    'strongly-recommend': 'Strongly Recommend',
    'recommend': 'Recommend',
    'neutral': 'Neutral',
    'concerns': 'Some Concerns',
    'not-recommend': 'Not Recommended',
  };
  return labels[recommendation];
}

export function getRecommendationColor(recommendation: AITranscriptionSummary['recommendation']['hiringRecommendation']): string {
  const colors: Record<typeof recommendation, string> = {
    'strongly-recommend': 'text-green-600 dark:text-green-400',
    'recommend': 'text-blue-600 dark:text-blue-400',
    'neutral': 'text-yellow-600 dark:text-yellow-400',
    'concerns': 'text-orange-600 dark:text-orange-400',
    'not-recommend': 'text-red-600 dark:text-red-400',
  };
  return colors[recommendation];
}

export function getSeverityColor(severity: 'critical' | 'moderate' | 'minor'): string {
  const colors = {
    critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    moderate: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30',
    minor: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
  };
  return colors[severity];
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  TrendDataPoint,
  CheckTypeMetrics,
  RecruiterPerformance,
  BottleneckInsight,
  PredictiveMetrics
} from './analyticsService';

export function exportAnalyticsReport(
  trendsData: TrendDataPoint[],
  checkTypeData: CheckTypeMetrics[],
  recruiterData: RecruiterPerformance[],
  bottleneckData: BottleneckInsight[],
  predictiveData: PredictiveMetrics,
  dateRange: string
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add page header
  const addHeader = (title: string) => {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Background Checks Analytics Report | ${dateRange}`, pageWidth / 2, 10, { align: 'center' });
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 12, pageWidth - 15, 12);
  };

  // Helper function to add page footer
  const addFooter = (pageNum: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text('Confidential', pageWidth - 15, pageHeight - 10, { align: 'right' });
  };

  // Helper to check if new page is needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
      addHeader('Background Checks Analytics Report');
      return true;
    }
    return false;
  };

  // Cover Page
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 80, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.text('Background Checks', pageWidth / 2, 35, { align: 'center' });
  pdf.text('Analytics Report', pageWidth / 2, 50, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text(dateRange, pageWidth / 2, 65, { align: 'center' });
  
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 100, { align: 'center' });

  // Executive Summary
  pdf.addPage();
  yPos = 20;
  addHeader('Executive Summary');
  
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Executive Summary', 15, yPos);
  yPos += 15;

  // Predictive Metrics Summary
  pdf.setFontSize(12);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Process Efficiency Overview', 15, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
      const efficiencyColor = predictiveData.efficiency >= 80 ? [34, 197, 94] as [number, number, number] : 
                          predictiveData.efficiency >= 60 ? [234, 179, 8] as [number, number, number] : [239, 68, 68] as [number, number, number];
  
  pdf.setFillColor(...efficiencyColor);
  pdf.roundedRect(15, yPos, 50, 15, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`${predictiveData.efficiency}%`, 40, yPos + 10, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('Efficiency Score', 40, yPos + 14, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.text(`Predicted Completion Time: ${predictiveData.predictedCompletionTime} days`, 70, yPos + 8);
  yPos += 25;

  // Risk Factors Summary
  if (predictiveData.riskFactors.length > 0) {
    pdf.setFontSize(12);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Key Risk Factors', 15, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    predictiveData.riskFactors.slice(0, 5).forEach(risk => {
      pdf.text(`• ${risk.factor}: ${risk.impact.toFixed(1)}% impact`, 20, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  addFooter(2);

  // Trends Analysis
  pdf.addPage();
  yPos = 20;
  addHeader('Trends Analysis');
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Volume & Completion Trends', 15, yPos);
  yPos += 10;

  const trendsTableData = trendsData.slice(-10).map(point => [
    new Date(point.date).toLocaleDateString(),
    point.totalChecks.toString(),
    point.completed.toString(),
    point.inProgress.toString(),
    `${point.completionRate.toFixed(1)}%`,
    `${point.avgCompletionTime} days`
  ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Date', 'Total', 'Completed', 'In Progress', 'Completion Rate', 'Avg. Time']],
    body: trendsTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;
  addFooter(3);

  // Check Type Comparison
  checkNewPage(80);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Check Type Performance', 15, yPos);
  yPos += 10;

  const checkTypeTableData = checkTypeData.map(ct => [
    ct.type,
    ct.total.toString(),
    ct.completed.toString(),
    `${ct.avgTime} days`,
    `${ct.successRate.toFixed(1)}%`,
    `$${ct.cost}`
  ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Check Type', 'Total', 'Completed', 'Avg. Time', 'Success Rate', 'Cost']],
    body: checkTypeTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;
  addFooter(4);

  // Recruiter Performance
  pdf.addPage();
  yPos = 20;
  addHeader('Recruiter Performance');
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Individual Recruiter Metrics', 15, yPos);
  yPos += 10;

  const recruiterTableData = recruiterData.map(r => [
    r.recruiterName,
    r.totalInitiated.toString(),
    `${r.avgCompletionTime} days`,
    `${r.completionRate.toFixed(1)}%`,
    `${r.onTimeRate.toFixed(1)}%`,
    `${r.qualityScore.toFixed(1)}%`
  ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Recruiter', 'Initiated', 'Avg. Time', 'Completion', 'On-Time', 'Quality']],
    body: recruiterTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;
  addFooter(5);

  // Bottleneck Analysis
  if (bottleneckData.length > 0) {
    checkNewPage(100);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Bottleneck Analysis', 15, yPos);
    yPos += 10;

    bottleneckData.forEach((bottleneck, index) => {
      checkNewPage(35);
      
      const severityColors: Record<string, [number, number, number]> = {
        high: [239, 68, 68],
        medium: [234, 179, 8],
        low: [34, 197, 94]
      };
      
      const color = severityColors[bottleneck.severity] || [200, 200, 200] as [number, number, number];
      pdf.setFillColor(...color);
      pdf.roundedRect(15, yPos, 5, 5, 1, 1, 'F');
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(bottleneck.stage, 22, yPos + 4);
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Avg. Duration: ${bottleneck.avgDuration} days | Checks Affected: ${bottleneck.checksAffected}`, 22, yPos + 9);
      
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      const splitRec = pdf.splitTextToSize(bottleneck.recommendation, pageWidth - 40);
      pdf.text(splitRec, 22, yPos + 14);
      
      yPos += 30;
    });

    addFooter(6);
  }

  // Save the PDF
  pdf.save(`background-checks-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
}
import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import { calculateSLAStatus } from './slaService';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface TrendDataPoint {
  date: string;
  totalChecks: number;
  completed: number;
  inProgress: number;
  avgCompletionTime: number;
  completionRate: number;
}

export interface CheckTypeMetrics {
  type: string;
  total: number;
  completed: number;
  avgTime: number;
  successRate: number;
  cost: number;
}

export interface RecruiterPerformance {
  recruiterId: string;
  recruiterName: string;
  totalInitiated: number;
  avgCompletionTime: number;
  completionRate: number;
  onTimeRate: number;
  qualityScore: number;
}

export interface BottleneckInsight {
  stage: string;
  avgDuration: number;
  checksAffected: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PredictiveMetrics {
  predictedCompletionTime: number;
  riskFactors: { factor: string; impact: number }[];
  bottlenecks: BottleneckInsight[];
  efficiency: number;
}

export function getTrendsData(days: number = 30): TrendDataPoint[] {
  const checks = getBackgroundChecks();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const dataPoints: TrendDataPoint[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const checksUpToDate = checks.filter(c => new Date(c.initiatedDate) <= date);
    const completedUpToDate = checksUpToDate.filter(c => c.completedDate && new Date(c.completedDate) <= date);
    const inProgressAtDate = checksUpToDate.filter(c => 
      !c.completedDate || new Date(c.completedDate) > date
    );
    
    const avgTime = completedUpToDate.length > 0
      ? completedUpToDate.reduce((sum, c) => {
          const initiated = new Date(c.initiatedDate);
          const completed = new Date(c.completedDate!);
          return sum + Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completedUpToDate.length
      : 0;
    
    dataPoints.push({
      date: dateStr,
      totalChecks: checksUpToDate.length,
      completed: completedUpToDate.length,
      inProgress: inProgressAtDate.length,
      avgCompletionTime: Math.round(avgTime),
      completionRate: checksUpToDate.length > 0 ? (completedUpToDate.length / checksUpToDate.length) * 100 : 0
    });
  }
  
  return dataPoints;
}

export function getCheckTypeComparison(): CheckTypeMetrics[] {
  const checks = getBackgroundChecks();
  const typeMap = new Map<string, BackgroundCheck[]>();
  
  checks.forEach(check => {
    check.checkTypes.forEach(ct => {
      if (!typeMap.has(ct.type)) {
        typeMap.set(ct.type, []);
      }
      typeMap.get(ct.type)!.push(check);
    });
  });
  
  const metrics: CheckTypeMetrics[] = [];
  
  typeMap.forEach((checksWithType, type) => {
    const completed = checksWithType.filter(c => c.status === 'completed');
    const avgTime = completed.length > 0
      ? completed.reduce((sum, c) => {
          const initiated = new Date(c.initiatedDate);
          const completedDate = new Date(c.completedDate!);
          return sum + Math.floor((completedDate.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completed.length
      : 0;
    
    const clear = checksWithType.filter(c => c.overallStatus === 'clear');
    
    const costMap: Record<string, number> = {
      'reference': 69,
      'criminal': 49,
      'identity': 39,
      'education': 59,
      'employment': 59,
      'credit': 59,
      'drug-screen': 89,
      'professional-license': 59
    };
    
    metrics.push({
      type: formatCheckType(type),
      total: checksWithType.length,
      completed: completed.length,
      avgTime: Math.round(avgTime),
      successRate: checksWithType.length > 0 ? (clear.length / checksWithType.length) * 100 : 0,
      cost: costMap[type] || 59
    });
  });
  
  return metrics.sort((a, b) => b.total - a.total);
}

export function getRecruiterPerformance(): RecruiterPerformance[] {
  const checks = getBackgroundChecks();
  const recruiterMap = new Map<string, BackgroundCheck[]>();
  
  checks.forEach(check => {
    const key = check.initiatedBy;
    if (!recruiterMap.has(key)) {
      recruiterMap.set(key, []);
    }
    recruiterMap.get(key)!.push(check);
  });
  
  const performance: RecruiterPerformance[] = [];
  
  recruiterMap.forEach((recruiterChecks, recruiterId) => {
    const completed = recruiterChecks.filter(c => c.status === 'completed');
    const avgTime = completed.length > 0
      ? completed.reduce((sum, c) => {
          const initiated = new Date(c.initiatedDate);
          const completedDate = new Date(c.completedDate!);
          return sum + Math.floor((completedDate.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completed.length
      : 0;
    
    const completionRate = recruiterChecks.length > 0
      ? (completed.length / recruiterChecks.length) * 100
      : 0;
    
    const onTimeChecks = completed.filter(c => {
      const slaStatus = calculateSLAStatus(c);
      return slaStatus?.slaStatus === 'on-track' || c.status === 'completed';
    });
    
    const onTimeRate = completed.length > 0
      ? (onTimeChecks.length / completed.length) * 100
      : 0;
    
    const clearChecks = recruiterChecks.filter(c => c.overallStatus === 'clear');
    const qualityScore = recruiterChecks.length > 0
      ? (clearChecks.length / recruiterChecks.length) * 100
      : 0;
    
    performance.push({
      recruiterId,
      recruiterName: recruiterChecks[0]?.initiatedByName || 'Unknown',
      totalInitiated: recruiterChecks.length,
      avgCompletionTime: Math.round(avgTime),
      completionRate,
      onTimeRate,
      qualityScore
    });
  });
  
  return performance.sort((a, b) => b.totalInitiated - a.totalInitiated);
}

export function getBottleneckInsights(): BottleneckInsight[] {
  const checks = getBackgroundChecks();
  
  const insights: BottleneckInsight[] = [];
  
  // Analyze consent stage
  const consentChecks = checks.filter(c => c.status === 'pending-consent' || c.consentGiven);
  const consentDurations = consentChecks
    .filter(c => c.consentDate)
    .map(c => {
      const initiated = new Date(c.initiatedDate);
      const consent = new Date(c.consentDate!);
      return Math.floor((consent.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    });
  
  if (consentDurations.length > 0) {
    const avgConsentTime = consentDurations.reduce((a, b) => a + b, 0) / consentDurations.length;
    insights.push({
      stage: 'Consent Collection',
      avgDuration: Math.round(avgConsentTime),
      checksAffected: consentChecks.length,
      severity: avgConsentTime > 3 ? 'high' : avgConsentTime > 2 ? 'medium' : 'low',
      recommendation: avgConsentTime > 3 
        ? 'Consider automated reminders and simplified consent process'
        : 'Consent collection is efficient'
    });
  }
  
  // Analyze verification stage
  const inProgressChecks = checks.filter(c => c.status === 'in-progress');
  const verificationDurations = checks
    .filter(c => c.completedDate && c.consentDate)
    .map(c => {
      const consent = new Date(c.consentDate!);
      const completed = new Date(c.completedDate!);
      return Math.floor((completed.getTime() - consent.getTime()) / (1000 * 60 * 60 * 24));
    });
  
  if (verificationDurations.length > 0) {
    const avgVerificationTime = verificationDurations.reduce((a, b) => a + b, 0) / verificationDurations.length;
    insights.push({
      stage: 'Verification Process',
      avgDuration: Math.round(avgVerificationTime),
      checksAffected: inProgressChecks.length,
      severity: avgVerificationTime > 7 ? 'high' : avgVerificationTime > 5 ? 'medium' : 'low',
      recommendation: avgVerificationTime > 7
        ? 'Review provider response times and consider additional automation'
        : 'Verification times are within acceptable range'
    });
  }
  
  // Analyze review stage
  const reviewChecks = checks.filter(c => 
    c.status === 'issues-found' || 
    (c.overallStatus === 'conditional' && !c.reviewedBy)
  );
  
  if (reviewChecks.length > 0) {
    insights.push({
      stage: 'Review & Decision',
      avgDuration: 0,
      checksAffected: reviewChecks.length,
      severity: reviewChecks.length > 5 ? 'high' : reviewChecks.length > 2 ? 'medium' : 'low',
      recommendation: reviewChecks.length > 5
        ? 'Assign dedicated reviewers to clear backlog faster'
        : 'Review queue is manageable'
    });
  }
  
  return insights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

export function getPredictiveMetrics(): PredictiveMetrics {
  const checks = getBackgroundChecks();
  const completedChecks = checks.filter(c => c.completedDate);
  
  const avgCompletionTime = completedChecks.length > 0
    ? completedChecks.reduce((sum, c) => {
        const initiated = new Date(c.initiatedDate);
        const completed = new Date(c.completedDate!);
        return sum + Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / completedChecks.length
    : 10;
  
  const riskFactors = [
    {
      factor: 'Delayed Consent',
      impact: checks.filter(c => c.status === 'pending-consent').length / checks.length * 100
    },
    {
      factor: 'Referee Non-Response',
      impact: Math.random() * 30 // Mock data
    },
    {
      factor: 'Provider Delays',
      impact: Math.random() * 20 // Mock data
    },
    {
      factor: 'Manual Review Backlog',
      impact: checks.filter(c => c.status === 'issues-found').length / checks.length * 100
    }
  ].filter(f => f.impact > 5);
  
  const bottlenecks = getBottleneckInsights();
  
  const efficiency = Math.max(0, 100 - riskFactors.reduce((sum, f) => sum + f.impact, 0));
  
  return {
    predictedCompletionTime: Math.round(avgCompletionTime * 1.2), // 20% buffer
    riskFactors,
    bottlenecks,
    efficiency: Math.round(efficiency)
  };
}

export function getCompletionRateByStatus() {
  const checks = getBackgroundChecks();
  const statusCounts = {
    'not-started': 0,
    'pending-consent': 0,
    'in-progress': 0,
    'completed': 0,
    'issues-found': 0,
    'cancelled': 0
  };
  
  checks.forEach(c => {
    statusCounts[c.status]++;
  });
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status: formatStatus(status),
    count,
    percentage: checks.length > 0 ? (count / checks.length) * 100 : 0
  }));
}

export function getTimeToCompletionDistribution() {
  const checks = getBackgroundChecks().filter(c => c.completedDate);
  
  const buckets = {
    '0-3 days': 0,
    '4-7 days': 0,
    '8-14 days': 0,
    '15-21 days': 0,
    '22+ days': 0
  };
  
  checks.forEach(c => {
    const initiated = new Date(c.initiatedDate);
    const completed = new Date(c.completedDate!);
    const days = Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 3) buckets['0-3 days']++;
    else if (days <= 7) buckets['4-7 days']++;
    else if (days <= 14) buckets['8-14 days']++;
    else if (days <= 21) buckets['15-21 days']++;
    else buckets['22+ days']++;
  });
  
  return Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
    percentage: checks.length > 0 ? (count / checks.length) * 100 : 0
  }));
}

function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatStatus(status: string): string {
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import type { ConsentRequest } from '@/shared/types/consent';
import type { RefereeDetails } from '@/shared/types/referee';
import { getConsentResponseByRequestId } from './consentStorage';

const checkTypeLabels = {
  criminal: 'Criminal Record Check',
  employment: 'Employment Verification',
  education: 'Education Verification',
  credit: 'Credit Check',
  'drug-screen': 'Drug Screening',
  reference: 'Reference Check',
  identity: 'Identity Verification',
  'professional-license': 'Professional License Verification',
};

const relationshipLabels = {
  manager: 'Manager',
  colleague: 'Colleague',
  'direct-report': 'Direct Report',
  client: 'Client',
  other: 'Other',
};

export function exportBackgroundCheckPDF(
  check: BackgroundCheck,
  consents: ConsentRequest[],
  referees: RefereeDetails[]
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Background Check Report', 105, yPos, { align: 'center' });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${check.id.slice(0, 8).toUpperCase()}`, 105, yPos, { align: 'center' });

  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Candidate Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Information', 20, yPos);
  yPos += 8;

  const candidateData = [
    ['Name', check.candidateName],
    ['Candidate ID', check.candidateId],
    ['Status', check.status.toUpperCase()],
    ['Overall Result', check.overallStatus?.toUpperCase() || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: candidateData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Check Details', 20, yPos);
  yPos += 8;

  const checkDetailsData = [
    ['Provider', check.provider.toUpperCase()],
    ['Initiated By', check.initiatedByName],
    ['Initiated Date', new Date(check.initiatedDate).toLocaleDateString()],
    ['Completed Date', check.completedDate ? new Date(check.completedDate).toLocaleDateString() : 'Pending'],
    ['Total Cost', `$${check.totalCost?.toFixed(2) || '0.00'}`],
    ['Payment Status', check.paymentStatus?.toUpperCase() || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: checkDetailsData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check Results
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Check Results', 20, yPos);
  yPos += 8;

  const resultsData = check.checkTypes.map(checkType => {
    const result = check.results.find(r => r.checkType === checkType.type);
    return [
      checkTypeLabels[checkType.type],
      checkType.required ? 'Required' : 'Optional',
      result ? result.status.toUpperCase() : 'PENDING',
      result?.completedDate ? new Date(result.completedDate).toLocaleDateString() : 'N/A'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Check Type', 'Requirement', 'Status', 'Completed']],
    body: resultsData,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 85, 105], textColor: 255 },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Result Details
  check.results.forEach(result => {
    if (result.details) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${checkTypeLabels[result.checkType]} - Details`, 20, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const detailsText = doc.splitTextToSize(result.details, 170);
      doc.text(detailsText, 20, yPos);
      yPos += detailsText.length * 5 + 10;
    }
  });

  // Consent Status
  if (consents.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Consent Status', 20, yPos);
    yPos += 8;

    const consent = consents[0];
    const consentResponse = getConsentResponseByRequestId(consent.id);

    const consentData = [
      ['Status', consent.status.toUpperCase()],
      ['Sent Date', new Date(consent.sentDate).toLocaleDateString()],
      ['Viewed Date', consent.viewedDate ? new Date(consent.viewedDate).toLocaleDateString() : 'Not viewed'],
      ['Response Date', consent.respondedDate ? new Date(consent.respondedDate).toLocaleDateString() : 'No response'],
      ['Expiry Date', new Date(consent.expiryDate).toLocaleDateString()],
    ];

    if (consentResponse) {
      consentData.push(['Decision', consentResponse.accepted ? 'ACCEPTED' : 'DECLINED']);
      if (consentResponse.ipAddress) {
        consentData.push(['IP Address', consentResponse.ipAddress]);
      }
    }

    autoTable(doc, {
      startY: yPos,
      body: consentData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      },
      margin: { left: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Referee Responses
  if (referees.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reference Check Summary', 20, yPos);
    yPos += 8;

    const refereeData = referees.map(referee => [
      referee.name,
      relationshipLabels[referee.relationship],
      referee.companyName || 'N/A',
      referee.status.toUpperCase(),
      referee.completedDate ? new Date(referee.completedDate).toLocaleDateString() : 'Pending'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Relationship', 'Company', 'Status', 'Completed']],
      body: refereeData,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Individual Referee Responses
    referees.forEach((referee, index) => {
      if (referee.response) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Reference from ${referee.name}`, 20, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${relationshipLabels[referee.relationship]} at ${referee.companyName || 'Unknown'}`, 20, yPos);
        yPos += 10;

        if (referee.response.overallRating) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Overall Rating: ${referee.response.overallRating}/5`, 20, yPos);
          yPos += 10;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Responses:', 20, yPos);
        yPos += 8;

        referee.response.answers.forEach((answer, idx) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const questionText = doc.splitTextToSize(`Q${idx + 1}: ${answer.question}`, 170);
          doc.text(questionText, 20, yPos);
          yPos += questionText.length * 5 + 3;

          doc.setFont('helvetica', 'normal');
          let answerText: string;
          if (answer.type === 'rating') {
            answerText = `Rating: ${answer.value}/5`;
          } else if (answer.type === 'yes-no') {
            answerText = answer.value ? 'Yes' : 'No';
          } else {
            answerText = String(answer.value);
          }
          
          const answerLines = doc.splitTextToSize(answerText, 165);
          doc.text(answerLines, 25, yPos);
          yPos += answerLines.length * 5 + 8;
        });
      }
    });
  }

  // Review Notes
  if (check.reviewNotes) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Review Notes', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reviewed by: ${check.reviewedByName || 'Unknown'}`, 20, yPos);
    yPos += 8;

    const notesText = doc.splitTextToSize(check.reviewNotes, 170);
    doc.text(notesText, 20, yPos);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('Confidential Background Check Report', 105, 285, { align: 'center' });
  }

  doc.save(`Background_Check_${check.candidateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import type { 
  RevenueMetrics, 
  UsageMetrics, 
  ProfitabilityMetrics, 
  TrendData,
  ClientRevenueData,
  GeographicData,
  TypeDistribution,
  ClientLifetimeValue,
  RetentionMetrics
} from '@/shared/types/businessMetrics';

// Background check pricing by type
export const BACKGROUND_CHECK_PRICING = {
  'reference': 69,
  'criminal-record': 49,
  'qualification': 59,
  'identity': 39,
  'employment': 55,
  'education': 49,
};

// Provider costs for third-party checks
const PROVIDER_COSTS = {
  'checkr': 30,
  'sterling': 35,
  'hireright': 32,
  'goodhire': 28,
  'certn': 30,
  'internal': 15, // Internal cost for HRM8 native reference checks
};

function getCheckPrice(checkType: string): number {
  return BACKGROUND_CHECK_PRICING[checkType as keyof typeof BACKGROUND_CHECK_PRICING] || 49;
}

function getProviderCost(provider: string): number {
  return PROVIDER_COSTS[provider as keyof typeof PROVIDER_COSTS] || 25;
}

export function getBackgroundCheckRevenueMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): RevenueMetrics {
  let checks = getBackgroundChecks().filter(c => c.status === 'completed');
  
  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const completedDate = new Date(c.completedDate || c.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }
  
  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }
  
  const totalRevenue = checks.reduce((sum, c) => sum + (c.cost || 0), 0);
  const totalCosts = checks.reduce((sum, c) => sum + getProviderCost(c.provider), 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
  
  // Calculate revenue by type
  const revenueByType: Record<string, number> = {};
  checks.forEach(c => {
    // Use the first check type as primary type for revenue breakdown
    const type = c.checkTypes[0]?.type || 'unknown';
    revenueByType[type] = (revenueByType[type] || 0) + (c.cost || 0);
  });
  
  // Calculate unique clients
  const uniqueClients = new Set(checks.map(c => c.billedTo)).size;
  const revenuePerClient = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;
  
  // Mock month-over-month growth
  const monthOverMonthGrowth = 15.3;
  
  return {
    totalRevenue,
    revenueByType,
    monthOverMonthGrowth,
    revenuePerClient,
    profitMargin,
  };
}

export function getBackgroundCheckUsageMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): UsageMetrics {
  let checks = getBackgroundChecks();
  
  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= dateRange.from && createdDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }
  
  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }
  
  const totalVolume = checks.length;
  
  // Calculate volume by location
  const locationMap = new Map<string, GeographicData>();
  checks.forEach(c => {
    const key = `${c.country || 'Unknown'}-${c.region || 'Unknown'}`;
    const existing = locationMap.get(key);
    const revenue = c.status === 'completed' ? (c.cost || 0) : 0;
    
    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: c.country || 'Unknown',
        region: c.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });
  
  const volumeByLocation = Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
  
  // Calculate top clients
  const clientMap = new Map<string, ClientRevenueData>();
  checks.forEach(c => {
    const clientId = c.billedTo || 'unknown';
    const clientName = c.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = c.status === 'completed' ? (c.cost || 0) : 0;
    
    if (existing) {
      existing.volume++;
      existing.revenue += revenue;
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      clientMap.set(clientId, {
        clientId,
        clientName,
        volume: 1,
        revenue,
        avgPrice: revenue,
      });
    }
  });
  
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Mock client adoption rate
  const totalPossibleClients = 100;
  const activeClients = new Set(checks.map(c => c.billedTo)).size;
  const clientAdoptionRate = (activeClients / totalPossibleClients) * 100;
  
  return {
    totalVolume,
    volumeByLocation,
    clientAdoptionRate,
    topClients,
  };
}

export function getBackgroundCheckProfitability(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): ProfitabilityMetrics {
  let checks = getBackgroundChecks().filter(c => c.status === 'completed');
  
  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const completedDate = new Date(c.completedDate || c.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }
  
  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }
  
  const totalRevenue = checks.reduce((sum, c) => sum + (c.cost || 0), 0);
  const providerCosts = checks.reduce((sum, c) => sum + getProviderCost(c.provider), 0);
  const internalCosts = checks.length * 8; // Mock internal operational cost per check
  const netProfit = totalRevenue - providerCosts - internalCosts;
  const costPerUnit = checks.length > 0 ? (providerCosts + internalCosts) / checks.length : 0;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    providerCosts,
    internalCosts,
    netProfit,
    costPerUnit,
    marginPercentage,
  };
}

export function getBackgroundCheckRevenueTrends(): TrendData[] {
  const checks = getBackgroundChecks();
  const monthMap = new Map<string, TrendData>();
  
  // Generate last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push(monthKey);
    monthMap.set(monthKey, {
      month: monthKey,
      revenue: 0,
      volume: 0,
      profit: 0,
      newClients: 0,
    });
  }
  
  // Populate with check data
  checks.forEach(c => {
    const date = new Date(c.completedDate || c.createdAt);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const data = monthMap.get(monthKey);
    
    if (data && c.status === 'completed') {
      const revenue = c.cost || 0;
      const cost = getProviderCost(c.provider) + 8;
      data.revenue += revenue;
      data.volume++;
      data.profit += (revenue - cost);
    }
  });
  
  // Mock new clients per month
  monthMap.forEach((data) => {
    data.newClients = Math.floor(Math.random() * 4) + 1;
  });
  
  return months.map(m => monthMap.get(m)!);
}

export function getRevenueByTypeDistribution(): TypeDistribution[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const typeMap = new Map<string, TypeDistribution>();
  
  checks.forEach(c => {
    // Use the first check type as primary type for revenue breakdown
    const type = c.checkTypes[0]?.type || 'unknown';
    const existing = typeMap.get(type);
    const revenue = c.cost || 0;
    const providerCost = getProviderCost(c.provider);
    
    if (existing) {
      existing.revenue += revenue;
      existing.volume++;
      existing.providerCost = (existing.providerCost || 0) + providerCost;
      existing.profit = existing.revenue - (existing.providerCost || 0);
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      typeMap.set(type, {
        type: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        revenue,
        volume: 1,
        avgPrice: revenue,
        providerCost,
        profit: revenue - providerCost,
      });
    }
  });
  
  return Array.from(typeMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export function getTopClientsByRevenue(limit: number = 10): ClientRevenueData[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const clientMap = new Map<string, ClientRevenueData>();
  
  checks.forEach(c => {
    const clientId = c.billedTo || 'unknown';
    const clientName = c.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = c.cost || 0;
    
    if (existing) {
      existing.volume++;
      existing.revenue += revenue;
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      clientMap.set(clientId, {
        clientId,
        clientName,
        volume: 1,
        revenue,
        avgPrice: revenue,
      });
    }
  });
  
  return Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getGeographicRevenueDistribution(): GeographicData[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const locationMap = new Map<string, GeographicData>();
  
  checks.forEach(c => {
    const key = c.country || 'Unknown';
    const existing = locationMap.get(key);
    const revenue = c.cost || 0;
    
    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: c.country || 'Unknown',
        region: c.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });
  
  return Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
}

export function getClientLifetimeValues(): ClientLifetimeValue[] {
  const checks = getBackgroundChecks();
  const clientMap = new Map<string, {
    name: string;
    revenue: number;
    transactions: number;
    firstDate: Date;
    lastDate: Date;
  }>();

  // Group by client
  checks.forEach((check) => {
    const clientId = check.billedTo || 'unknown';
    const clientName = check.billedToName || 'Unknown Client';
    const revenue = check.status === 'completed' ? (check.cost || 0) : 0;
    const date = new Date(check.createdAt);

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        name: clientName,
        revenue: 0,
        transactions: 0,
        firstDate: date,
        lastDate: date,
      });
    }

    const client = clientMap.get(clientId)!;
    client.revenue += revenue;
    client.transactions += 1;
    client.lastDate = date > client.lastDate ? date : client.lastDate;
    client.firstDate = date < client.firstDate ? date : client.firstDate;
  });

  // Calculate CLV metrics
  const clvData: ClientLifetimeValue[] = [];
  clientMap.forEach((data, clientId) => {
    const monthsActive = Math.max(1, 
      Math.floor((data.lastDate.getTime() - data.firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    const avgMonthlyRevenue = data.revenue / monthsActive;
    const avgTransactionValue = data.revenue / data.transactions;
    
    // Simple prediction: average monthly revenue * growth factor
    const growthFactor = data.transactions > 5 ? 1.1 : data.transactions > 2 ? 1.05 : 1.0;
    const predictedNextMonth = avgMonthlyRevenue * growthFactor;
    const predictedAnnual = predictedNextMonth * 12;
    
    // Retention probability based on recency and frequency
    const daysSinceLastPurchase = Math.floor((Date.now() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const retentionProbability = Math.max(20, Math.min(95, 
      100 - (daysSinceLastPurchase / 10) + (data.transactions * 2)
    ));

    // Determine trend
    let trend: 'growing' | 'stable' | 'declining' = 'stable';
    if (growthFactor > 1.05) trend = 'growing';
    else if (daysSinceLastPurchase > 60) trend = 'declining';

    clvData.push({
      clientId,
      clientName: data.name,
      totalRevenue: data.revenue,
      monthsActive,
      averageMonthlyRevenue: avgMonthlyRevenue,
      predictedNextMonthRevenue: predictedNextMonth,
      predictedAnnualRevenue: predictedAnnual,
      retentionProbability,
      lastPurchaseDate: data.lastDate.toISOString(),
      totalTransactions: data.transactions,
      averageTransactionValue: avgTransactionValue,
      trend,
    });
  });

  return clvData.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getRetentionMetrics(): RetentionMetrics {
  const clvData = getClientLifetimeValues();
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const activeClients = clvData.filter(c => 
    new Date(c.lastPurchaseDate).getTime() > thirtyDaysAgo
  ).length;

  const churnedClients = clvData.length - activeClients;
  const retentionRate = clvData.length > 0 ? (activeClients / clvData.length) * 100 : 0;
  const avgLifespan = clvData.reduce((sum, c) => sum + c.monthsActive, 0) / clvData.length;

  // Group by tenure
  const tenureBuckets = {
    '0-3 months': 0,
    '3-6 months': 0,
    '6-12 months': 0,
    '12+ months': 0,
  };

  clvData.forEach(c => {
    if (c.monthsActive <= 3) tenureBuckets['0-3 months']++;
    else if (c.monthsActive <= 6) tenureBuckets['3-6 months']++;
    else if (c.monthsActive <= 12) tenureBuckets['6-12 months']++;
    else tenureBuckets['12+ months']++;
  });

  return {
    totalClients: clvData.length,
    activeClients,
    churnedClients,
    retentionRate,
    averageClientLifespan: avgLifespan,
    clientsByTenure: Object.entries(tenureBuckets).map(([tenure, count]) => ({ tenure, count })),
  };
}
import { Users, ShieldAlert, UserCheck, GraduationCap } from 'lucide-react';
import type { BackgroundCheckType } from '@/shared/types/backgroundCheck';

export interface CheckTypeInfo {
  icon: typeof Users;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export const CHECK_TYPE_INFO: Record<BackgroundCheckType, CheckTypeInfo> = {
  'reference': {
    icon: Users,
    label: 'Reference Check',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Verify work history and performance through professional references',
  },
  'criminal': {
    icon: ShieldAlert,
    label: 'Criminal Record Check',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Screen for criminal history and legal records',
  },
  'identity': {
    icon: UserCheck,
    label: 'Identity Verification',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Confirm identity through document verification',
  },
  'education': {
    icon: GraduationCap,
    label: 'Qualification Verification',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Verify educational credentials and professional qualifications',
  },
  'employment': {
    icon: Users,
    label: 'Employment Verification',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Confirm previous employment history',
  },
  'credit': {
    icon: ShieldAlert,
    label: 'Credit Check',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Review credit history and financial background',
  },
  'drug-screen': {
    icon: ShieldAlert,
    label: 'Drug Screening',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Test for substance use',
  },
  'professional-license': {
    icon: GraduationCap,
    label: 'License Verification',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Verify professional licenses and certifications',
  },
};

export function getCheckTypeInfo(type: BackgroundCheckType): CheckTypeInfo {
  return CHECK_TYPE_INFO[type] || CHECK_TYPE_INFO.reference;
}

export function getCheckTypeIcon(type: BackgroundCheckType) {
  return getCheckTypeInfo(type).icon;
}

export function getCheckTypeLabel(type: BackgroundCheckType): string {
  return getCheckTypeInfo(type).label;
}

export function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'not-started': 'text-gray-500',
    'pending-consent': 'text-yellow-600',
    'in-progress': 'text-blue-600',
    'completed': 'text-green-600',
    'issues-found': 'text-red-600',
    'cancelled': 'text-gray-400',
  };
  return colors[status] || 'text-gray-500';
}

export function getOverallResultColor(result?: string): string {
  const colors: Record<string, string> = {
    'clear': 'text-green-600',
    'conditional': 'text-yellow-600',
    'not-clear': 'text-red-600',
  };
  return result ? colors[result] || 'text-gray-500' : 'text-gray-500';
}

export function getCheckProgress(check: any): number {
  if (check.status === 'completed') return 100;
  if (check.status === 'cancelled') return 0;
  
  let progress = 0;
  
  // Consent given: 25%
  if (check.consentGiven) {
    progress += 25;
  }
  
  // Each check type in progress: split remaining 75%
  const inProgressResults = check.results?.filter((r: any) => 
    r.status !== 'pending' && r.status !== 'not-started'
  ) || [];
  
  if (check.checkTypes.length > 0) {
    const progressPerCheck = 75 / check.checkTypes.length;
    progress += inProgressResults.length * progressPerCheck;
  }
  
  return Math.min(Math.round(progress), 100);
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ComparisonResult } from './reportComparison';
import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

interface ExportOptions {
  candidateName: string;
  candidateId: string;
  includeCharts?: boolean;
  includeEvidence?: boolean;
}

export function exportComparisonPDF(
  comparison: ComparisonResult,
  reports: AITranscriptionSummary[],
  options: ExportOptions
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      addPageHeader();
      return true;
    }
    return false;
  };

  // Helper function to add page header
  const addPageHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${options.candidateName} - Multi-Referee Comparison`, margin, 10);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 20, 10);
    yPosition = margin;
  };

  // Add footer to each page
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'Confidential - For Internal Use Only',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };

  // ==================== COVER PAGE ====================
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('Multi-Referee Comparison Report', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(14);
  doc.text(options.candidateName, pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Candidate ID: ${options.candidateId}`, pageWidth / 2, 65, { align: 'center' });

  // Report metadata
  yPosition = 100;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text('Report Details:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const reportDetails = [
    `Generated: ${new Date().toLocaleString()}`,
    `Total Referees: ${comparison.totalReferees}`,
    `Overall Score: ${comparison.aggregateRecommendation.overallScore.toFixed(0)}/100`,
    `Majority Recommendation: ${comparison.aggregateRecommendation.majorityRecommendation.replace(/-/g, ' ').toUpperCase()}`,
    `Confidence Level: ${(comparison.aggregateRecommendation.confidenceLevel * 100).toFixed(0)}%`,
  ];

  reportDetails.forEach((detail) => {
    doc.text(`• ${detail}`, margin + 5, yPosition);
    yPosition += 7;
  });

  // ==================== AGGREGATE RECOMMENDATION ====================
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Aggregate Recommendation', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const summaryLines = doc.splitTextToSize(comparison.aggregateRecommendation.summary, contentWidth);
  summaryLines.forEach((line: string) => {
    checkNewPage(10);
    doc.text(line, margin, yPosition);
    yPosition += 7;
  });
  yPosition += 5;

  // Recommendation distribution table
  checkNewPage(40);
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text('Recommendation Distribution', margin, yPosition);
  yPosition += 8;

  const recDistData = Object.entries(comparison.aggregateRecommendation.recommendationDistribution).map(
    ([rec, count]) => [rec.replace(/-/g, ' ').toUpperCase(), count.toString()]
  );

  autoTable(doc, {
    startY: yPosition,
    head: [['Recommendation', 'Count']],
    body: recDistData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ==================== INDIVIDUAL REFEREE SUMMARIES ====================
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Individual Referee Summaries', margin, yPosition);
  yPosition += 12;

  reports.forEach((report, index) => {
    checkNewPage(60);

    // Referee header box
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, yPosition - 5, contentWidth, 35, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${report.refereeInfo.name}`, margin + 5, yPosition + 3);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${report.refereeInfo.relationship} at ${report.refereeInfo.companyName}`, margin + 5, yPosition + 10);

    // Score and recommendation
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Score: ${report.recommendation.overallScore}/100`, margin + 5, yPosition + 18);
    doc.text(
      `Recommendation: ${report.recommendation.hiringRecommendation.replace(/-/g, ' ')}`,
      margin + 5,
      yPosition + 25
    );

    yPosition += 40;
  });

  // ==================== CATEGORY COMPARISON ====================
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Detailed Category Analysis', margin, yPosition);
  yPosition += 12;

  comparison.categoryComparisons.forEach((cat) => {
    checkNewPage(50);

    // Category header
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition - 5, contentWidth, 10, 'F');

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(cat.category, margin + 5, yPosition + 2);

    doc.setFontSize(9);
    const consensusText = `${cat.consensus.toUpperCase()} CONSENSUS`;
    doc.text(consensusText, pageWidth - margin - 5, yPosition + 2, { align: 'right' });

    yPosition += 12;

    // Average score
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Average Score: ${cat.averageScore.toFixed(1)}/5`, margin, yPosition);
    yPosition += 8;

    // Individual scores
    const categoryScores = cat.scores.map((score) => [
      score.refereeName,
      `${score.score}/5`,
      score.summary.substring(0, 80) + (score.summary.length > 80 ? '...' : ''),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Referee', 'Score', 'Summary']],
      body: categoryScores,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  });

  // ==================== CONSENSUS HIGHLIGHTS ====================
  if (comparison.consensusAreas.length > 0) {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Consensus Highlights', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Areas where most referees agree', margin, yPosition);
    yPosition += 12;

    comparison.consensusAreas.forEach((area, index) => {
      checkNewPage(50);

      // Area box
      const boxColor = area.type === 'strength' ? [34, 197, 94] : [251, 191, 36];
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2], 0.1);
      doc.setDrawColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 40, 3, 3, 'FD');

      // Icon and type
      doc.setFontSize(10);
      doc.setTextColor(boxColor[0], boxColor[1], boxColor[2]);
      const typeText = area.type === 'strength' ? '✓ STRENGTH' : 'ℹ OBSERVATION';
      doc.text(typeText, margin + 5, yPosition + 3);

      // Text
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const areaTextLines = doc.splitTextToSize(area.text, contentWidth - 10);
      let areaYPos = yPosition + 10;
      areaTextLines.forEach((line: string) => {
        doc.text(line, margin + 5, areaYPos);
        areaYPos += 6;
      });

      // Supporting referees
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Supported by: ${area.supportingReferees.join(', ')}`, margin + 5, areaYPos + 3);

      // Evidence (if enabled)
      if (options.includeEvidence && area.evidence.length > 0) {
        areaYPos += 10;
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text('Evidence:', margin + 5, areaYPos);
        areaYPos += 5;

        area.evidence.slice(0, 2).forEach((evidence) => {
          const evidenceLines = doc.splitTextToSize(`"${evidence}"`, contentWidth - 15);
          evidenceLines.forEach((line: string) => {
            if (areaYPos > yPosition + 35) return; // Prevent overflow
            doc.setFont('helvetica', 'italic');
            doc.text(line, margin + 10, areaYPos);
            doc.setFont('helvetica', 'normal');
            areaYPos += 5;
          });
        });
      }

      yPosition += 45;
    });
  }

  // ==================== DIVERGENT FEEDBACK ====================
  if (comparison.divergentAreas.length > 0) {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Divergent Feedback', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Areas where referees have differing views', margin, yPosition);
    yPosition += 12;

    comparison.divergentAreas.forEach((area) => {
      checkNewPage(70);

      // Category header
      const divergenceColor =
        area.divergenceLevel === 'high' ? [239, 68, 68] : [251, 191, 36];
      doc.setFillColor(divergenceColor[0], divergenceColor[1], divergenceColor[2], 0.1);
      doc.setDrawColor(divergenceColor[0], divergenceColor[1], divergenceColor[2]);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 10, 3, 3, 'FD');

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(area.category, margin + 5, yPosition + 2);

      doc.setFontSize(9);
      doc.setTextColor(divergenceColor[0], divergenceColor[1], divergenceColor[2]);
      doc.text(`${area.divergenceLevel.toUpperCase()} DIVERGENCE`, pageWidth - margin - 5, yPosition + 2, {
        align: 'right',
      });

      yPosition += 15;

      // Referee views
      area.refereeViews.forEach((view) => {
        checkNewPage(20);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${view.name}:`, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');

        if (view.score) {
          doc.text(`(${view.score}/5)`, margin + 35, yPosition);
        }

        yPosition += 5;

        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const viewLines = doc.splitTextToSize(view.view, contentWidth - 10);
        viewLines.forEach((line: string) => {
          checkNewPage(10);
          doc.text(line, margin + 5, yPosition);
          yPosition += 5;
        });

        yPosition += 3;
      });

      yPosition += 5;
    });
  }

  // ==================== RECOMMENDATIONS ====================
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Recommendations & Next Steps', margin, yPosition);
  yPosition += 12;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const recommendations = [
    'Review individual referee reports for detailed context and specific examples.',
    'Pay special attention to consensus areas as they represent consistent feedback across multiple sources.',
    'Investigate divergent feedback areas to understand different perspectives and contexts.',
    'Consider the relationship and tenure of each referee when weighing their input.',
    'Schedule follow-up interviews to clarify any concerns or conflicting information.',
    `Overall recommendation: ${comparison.aggregateRecommendation.majorityRecommendation.replace(/-/g, ' ').toUpperCase()}`,
  ];

  recommendations.forEach((rec) => {
    checkNewPage(15);
    doc.text(`• ${rec}`, margin + 5, yPosition);
    const lines = doc.splitTextToSize(rec, contentWidth - 10);
    yPosition += lines.length * 7;
  });

  // Add footers
  addFooter();

  // Save the PDF
  const fileName = `${options.candidateName.replace(/\s+/g, '_')}_Multi_Referee_Comparison_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
import { v4 as uuidv4 } from 'uuid';
import type { ConsentRequest, ConsentResponse } from '@/shared/types/consent';
import type { BackgroundCheckType } from '@/shared/types/backgroundCheck';
import {
  saveConsentRequest,
  updateConsent,
  getConsentByToken as getConsentByTokenStorage,
  saveConsentResponse
} from './consentStorage';
import { updateBackgroundCheck } from '@/shared/lib/mockBackgroundCheckStorage';
import { generateConsentEmail } from './emailTemplates';
import { LEGAL_DISCLOSURE_TEMPLATE, PRIVACY_POLICY_URL } from './legalTemplates';
import { BACKGROUND_CHECK_PRICING } from './pricingConstants';
import { createBackgroundCheckNotification } from './notificationService';
import { sendBackgroundCheckEmail } from './emailNotificationService';
import { handleConsentReceived } from './statusUpdateService';

export function generateConsentToken(): string {
  return `consent_${uuidv4()}_${Date.now()}`;
}

export function createConsentRequest(
  candidateId: string,
  candidateName: string,
  candidateEmail: string,
  backgroundCheckId: string,
  checkTypes: BackgroundCheckType[],
  createdBy: string,
  createdByName: string
): ConsentRequest {
  const token = generateConsentToken();
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const requestedChecks = checkTypes.map(type => {
    const pricing = BACKGROUND_CHECK_PRICING[type];
    return {
      checkType: type,
      provider: pricing.provider,
      cost: pricing.cost,
      description: pricing.name
    };
  });

  const consentRequest: ConsentRequest = {
    id: uuidv4(),
    candidateId,
    candidateName,
    candidateEmail,
    backgroundCheckId,
    requestedChecks,
    token,
    status: 'pending',
    legalDisclosure: LEGAL_DISCLOSURE_TEMPLATE,
    privacyPolicyUrl: PRIVACY_POLICY_URL,
    sentDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    createdBy,
    createdByName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  saveConsentRequest(consentRequest);
  return consentRequest;
}

export function sendConsentEmail(consent: ConsentRequest): void {
  const consentUrl = `${window.location.origin}/consent/${consent.token}`;
  const emailHtml = generateConsentEmail(consent, consentUrl);
  
  // Simulate sending email (log to console)
  console.log('📧 Sending consent email to:', consent.candidateEmail);
  console.log('Consent URL:', consentUrl);
  console.log('Email HTML:', emailHtml);
  
  // Update status to sent
  updateConsent(consent.id, { status: 'sent' });

  // Send email notification
  sendBackgroundCheckEmail('consent_requested', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    recruiterName: 'Recruiter',
    recruiterEmail: 'recruiter@example.com',
    checkId: consent.backgroundCheckId,
    consentLink: consentUrl,
  });

  // Create in-app notification for recruiter
  createBackgroundCheckNotification('consent_requested', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    checkId: consent.backgroundCheckId,
  });
}

export function getConsentByToken(token: string): ConsentRequest | undefined {
  return getConsentByTokenStorage(token);
}

export function validateConsentToken(token: string): boolean {
  const consent = getConsentByToken(token);
  
  if (!consent) return false;
  if (consent.status === 'expired') return false;
  if (consent.status === 'accepted' || consent.status === 'declined') return false;
  
  // Check if expired
  const now = new Date();
  const expiryDate = new Date(consent.expiryDate);
  
  if (now > expiryDate) {
    updateConsent(consent.id, { status: 'expired' });
    return false;
  }
  
  return true;
}

export function markConsentAsViewed(token: string): void {
  const consent = getConsentByToken(token);
  if (consent && consent.status === 'sent') {
    updateConsent(consent.id, {
      status: 'viewed',
      viewedDate: new Date().toISOString()
    });
  }
}

export function acceptConsent(
  token: string,
  signatureDataUrl: string,
  ipAddress: string = '0.0.0.0',
  userAgent: string = navigator.userAgent
): void {
  const consent = getConsentByToken(token);
  if (!consent) throw new Error('Consent request not found');
  
  const now = new Date().toISOString();
  
  // Save consent response
  const response: ConsentResponse = {
    consentRequestId: consent.id,
    accepted: true,
    signatureDataUrl,
    ipAddress,
    userAgent,
    timestamp: now
  };
  saveConsentResponse(response);
  
  // Update consent request
  updateConsent(consent.id, {
    status: 'accepted',
    respondedDate: now
  });
  
  // Trigger automated status update and notifications
  handleConsentReceived(consent.backgroundCheckId);

  // Send additional email notifications
  sendBackgroundCheckEmail('consent_given', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    recruiterName: 'Recruiter',
    recruiterEmail: 'recruiter@example.com',
    checkId: consent.backgroundCheckId,
    reportLink: `${window.location.origin}/background-checks/${consent.backgroundCheckId}`,
  });
  
  console.log('✅ Consent accepted for background check:', consent.backgroundCheckId);
}

export function declineConsent(
  token: string,
  reason?: string
): void {
  const consent = getConsentByToken(token);
  if (!consent) throw new Error('Consent request not found');
  
  const now = new Date().toISOString();
  
  // Save consent response
  const response: ConsentResponse = {
    consentRequestId: consent.id,
    accepted: false,
    timestamp: now,
    candidateComments: reason
  };
  saveConsentResponse(response);
  
  // Update consent request
  updateConsent(consent.id, {
    status: 'declined',
    respondedDate: now
  });
  
  // Update background check status
  updateBackgroundCheck(consent.backgroundCheckId, {
    status: 'cancelled'
  });

  // Send notifications
  sendBackgroundCheckEmail('consent_declined', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    recruiterName: 'Recruiter',
    recruiterEmail: 'recruiter@example.com',
    checkId: consent.backgroundCheckId,
    reportLink: `${window.location.origin}/background-checks/${consent.backgroundCheckId}`,
  });

  createBackgroundCheckNotification('consent_declined', {
    candidateName: consent.candidateName,
    checkId: consent.backgroundCheckId,
  });
  
  console.log('❌ Consent declined for background check:', consent.backgroundCheckId);
}
import type { ConsentRequest, ConsentResponse } from '@/shared/types/consent';

const CONSENTS_KEY = 'hrm8_consent_requests';
const CONSENT_RESPONSES_KEY = 'hrm8_consent_responses';

function initializeStorage() {
  if (!localStorage.getItem(CONSENTS_KEY)) {
    localStorage.setItem(CONSENTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CONSENT_RESPONSES_KEY)) {
    localStorage.setItem(CONSENT_RESPONSES_KEY, JSON.stringify([]));
  }
}

export function saveConsentRequest(consent: ConsentRequest): void {
  initializeStorage();
  const consents = getConsentRequests();
  consents.push(consent);
  localStorage.setItem(CONSENTS_KEY, JSON.stringify(consents));
}

export function getConsentRequests(): ConsentRequest[] {
  initializeStorage();
  const data = localStorage.getItem(CONSENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getConsentById(id: string): ConsentRequest | undefined {
  return getConsentRequests().find(c => c.id === id);
}

export function getConsentByToken(token: string): ConsentRequest | undefined {
  return getConsentRequests().find(c => c.token === token);
}

export function updateConsent(id: string, updates: Partial<ConsentRequest>): void {
  const consents = getConsentRequests();
  const index = consents.findIndex(c => c.id === id);
  if (index !== -1) {
    consents[index] = {
      ...consents[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CONSENTS_KEY, JSON.stringify(consents));
  }
}

export function getConsentsByCandidate(candidateId: string): ConsentRequest[] {
  return getConsentRequests().filter(c => c.candidateId === candidateId);
}

export function getConsentsByBackgroundCheck(backgroundCheckId: string): ConsentRequest[] {
  return getConsentRequests().filter(c => c.backgroundCheckId === backgroundCheckId);
}

export function saveConsentResponse(response: ConsentResponse): void {
  initializeStorage();
  const responses = getConsentResponses();
  responses.push(response);
  localStorage.setItem(CONSENT_RESPONSES_KEY, JSON.stringify(responses));
}

export function getConsentResponses(): ConsentResponse[] {
  initializeStorage();
  const data = localStorage.getItem(CONSENT_RESPONSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getConsentResponseByRequestId(requestId: string): ConsentResponse | undefined {
  return getConsentResponses().find(r => r.consentRequestId === requestId);
}
import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import { getReferees, getOverdueReferees } from './refereeStorage';
import { getConsentRequests } from './consentStorage';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface BackgroundCheckStats {
  total: number;
  active: number;
  completed: number;
  issuesFound: number;
  cancelled: number;
  completionRate: number;
  avgCompletionTime: number;
  pendingConsents: number;
  overdueReferees: number;
  requiresReview: number;
  changeFromLastMonth: {
    total: number;
    active: number;
    completionRate: number;
    avgCompletionTime: number;
  };
}

export function getBackgroundCheckStats(): BackgroundCheckStats {
  const checks = getBackgroundChecks();
  const referees = getReferees();
  const consents = getConsentRequests();
  
  const completed = checks.filter(c => c.status === 'completed').length;
  const active = checks.filter(c => ['pending-consent', 'in-progress'].includes(c.status)).length;
  const issuesFound = checks.filter(c => c.status === 'issues-found').length;
  const cancelled = checks.filter(c => c.status === 'cancelled').length;
  
  const completionRate = checks.length > 0 ? (completed / checks.length) * 100 : 0;
  const avgCompletionTime = calculateAvgCompletionTime(checks);
  
  return {
    total: checks.length,
    active,
    completed,
    issuesFound,
    cancelled,
    completionRate,
    avgCompletionTime,
    pendingConsents: consents.filter(c => c.status === 'pending' || c.status === 'sent').length,
    overdueReferees: getOverdueReferees().length,
    requiresReview: checks.filter(c => c.overallStatus === 'conditional' || c.status === 'issues-found').length,
    changeFromLastMonth: {
      total: 12.5,
      active: -5.2,
      completionRate: 3.8,
      avgCompletionTime: -2.1,
    }
  };
}

export function calculateAvgCompletionTime(checks: BackgroundCheck[]): number {
  const completedChecks = checks.filter(c => c.completedDate);
  if (completedChecks.length === 0) return 0;
  
  const totalDays = completedChecks.reduce((sum, check) => {
    const initiated = new Date(check.initiatedDate);
    const completed = new Date(check.completedDate!);
    const days = Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / completedChecks.length);
}

export function getCheckVolumeData() {
  return [
    { month: 'Jan', initiated: 45, completed: 38, avgDays: 12 },
    { month: 'Feb', initiated: 52, completed: 45, avgDays: 11 },
    { month: 'Mar', initiated: 48, completed: 50, avgDays: 10 },
    { month: 'Apr', initiated: 61, completed: 48, avgDays: 11 },
    { month: 'May', initiated: 58, completed: 55, avgDays: 9 },
    { month: 'Jun', initiated: 67, completed: 61, avgDays: 9 },
  ];
}

export function getStatusDistributionData() {
  const checks = getBackgroundChecks();
  return [
    { status: 'Not Started', count: checks.filter(c => c.status === 'not-started').length },
    { status: 'Pending Consent', count: checks.filter(c => c.status === 'pending-consent').length },
    { status: 'In Progress', count: checks.filter(c => c.status === 'in-progress').length },
    { status: 'Completed', count: checks.filter(c => c.status === 'completed').length },
    { status: 'Issues Found', count: checks.filter(c => c.status === 'issues-found').length },
    { status: 'Cancelled', count: checks.filter(c => c.status === 'cancelled').length },
  ];
}

export function getCheckTypeDistribution() {
  const checks = getBackgroundChecks();
  const typeCounts: Record<string, number> = {};
  
  checks.forEach(check => {
    check.checkTypes.forEach(ct => {
      typeCounts[ct.type] = (typeCounts[ct.type] || 0) + 1;
    });
  });
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    type: formatCheckType(type),
    count,
    percentage: Math.round((count / checks.length) * 100)
  }));
}

export function getProviderUsageData() {
  const checks = getBackgroundChecks();
  const providers = ['checkr', 'sterling', 'hireright', 'manual'];
  
  return providers.map(provider => ({
    provider: provider.charAt(0).toUpperCase() + provider.slice(1),
    count: checks.filter(c => c.provider === provider).length,
    successRate: Math.floor(Math.random() * 20) + 80, // Mock success rate
  }));
}

export function getResultsOverview() {
  const checks = getBackgroundChecks();
  return [
    { status: 'Clear', count: checks.filter(c => c.overallStatus === 'clear').length, color: 'hsl(var(--success))' },
    { status: 'Conditional', count: checks.filter(c => c.overallStatus === 'conditional').length, color: 'hsl(var(--warning))' },
    { status: 'Not Clear', count: checks.filter(c => c.overallStatus === 'not-clear').length, color: 'hsl(var(--destructive))' },
    { status: 'Pending', count: checks.filter(c => !c.overallStatus).length, color: 'hsl(var(--muted))' },
  ];
}

export function getRecentActivity() {
  const checks = getBackgroundChecks();
  const activities = checks
    .flatMap(check => [
      {
        type: 'initiated',
        candidateName: check.candidateName,
        timestamp: check.initiatedDate,
        checkId: check.id,
      },
      ...(check.consentGiven ? [{
        type: 'consent-received',
        candidateName: check.candidateName,
        timestamp: check.consentDate!,
        checkId: check.id,
      }] : []),
      ...(check.completedDate ? [{
        type: 'completed',
        candidateName: check.candidateName,
        timestamp: check.completedDate,
        checkId: check.id,
      }] : []),
    ])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  return activities;
}

function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';

export type DigestFrequency = 'daily' | 'weekly' | 'disabled';

export interface DigestPreferences {
  userId: string;
  frequency: DigestFrequency;
  includeStatusChanges: boolean;
  includePendingActions: boolean;
  includeOverdueItems: boolean;
  emailAddress: string;
  lastSentAt?: string;
}

export interface StatusChange {
  checkId: string;
  candidateName: string;
  previousStatus: BackgroundCheck['status'];
  newStatus: BackgroundCheck['status'];
  changedAt: string;
}

export interface PendingAction {
  checkId: string;
  candidateName: string;
  actionType: 'pending-consent' | 'overdue-referee' | 'requires-review' | 'incomplete-check';
  description: string;
  daysPending: number;
  priority: 'low' | 'medium' | 'high';
}

export interface DigestData {
  userId: string;
  period: { from: string; to: string };
  statusChanges: StatusChange[];
  pendingActions: PendingAction[];
  summary: {
    totalChecks: number;
    completedChecks: number;
    inProgressChecks: number;
    issuesFound: number;
    pendingConsent: number;
  };
}

// Mock storage for digest preferences
const DIGEST_PREFS_KEY = 'hrm8_digest_preferences';
const STATUS_CHANGES_KEY = 'hrm8_status_changes_log';

function getDigestPreferences(): DigestPreferences[] {
  const data = localStorage.getItem(DIGEST_PREFS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserDigestPreferences(userId: string): DigestPreferences | undefined {
  return getDigestPreferences().find(p => p.userId === userId);
}

export function saveDigestPreferences(prefs: DigestPreferences): void {
  const allPrefs = getDigestPreferences();
  const index = allPrefs.findIndex(p => p.userId === prefs.userId);
  
  if (index !== -1) {
    allPrefs[index] = prefs;
  } else {
    allPrefs.push(prefs);
  }
  
  localStorage.setItem(DIGEST_PREFS_KEY, JSON.stringify(allPrefs));
}

// Log status changes for digest
export function logStatusChange(change: StatusChange): void {
  const changes = getStatusChangesLog();
  changes.push(change);
  localStorage.setItem(STATUS_CHANGES_KEY, JSON.stringify(changes));
}

function getStatusChangesLog(): StatusChange[] {
  const data = localStorage.getItem(STATUS_CHANGES_KEY);
  return data ? JSON.parse(data) : [];
}

// Generate digest data for a user
export function generateDigestData(userId: string, frequency: DigestFrequency): DigestData {
  const now = new Date();
  const fromDate = new Date(now);
  
  // Calculate period based on frequency
  if (frequency === 'daily') {
    fromDate.setDate(fromDate.getDate() - 1);
  } else if (frequency === 'weekly') {
    fromDate.setDate(fromDate.getDate() - 7);
  }
  
  // Get all checks
  const allChecks = getBackgroundChecks();
  
  // Get status changes within period
  const statusChanges = getStatusChangesLog().filter(change => {
    const changeDate = new Date(change.changedAt);
    return changeDate >= fromDate && changeDate <= now;
  });
  
  // Get pending actions
  const pendingActions = getPendingActions(allChecks);
  
  // Calculate summary
  const summary = {
    totalChecks: allChecks.length,
    completedChecks: allChecks.filter(c => c.status === 'completed').length,
    inProgressChecks: allChecks.filter(c => c.status === 'in-progress').length,
    issuesFound: allChecks.filter(c => c.status === 'issues-found').length,
    pendingConsent: allChecks.filter(c => c.status === 'pending-consent').length,
  };
  
  return {
    userId,
    period: {
      from: fromDate.toISOString(),
      to: now.toISOString()
    },
    statusChanges,
    pendingActions,
    summary
  };
}

function getPendingActions(checks: BackgroundCheck[]): PendingAction[] {
  const now = new Date();
  const actions: PendingAction[] = [];
  
  checks.forEach(check => {
    // Pending consent
    if (check.status === 'pending-consent') {
      const daysPending = Math.floor(
        (now.getTime() - new Date(check.initiatedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      actions.push({
        checkId: check.id,
        candidateName: check.candidateName,
        actionType: 'pending-consent',
        description: 'Waiting for candidate consent',
        daysPending,
        priority: daysPending > 7 ? 'high' : daysPending > 3 ? 'medium' : 'low'
      });
    }
    
    // Requires review
    if (check.status === 'issues-found' && !check.reviewedBy) {
      const daysPending = Math.floor(
        (now.getTime() - new Date(check.completedDate || check.initiatedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      actions.push({
        checkId: check.id,
        candidateName: check.candidateName,
        actionType: 'requires-review',
        description: 'Issues found - requires review',
        daysPending,
        priority: 'high'
      });
    }
    
    // Incomplete checks (in-progress for too long)
    if (check.status === 'in-progress') {
      const daysPending = Math.floor(
        (now.getTime() - new Date(check.initiatedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysPending > 14) {
        actions.push({
          checkId: check.id,
          candidateName: check.candidateName,
          actionType: 'incomplete-check',
          description: `In progress for ${daysPending} days`,
          daysPending,
          priority: daysPending > 30 ? 'high' : 'medium'
        });
      }
    }
  });
  
  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Send digest email (mock implementation)
export function sendDigestEmail(userId: string, digestData: DigestData): void {
  const prefs = getUserDigestPreferences(userId);
  if (!prefs || prefs.frequency === 'disabled') return;
  
  const emailHtml = generateDigestEmailHtml(digestData, prefs);
  
  // Mock email sending
  console.log('📧 Sending digest email to:', prefs.emailAddress);
  console.log('Digest data:', digestData);
  console.log('Email HTML:', emailHtml);
  
  // Update last sent timestamp
  saveDigestPreferences({
    ...prefs,
    lastSentAt: new Date().toISOString()
  });
}

function generateDigestEmailHtml(data: DigestData, prefs: DigestPreferences): string {
  const { summary, statusChanges, pendingActions } = data;
  const frequency = prefs.frequency === 'daily' ? 'Daily' : 'Weekly';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .stat-card { padding: 10px; background: #f5f5f5; border-radius: 4px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .stat-label { font-size: 12px; color: #666; }
        .change-item, .action-item { padding: 10px; margin: 5px 0; border-left: 3px solid #667eea; background: #f9f9f9; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${frequency} Background Checks Digest</h1>
          <p>${new Date(data.period.from).toLocaleDateString()} - ${new Date(data.period.to).toLocaleDateString()}</p>
        </div>
        
        ${prefs.includeStatusChanges ? `
        <div class="section">
          <h2>📊 Summary Statistics</h2>
          <div class="summary-grid">
            <div class="stat-card">
              <div class="stat-value">${summary.totalChecks}</div>
              <div class="stat-label">Total Checks</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.completedChecks}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.inProgressChecks}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.issuesFound}</div>
              <div class="stat-label">Issues Found</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${prefs.includeStatusChanges && statusChanges.length > 0 ? `
        <div class="section">
          <h2>🔄 Status Changes (${statusChanges.length})</h2>
          ${statusChanges.slice(0, 10).map(change => `
            <div class="change-item">
              <strong>${change.candidateName}</strong>
              <br>
              <span class="badge badge-warning">${change.previousStatus}</span>
              →
              <span class="badge badge-success">${change.newStatus}</span>
              <br>
              <small>${new Date(change.changedAt).toLocaleString()}</small>
            </div>
          `).join('')}
          ${statusChanges.length > 10 ? `<p><small>...and ${statusChanges.length - 10} more changes</small></p>` : ''}
        </div>
        ` : ''}
        
        ${prefs.includePendingActions && pendingActions.length > 0 ? `
        <div class="section">
          <h2>⚠️ Pending Actions (${pendingActions.length})</h2>
          ${pendingActions.slice(0, 10).map(action => `
            <div class="action-item priority-${action.priority}">
              <strong>${action.candidateName}</strong>
              <span class="badge badge-${action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'success'}">${action.priority.toUpperCase()}</span>
              <br>
              ${action.description}
              <br>
              <small>Pending for ${action.daysPending} days</small>
            </div>
          `).join('')}
          ${pendingActions.length > 10 ? `<p><small>...and ${pendingActions.length - 10} more actions</small></p>` : ''}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}/background-checks" class="btn">View All Background Checks</a>
        </div>
        
        <div class="footer">
          <p>You're receiving this ${frequency.toLowerCase()} digest because you're subscribed to background check notifications.</p>
          <p><a href="${window.location.origin}/settings/notifications">Manage your notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Check and send digests (would be scheduled, but we'll trigger manually for now)
export function processPendingDigests(): void {
  const allPrefs = getDigestPreferences();
  const now = new Date();
  
  allPrefs.forEach(prefs => {
    if (prefs.frequency === 'disabled') return;
    
    const shouldSend = shouldSendDigest(prefs, now);
    
    if (shouldSend) {
      const digestData = generateDigestData(prefs.userId, prefs.frequency);
      
      // Only send if there's meaningful content
      if (digestData.statusChanges.length > 0 || digestData.pendingActions.length > 0) {
        sendDigestEmail(prefs.userId, digestData);
      }
    }
  });
}

function shouldSendDigest(prefs: DigestPreferences, now: Date): boolean {
  if (!prefs.lastSentAt) return true;
  
  const lastSent = new Date(prefs.lastSentAt);
  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
  
  if (prefs.frequency === 'daily') {
    return hoursSinceLastSent >= 24;
  } else if (prefs.frequency === 'weekly') {
    return hoursSinceLastSent >= 168; // 7 days
  }
  
  return false;
}
import { BackgroundCheckNotificationEvent } from './notificationService';

interface EmailNotificationContext {
  candidateName: string;
  candidateEmail?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  checkId: string;
  jobTitle?: string;
  refereeName?: string;
  refereeEmail?: string;
  checkType?: string;
  consentLink?: string;
  referenceLink?: string;
  reportLink?: string;
  reminderNumber?: number;
  questionnaireLink?: string;
}

/**
 * Generates email notification templates for background check events
 * In production, this would integrate with Resend or similar email service
 */
export function sendBackgroundCheckEmail(
  event: BackgroundCheckNotificationEvent,
  context: EmailNotificationContext
): void {
  const emailConfig = getEmailConfig(event, context);
  
  // Mock email sending - log to console
  console.log('📧 Email Notification:', {
    to: emailConfig.to,
    subject: emailConfig.subject,
    body: emailConfig.body,
    event,
    timestamp: new Date().toISOString(),
  });

  // In production, replace with actual email service:
  /*
  await fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      to: emailConfig.to,
      subject: emailConfig.subject,
      html: emailConfig.body,
      type: 'background-check',
      data: context,
    }),
  });
  */
}

function getEmailConfig(
  event: BackgroundCheckNotificationEvent,
  context: EmailNotificationContext
) {
  const {
    candidateName,
    candidateEmail,
    recruiterName = 'Recruiter',
    recruiterEmail,
    refereeName,
    refereeEmail,
    jobTitle,
    consentLink,
    referenceLink,
    reportLink,
  } = context;

  switch (event) {
    case 'consent_requested':
      return {
        to: candidateEmail,
        subject: `Background Check Consent Required - ${jobTitle || 'Position'}`,
        body: `
          <h2>Background Check Consent Required</h2>
          <p>Dear ${candidateName},</p>
          <p>As part of your application for ${jobTitle || 'the position'}, we require your consent to proceed with background verification checks.</p>
          <p>Please review and provide your consent by clicking the link below:</p>
          <p><a href="${consentLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review and Provide Consent</a></p>
          <p>This link will expire in 7 days.</p>
          <p>If you have any questions, please contact ${recruiterName} at ${recruiterEmail}.</p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'consent_given':
      return {
        to: recruiterEmail,
        subject: `✓ Consent Approved - ${candidateName}`,
        body: `
          <h2>Background Check Consent Approved</h2>
          <p>Dear ${recruiterName},</p>
          <p>${candidateName} has approved the background check consent.</p>
          <p>The following checks are now in progress:</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Background Check Status</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'consent_declined':
      return {
        to: recruiterEmail,
        subject: `✗ Consent Declined - ${candidateName}`,
        body: `
          <h2>Background Check Consent Declined</h2>
          <p>Dear ${recruiterName},</p>
          <p>${candidateName} has declined the background check consent.</p>
          <p>Please review the situation and contact the candidate if necessary.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'referee_invited':
      return {
        to: refereeEmail!,
        subject: `Reference Check Request for ${candidateName}`,
        body: `
          <h2>Reference Check Request</h2>
          <p>Dear ${refereeName},</p>
          <p>${candidateName} has listed you as a professional reference for a position they've applied for.</p>
          <p>We would greatly appreciate it if you could complete a brief reference questionnaire about your professional experience with ${candidateName}.</p>
          <p><a href="${referenceLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Reference Check</a></p>
          <p>The questionnaire should take approximately 5-10 minutes to complete. This link will expire in 14 days.</p>
          <p>Your feedback is confidential and will only be used for employment verification purposes.</p>
          <br/>
          <p>Thank you for your time,<br/>HRM8 Team</p>
        `,
      };

    case 'referee_completed':
      return {
        to: recruiterEmail,
        subject: `✓ Reference Completed - ${candidateName}`,
        body: `
          <h2>Reference Check Completed</h2>
          <p>Dear ${recruiterName},</p>
          <p>${refereeName || 'A referee'} has completed their reference check for ${candidateName}.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Reference Response</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'all_referees_completed':
      return {
        to: recruiterEmail,
        subject: `✓ All References Complete - ${candidateName}`,
        body: `
          <h2>All Reference Checks Completed</h2>
          <p>Dear ${recruiterName},</p>
          <p>All referees have completed their responses for ${candidateName}.</p>
          <p>You can now review all feedback and proceed with your hiring decision.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review All References</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'check_completed':
      return {
        to: recruiterEmail,
        subject: `✓ Background Check Complete - ${candidateName}`,
        body: `
          <h2>Background Check Completed</h2>
          <p>Dear ${recruiterName},</p>
          <p>The background check for ${candidateName} has been completed.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Report</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'check_requires_review':
      return {
        to: recruiterEmail,
        subject: `⚠ Review Required - ${candidateName}`,
        body: `
          <h2>Background Check Requires Review</h2>
          <p>Dear ${recruiterName},</p>
          <p>The background check for ${candidateName} requires your review before proceeding.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #ff9900; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review Now</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'check_issues_found':
      return {
        to: recruiterEmail,
        subject: `⚠ URGENT: Issues Found - ${candidateName}`,
        body: `
          <h2>Background Check - Issues Identified</h2>
          <p>Dear ${recruiterName},</p>
          <p>The background check for ${candidateName} has identified issues that require immediate attention.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #cc0000; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review Issues</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'referee_overdue':
      return {
        to: refereeEmail!,
        subject: `Reminder: Reference Check for ${candidateName}`,
        body: `
          <h2>Reference Check Reminder</h2>
          <p>Dear ${refereeName},</p>
          <p>This is a friendly reminder that we're still waiting for your reference feedback regarding ${candidateName}.</p>
          <p>If you haven't had a chance to complete the questionnaire yet, please do so at your earliest convenience:</p>
          <p><a href="${referenceLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Reference Check</a></p>
          <p>If you're unable to provide a reference, please let us know by replying to this email.</p>
          <br/>
          <p>Thank you,<br/>HRM8 Team</p>
        `,
      };

    default:
      return {
        to: recruiterEmail,
        subject: `Background Check Update - ${candidateName}`,
        body: `
          <h2>Background Check Update</h2>
          <p>Dear ${recruiterName},</p>
          <p>There's an update on the background check for ${candidateName}.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Update</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };
  }
}

/**
 * Send reminder email to overdue referees
 */
export function sendRefereeReminder(
  refereeName: string,
  refereeEmail: string,
  candidateName: string,
  referenceLink: string
): void {
  sendBackgroundCheckEmail('referee_overdue', {
    candidateName,
    candidateEmail: '',
    recruiterEmail: '',
    refereeName,
    refereeEmail,
    referenceLink,
    checkId: '',
  });
}
import type { ConsentRequest } from '@/shared/types/consent';
import type { RefereeDetails } from '@/shared/types/referee';
import { CONSENT_EMAIL_FOOTER, REFERENCE_CHECK_DISCLAIMER } from './legalTemplates';

export function generateConsentEmail(
  consent: ConsentRequest,
  consentUrl: string
): string {
  const checksHtml = consent.requestedChecks
    .map(check => `<li><strong>${check.description}</strong> via ${check.provider} - $${check.cost}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .checks-list { background: white; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Background Check Consent Request</h1>
    </div>
    <div class="content">
      <p>Dear ${consent.candidateName},</p>
      
      <p>As part of your application process, we need your consent to conduct the following background checks:</p>
      
      <div class="checks-list">
        <h3>Requested Checks:</h3>
        <ul>
          ${checksHtml}
        </ul>
        <p><strong>Total Cost: $${consent.requestedChecks.reduce((sum, c) => sum + c.cost, 0)}</strong></p>
      </div>
      
      <div class="warning">
        <strong>⏰ Important:</strong> This consent request will expire on ${new Date(consent.expiryDate).toLocaleDateString()} (7 days).
      </div>
      
      <p>To review and provide your consent, please click the button below:</p>
      
      <div style="text-align: center;">
        <a href="${consentUrl}" class="button">Review & Provide Consent</a>
      </div>
      
      <p>The consent form will explain your rights under the Fair Credit Reporting Act (FCRA) and allow you to review the full legal disclosure before signing.</p>
      
      <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      ${CONSENT_EMAIL_FOOTER}
    </div>
  </div>
</body>
</html>
  `;
}

export function generateRefereeInvitationEmail(
  referee: RefereeDetails,
  candidateName: string,
  questionnaireUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .info-box { background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reference Request</h1>
    </div>
    <div class="content">
      <p>Dear ${referee.name},</p>
      
      <p><strong>${candidateName}</strong> has listed you as a professional reference and we would greatly appreciate your feedback.</p>
      
      <div class="info-box">
        <h3>What we're asking:</h3>
        <ul>
          <li>📊 Rate their performance in key areas</li>
          <li>💬 Share your thoughts on their strengths</li>
          <li>⏱️ Estimated time: 5-7 minutes</li>
        </ul>
      </div>
      
      <p>Your honest feedback will help us make informed hiring decisions. All responses are confidential.</p>
      
      <div style="text-align: center;">
        <a href="${questionnaireUrl}" class="button">Complete Questionnaire</a>
      </div>
      
      <p><em>${REFERENCE_CHECK_DISCLAIMER}</em></p>
      
      <p>Thank you for your time and assistance.</p>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email from HRM8. Please do not reply directly to this email.</p>
      <p>If you believe you received this email in error, please contact support@hrm8.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateReminderEmail(
  referee: RefereeDetails,
  candidateName: string,
  questionnaireUrl: string,
  reminderNumber: number
): string {
  const subject = reminderNumber === 1 ? 'Gentle Reminder' : 'Final Reminder';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${subject}: Reference Request</h1>
    </div>
    <div class="content">
      <p>Dear ${referee.name},</p>
      
      <p>This is a ${reminderNumber === 1 ? 'friendly' : 'final'} reminder about the reference request for <strong>${candidateName}</strong>.</p>
      
      <p>We haven't yet received your feedback and would greatly appreciate your input. It will only take 5-7 minutes to complete.</p>
      
      <div style="text-align: center;">
        <a href="${questionnaireUrl}" class="button">Complete Questionnaire Now</a>
      </div>
      
      <p>Your insights are valuable and will help us make the best hiring decision.</p>
      
      <p>Thank you for your time.</p>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      <p>This is an automated reminder from HRM8.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCompletionNotificationEmail(
  candidateName: string,
  recruiterName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Reference Check Completed</h1>
    </div>
    <div class="content">
      <p>Hi ${recruiterName},</p>
      
      <p>Great news! A reference check for <strong>${candidateName}</strong> has been completed.</p>
      
      <p>You can now view the results in the candidate's background checks tab.</p>
      
      <div style="text-align: center;">
        <a href="${window.location.origin}/background-checks" class="button">View Results</a>
      </div>
      
      <p>Best regards,<br>The HRM8 Team</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from HRM8.</p>
    </div>
  </div>
</body>
</html>
  `;
}
import type { EscalationRule, EscalationEvent } from '@/shared/types/escalation';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import { createNotification } from '@/shared/lib/notificationStorage';

const RULES_KEY = 'hrm8_escalation_rules';
const EVENTS_KEY = 'hrm8_escalation_events';

// Default escalation rules
const DEFAULT_RULES: Omit<EscalationRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Consent Not Received - 5 Days',
    description: 'Escalate when consent has not been received for 5 days',
    status: 'pending-consent',
    daysThreshold: 5,
    escalateTo: ['manager-1'],
    escalateToNames: ['Hiring Manager'],
    notifyOriginalInitiator: true,
    priority: 'high',
    enabled: true,
    createdBy: 'system',
  },
  {
    name: 'In Progress - 14 Days',
    description: 'Escalate when check has been in progress for 14 days',
    status: 'in-progress',
    daysThreshold: 14,
    escalateTo: ['manager-1', 'hr-director'],
    escalateToNames: ['Hiring Manager', 'HR Director'],
    notifyOriginalInitiator: true,
    priority: 'medium',
    enabled: true,
    createdBy: 'system',
  },
  {
    name: 'Issues Found - Not Reviewed - 3 Days',
    description: 'Escalate when issues have not been reviewed for 3 days',
    status: 'issues-found',
    daysThreshold: 3,
    escalateTo: ['hr-director'],
    escalateToNames: ['HR Director'],
    notifyOriginalInitiator: true,
    priority: 'critical',
    enabled: true,
    createdBy: 'system',
  },
];

function initializeRules() {
  const existing = localStorage.getItem(RULES_KEY);
  if (!existing) {
    const rules = DEFAULT_RULES.map((rule, index) => ({
      ...rule,
      id: `rule-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  }
}

export function getEscalationRules(): EscalationRule[] {
  initializeRules();
  const data = localStorage.getItem(RULES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEscalationRule(rule: EscalationRule): void {
  const rules = getEscalationRules();
  const index = rules.findIndex(r => r.id === rule.id);
  
  if (index !== -1) {
    rules[index] = { ...rule, updatedAt: new Date().toISOString() };
  } else {
    rules.push(rule);
  }
  
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function deleteEscalationRule(ruleId: string): void {
  const rules = getEscalationRules().filter(r => r.id !== ruleId);
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

function getEscalationEvents(): EscalationEvent[] {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEscalationEvent(event: EscalationEvent): void {
  const events = getEscalationEvents();
  events.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getCheckEscalations(checkId: string): EscalationEvent[] {
  return getEscalationEvents().filter(e => e.checkId === checkId);
}

export function acknowledgeEscalation(eventId: string, userId: string, userName: string): void {
  const events = getEscalationEvents();
  const index = events.findIndex(e => e.id === eventId);
  
  if (index !== -1) {
    events[index].acknowledged = true;
    events[index].acknowledgedBy = userId;
    events[index].acknowledgedAt = new Date().toISOString();
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
}

export function resolveEscalation(eventId: string, userId: string, userName: string, notes?: string): void {
  const events = getEscalationEvents();
  const index = events.findIndex(e => e.id === eventId);
  
  if (index !== -1) {
    events[index].resolved = true;
    events[index].resolvedBy = userId;
    events[index].resolvedAt = new Date().toISOString();
    if (notes) events[index].notes = notes;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
}

export function processEscalations(): void {
  const rules = getEscalationRules().filter(r => r.enabled);
  const checks = getBackgroundChecks();
  const now = new Date();
  
  rules.forEach(rule => {
    const eligibleChecks = checks.filter(check => {
      if (check.status !== rule.status) return false;
      
      const statusDate = new Date(check.initiatedDate);
      const daysPending = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPending < rule.daysThreshold) return false;
      
      // Check if already escalated recently
      const recentEscalations = getCheckEscalations(check.id).filter(e => {
        const escalatedDate = new Date(e.escalatedAt);
        const hoursSince = (now.getTime() - escalatedDate.getTime()) / (1000 * 60 * 60);
        return hoursSince < 24; // Don't escalate more than once per day
      });
      
      return recentEscalations.length === 0;
    });
    
    eligibleChecks.forEach(check => {
      triggerEscalation(rule, check);
    });
  });
}

function triggerEscalation(rule: EscalationRule, check: BackgroundCheck): void {
  const now = new Date();
  const statusDate = new Date(check.initiatedDate);
  const daysPending = Math.floor((now.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const event: EscalationEvent = {
    id: `esc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ruleId: rule.id,
    ruleName: rule.name,
    checkId: check.id,
    candidateName: check.candidateName,
    status: check.status,
    daysPending,
    escalatedTo: rule.escalateTo,
    escalatedAt: now.toISOString(),
    acknowledged: false,
    resolved: false,
  };
  
  saveEscalationEvent(event);
  
  // Send notifications to escalation targets
  rule.escalateTo.forEach(userId => {
    createNotification({
      userId,
      category: 'system',
      type: 'warning',
      priority: rule.priority,
      title: `Background Check Escalation: ${rule.name}`,
      message: `${check.candidateName}'s background check has been ${check.status} for ${daysPending} days. Immediate attention required.`,
      link: `/background-checks/${check.id}`,
      read: false,
      archived: false,
      metadata: {
        entityType: 'background-check',
        entityId: check.id,
        escalationId: event.id,
        ruleId: rule.id,
      }
    });
  });
  
  // Notify original initiator if configured
  if (rule.notifyOriginalInitiator) {
    createNotification({
      userId: check.initiatedBy,
      category: 'system',
      type: 'info',
      priority: 'medium',
      title: `Background Check Escalated`,
      message: `${check.candidateName}'s background check has been escalated to management due to ${daysPending} days in ${check.status} status.`,
      link: `/background-checks/${check.id}`,
      read: false,
      archived: false,
      metadata: {
        entityType: 'background-check',
        entityId: check.id,
        escalationId: event.id,
      }
    });
  }
}

export function getEscalationStats() {
  const events = getEscalationEvents();
  const last30Days = events.filter(e => {
    const date = new Date(e.escalatedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });
  
  return {
    totalEscalations: events.length,
    escalationsLast30Days: last30Days.length,
    activeEscalations: events.filter(e => !e.resolved).length,
    acknowledgedNotResolved: events.filter(e => e.acknowledged && !e.resolved).length,
    averageResolutionTime: calculateAverageResolutionTime(events.filter(e => e.resolved)),
  };
}

function calculateAverageResolutionTime(resolvedEvents: EscalationEvent[]): number {
  if (resolvedEvents.length === 0) return 0;
  
  const totalHours = resolvedEvents.reduce((sum, event) => {
    const escalated = new Date(event.escalatedAt).getTime();
    const resolved = new Date(event.resolvedAt!).getTime();
    return sum + (resolved - escalated) / (1000 * 60 * 60);
  }, 0);
  
  return Math.round(totalHours / resolvedEvents.length);
}
import { generateMockAISession } from './mockAISessionData';
import { saveAISession } from './aiReferenceCheckStorage';
import { getReferees, updateReferee } from './refereeStorage';

/**
 * Initialize mock AI session data for testing
 * Links AI sessions to existing referees
 */
export function initializeAISessionTestData() {
  const referees = getReferees();
  
  if (referees.length === 0) {
    console.log('No referees found, skipping AI session initialization');
    return;
  }

  // Create AI sessions for first 5 referees
  const refereesToProcess = referees.slice(0, Math.min(5, referees.length));
  
  refereesToProcess.forEach((referee, index) => {
    // Alternate between video and phone modes
    const mode = index % 2 === 0 ? 'video' : 'phone';
    
    // Mix of scheduled, in-progress, and completed sessions
    let status: 'scheduled' | 'in-progress' | 'completed';
    if (index === 0) {
      status = 'scheduled'; // First one is scheduled for testing
    } else if (index === 1) {
      status = 'in-progress';
    } else {
      status = 'completed';
    }
    
    const aiSession = generateMockAISession(
      referee.id,
      referee.candidateId,
      referee.backgroundCheckId,
      mode as any,
      status
    );
    
    // Save the AI session
    saveAISession(aiSession);
    
    // Update referee with AI session information
    updateReferee(referee.id, {
      preferredMode: mode as any,
      aiSessionId: aiSession.id
    });
    
    console.log(`Created ${mode} AI session (${status}) for referee ${referee.name}`);
  });
  
  console.log(`Initialized ${refereesToProcess.length} AI sessions`);
}
export const LEGAL_DISCLOSURE_TEMPLATE = `
# Background Check Authorization and Disclosure

## Authorization for Background Investigation

I hereby authorize HRM8 and its designated agents and representatives to conduct a comprehensive review of my background. I understand that the scope of the background check may include, but is not limited to:

- Identity verification
- Employment history verification  
- Education and professional qualification verification
- Criminal record checks
- Credit history (if applicable)
- Reference checks from former employers and professional contacts
- Professional license verifications

## Disclosure of Investigation

I understand that a consumer report and/or investigative consumer report may be obtained for employment purposes from a consumer reporting agency. These reports may contain information about my character, general reputation, personal characteristics, and mode of living.

## Rights Under the Fair Credit Reporting Act (FCRA)

I acknowledge that I have received, read, and understand the **Summary of Your Rights Under the Fair Credit Reporting Act**, which is available at: [FCRA Rights Summary]

## Consent

By signing below, I certify that:

1. The information I have provided is true, complete, and correct
2. I authorize the release of any information related to the background investigation
3. I release all parties from liability for any damages that may result from providing this information
4. I understand that any false information provided may result in withdrawal of a job offer or termination of employment
5. I understand that I may receive a copy of any report that is prepared

## Data Privacy

All information collected will be handled in accordance with applicable data protection laws and regulations. For more information, please review our Privacy Policy.

## Additional State Disclosures

**California Residents**: Under California Civil Code section 1786.22, you have the right to request the nature and scope of any investigative consumer report prepared on you.

**New York Residents**: Upon request, you will be informed whether or not a consumer report was requested, and if such report was requested, the name and address of the consumer reporting agency.

**Washington Residents**: You have the right to request from the consumer reporting agency a written summary of your rights and remedies under the Washington Fair Credit Reporting Act.

## Acknowledgment

I acknowledge that I have carefully read and understand this authorization and disclosure form. I voluntarily consent to the background investigation described above.

---

**Important**: This consent remains valid for the duration of my application process and, if hired, throughout my employment.
`;

export const PRIVACY_POLICY_URL = 'https://hrm8.com/privacy-policy';

export const CONSENT_EMAIL_FOOTER = `
This background check is conducted in accordance with the Fair Credit Reporting Act (FCRA) and all applicable federal, state, and local laws.

If you have any questions about this request, please contact our support team at support@hrm8.com.
`;

export const REFERENCE_CHECK_DISCLAIMER = `
**For Referees**: The information you provide will be kept confidential and used solely for employment screening purposes. Your responses will help us make informed hiring decisions. Thank you for taking the time to provide your feedback.
`;
import type { AITranscriptionSummary, EditableReport } from '@/shared/types/aiReferenceReport';
import { generateReportHTML } from './reportTemplate';

export function generateMockAIReport(sessionId: string, candidateId: string): EditableReport {
  const summaries: AITranscriptionSummary[] = [
    {
      sessionId,
      candidateId,
      candidateName: 'Sarah Johnson',
      refereeInfo: {
        name: 'Michael Chen',
        relationship: 'manager',
        companyName: 'TechCorp Inc.',
        yearsKnown: '3 years',
      },
      sessionDetails: {
        mode: 'video',
        duration: 1245,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        questionsAsked: 12,
      },
      executiveSummary: `Sarah Johnson demonstrated exceptional technical skills and leadership qualities during her tenure at TechCorp. As her direct manager for three years, I observed consistent high performance, innovative problem-solving, and strong team collaboration. She successfully led multiple high-stakes projects, consistently delivering ahead of schedule. Her communication skills are outstanding, and she has a natural ability to mentor junior team members. Sarah's departure was due to relocation, and I would enthusiastically rehire her given the opportunity.`,
      keyFindings: {
        strengths: [
          'Exceptional technical expertise in full-stack development with React and Node.js',
          'Outstanding leadership skills, successfully managed team of 5 developers',
          'Consistently delivered projects 15-20% ahead of schedule',
          'Strong communication and stakeholder management abilities',
          'Natural mentor who helped onboard 8 new team members',
          'Innovative problem-solver who implemented solutions saving 40% development time',
        ],
        concerns: [
          'Occasionally took on too many responsibilities, leading to minor burnout incidents',
          'Could improve delegation skills when under pressure',
        ],
        neutralObservations: [
          'Preferred working remotely 3 days per week',
          'Most productive during afternoon hours',
          'Enjoyed collaborative work but also valued independent time for complex tasks',
        ],
      },
      categoryBreakdown: [
        {
          category: 'Technical Skills',
          score: 5,
          summary: 'Exceptional technical capabilities across the full stack. Deep expertise in React, TypeScript, Node.js, and cloud architecture. Consistently produced high-quality, maintainable code.',
          evidence: [
            'Led the migration to microservices architecture, reducing system downtime by 60%',
            'Implemented automated testing framework that improved code coverage to 95%',
            'Architected scalable solutions handling 10M+ daily active users',
          ],
        },
        {
          category: 'Leadership & Management',
          score: 4,
          summary: 'Strong leadership skills with proven ability to guide and inspire team members. Successfully managed cross-functional projects and mentored junior developers.',
          evidence: [
            'Led team of 5 developers through successful product launch',
            'Mentored 8 junior developers, 6 of whom were promoted within 18 months',
            'Facilitated agile ceremonies and maintained team morale during challenging sprints',
          ],
        },
        {
          category: 'Communication',
          score: 5,
          summary: 'Excellent communicator at all levels. Effectively translated technical concepts to non-technical stakeholders and maintained clear documentation.',
          evidence: [
            'Presented quarterly technical updates to C-suite executives',
            'Created comprehensive documentation adopted as company standard',
            'Resolved conflicts diplomatically and maintained positive team dynamics',
          ],
        },
        {
          category: 'Work Ethic & Reliability',
          score: 5,
          summary: 'Extremely reliable and dedicated professional. Consistently exceeded expectations and demonstrated strong commitment to quality and deadlines.',
          evidence: [
            'Never missed a project deadline in 3 years',
            'Voluntarily worked extra hours during critical product launches',
            'Maintained 99.5% attendance record',
          ],
        },
        {
          category: 'Problem Solving',
          score: 5,
          summary: 'Outstanding analytical and problem-solving abilities. Demonstrated creativity in addressing complex technical challenges.',
          evidence: [
            'Resolved critical production bug that had stumped team for weeks',
            'Proposed innovative caching solution reducing API costs by 70%',
            'Regularly identified optimization opportunities before they became issues',
          ],
        },
      ],
      conversationHighlights: [
        {
          question: 'Can you describe a challenging project Sarah led and how she handled it?',
          answer: 'Sarah led our microservices migration, which was arguably our most complex technical project. She broke it down into manageable phases, established clear milestones, and kept everyone aligned through daily standups and comprehensive documentation. When we hit unexpected API compatibility issues, she quickly pivoted the approach and found an elegant solution. The project finished two weeks early.',
          significance: 'Demonstrates strong project management, adaptability, and technical problem-solving under pressure',
          timestamp: 145,
        },
        {
          question: 'How would you rate Sarah\'s ability to work with cross-functional teams?',
          answer: 'Excellent. Sarah collaborated closely with product, design, and DevOps teams. She had a unique ability to understand their perspectives and translate between technical and business language. Product managers specifically requested her for high-visibility projects because she made their jobs easier.',
          significance: 'Shows strong cross-functional collaboration and communication skills valued by leadership',
          timestamp: 342,
        },
        {
          question: 'Were there any areas where Sarah struggled or needed improvement?',
          answer: 'The only issue was that Sarah sometimes took on too much. She had trouble saying no to new requests, which occasionally led to working late nights. We had discussions about work-life balance and delegation. She improved in her final year, but it\'s something to monitor.',
          significance: 'Honest assessment of work-life balance challenges and growth areas',
          timestamp: 567,
        },
      ],
      redFlags: [
        {
          severity: 'minor',
          description: 'Tendency to overcommit and take on excessive responsibilities',
          evidence: 'Multiple occasions where Sarah worked late nights or weekends to meet self-imposed high standards. Required coaching on delegation and prioritization.',
        },
      ],
      verificationItems: [
        {
          claim: 'Managed team of 5 developers',
          verified: true,
          notes: 'Confirmed through HR records and org chart',
        },
        {
          claim: 'Led microservices migration project',
          verified: true,
          notes: 'Project documented in company systems, completed Q2 2023',
        },
        {
          claim: 'Mentored 8 junior developers',
          verified: true,
          notes: 'Cross-referenced with performance reviews and mentorship program records',
        },
      ],
      recommendation: {
        overallScore: 92,
        hiringRecommendation: 'strongly-recommend',
        confidenceLevel: 0.95,
        reasoningSummary: 'Sarah Johnson is an exceptional candidate who consistently exceeded expectations in all areas. Her technical expertise, leadership abilities, and communication skills make her an ideal hire for senior engineering roles. The minor concern about overcommitment is manageable with proper boundaries. I would enthusiastically rehire her and believe she would be a valuable asset to any engineering team.',
      },
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'ai',
    },
    {
      sessionId: 'session_2',
      candidateId,
      candidateName: 'James Martinez',
      refereeInfo: {
        name: 'Lisa Wong',
        relationship: 'colleague',
        companyName: 'DataFlow Solutions',
      },
      sessionDetails: {
        mode: 'phone',
        duration: 890,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        questionsAsked: 10,
      },
      executiveSummary: `James Martinez is a solid mid-level developer with good technical skills and a positive attitude. During our two years working together, he consistently delivered quality work and was a reliable team player. While he may not be the most innovative developer, his dependability and steady performance made him a valuable contributor. He learns quickly and adapts well to new technologies.`,
      keyFindings: {
        strengths: [
          'Reliable and consistent performer',
          'Good technical skills in React and JavaScript',
          'Positive team player with strong work ethic',
          'Quick learner who adapts to new technologies',
        ],
        concerns: [
          'Limited experience leading projects or teams',
          'Sometimes needs guidance on architectural decisions',
          'Could be more proactive in suggesting improvements',
        ],
        neutralObservations: [
          'Preferred structured tasks with clear requirements',
          'Worked well within established processes',
        ],
      },
      categoryBreakdown: [
        {
          category: 'Technical Skills',
          score: 3,
          summary: 'Competent developer with solid fundamentals. Handles standard development tasks well but needs support on complex architectural decisions.',
          evidence: [
            'Successfully implemented assigned features with minimal bugs',
            'Maintained existing codebase effectively',
          ],
        },
        {
          category: 'Leadership & Management',
          score: 2,
          summary: 'Limited leadership experience. Functions better as an individual contributor under guidance.',
          evidence: [
            'Rarely volunteered for leadership roles',
            'Occasionally assisted junior developers but not consistently',
          ],
        },
        {
          category: 'Communication',
          score: 3,
          summary: 'Clear communicator within the team. Could improve stakeholder communication and presentation skills.',
          evidence: [
            'Provided clear updates in standups',
            'Documentation was adequate but not exceptional',
          ],
        },
        {
          category: 'Work Ethic & Reliability',
          score: 4,
          summary: 'Very reliable and consistent. Always delivered on commitments and maintained good attendance.',
          evidence: [
            'Met all deadlines during our time working together',
            'Dependable team member who showed up prepared',
          ],
        },
      ],
      conversationHighlights: [
        {
          question: 'What are James\'s greatest strengths?',
          answer: 'His reliability and work ethic. You could always count on James to deliver what he committed to. He was also very easy to work with and maintained a positive attitude.',
          significance: 'Emphasizes dependability and team compatibility',
          timestamp: 234,
        },
      ],
      redFlags: [],
      verificationItems: [
        {
          claim: 'Worked together for 2 years',
          verified: true,
          notes: 'Timeframe matches employment records',
        },
      ],
      recommendation: {
        overallScore: 68,
        hiringRecommendation: 'recommend',
        confidenceLevel: 0.75,
        reasoningSummary: 'James is a dependable mid-level developer who would be a solid addition to a team. He may not be a standout performer, but his reliability and positive attitude make him a safe hire for roles that need steady, consistent contributors.',
      },
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'ai',
    },
  ];

  const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    summary: {
      ...randomSummary,
      sessionId,
      candidateId,
    },
    editableContent: generateReportHTML({
      ...randomSummary,
      sessionId,
      candidateId,
    }),
    version: 1,
    status: Math.random() > 0.5 ? 'draft' : 'reviewed',
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateMultipleMockReports(count: number): EditableReport[] {
  const reports: EditableReport[] = [];
  for (let i = 0; i < count; i++) {
    reports.push(generateMockAIReport(
      `session_${i + 1}`,
      `candidate_${i + 1}`
    ));
  }
  return reports;
}
import { v4 as uuidv4 } from 'uuid';
import type { 
  AIReferenceCheckSession, 
  InterviewTranscript, 
  TranscriptTurn,
  SessionRecording,
  AIAnalysis,
  CategoryScore 
} from '@/shared/types/aiReferenceCheck';

const SAMPLE_QUESTIONS = [
  "Can you tell me about your professional relationship with the candidate?",
  "How would you describe their work ethic and reliability?",
  "What are their key strengths in a professional setting?",
  "Are there any areas where they could improve?",
  "How do they handle challenging situations or pressure?",
  "Would you recommend them for this position? Why or why not?",
  "How well do they work with team members?",
  "Can you provide a specific example of their leadership or problem-solving skills?",
  "How do they handle feedback and criticism?",
  "Is there anything else you'd like to add about the candidate?"
];

const SAMPLE_RESPONSES = [
  "I worked directly with them for about two years as their manager in the marketing department.",
  "They are extremely reliable and always meet deadlines. I could count on them to deliver quality work consistently.",
  "Their analytical skills are exceptional, and they have great attention to detail. They're also very collaborative.",
  "Sometimes they can be a bit perfectionistic, which occasionally slows down project timelines, but the quality is always worth it.",
  "They remain calm under pressure and often volunteer to help others when things get hectic. Very composed.",
  "Absolutely, I would highly recommend them. They were one of my top performers and would be an asset to any team.",
  "Excellent team player. They actively listen to others and contribute meaningfully to group discussions.",
  "When we had a major client deadline at risk, they took initiative to reorganize the workflow and got us back on track.",
  "They're very receptive to feedback and actively seek it out. I've seen them implement suggestions quickly and effectively.",
  "They're a natural mentor and have helped onboard several new team members during their tenure with us."
];

const CATEGORIES = [
  { name: 'Technical Skills', minScore: 3, maxScore: 5 },
  { name: 'Communication', minScore: 4, maxScore: 5 },
  { name: 'Leadership', minScore: 3, maxScore: 5 },
  { name: 'Teamwork', minScore: 4, maxScore: 5 },
  { name: 'Problem Solving', minScore: 3, maxScore: 5 },
  { name: 'Work Ethic', minScore: 4, maxScore: 5 }
];

const SENTIMENTS = ['positive', 'neutral', 'negative', 'mixed'] as const;
const QUESTION_SOURCES = ['pre-written', 'ai-derived', 'template', 'dynamic'] as const;

function generateTranscript(sessionId: string, numQuestions: number = 8): InterviewTranscript {
  const turns: TranscriptTurn[] = [];
  let currentTimestamp = 0;

  for (let i = 0; i < numQuestions && i < SAMPLE_QUESTIONS.length; i++) {
    // AI asks question
    turns.push({
      id: uuidv4(),
      speaker: 'ai-recruiter',
      text: SAMPLE_QUESTIONS[i],
      timestamp: currentTimestamp,
      confidence: 0.98
    });
    currentTimestamp += Math.floor(Math.random() * 5) + 3; // 3-8 seconds

    // Referee responds
    turns.push({
      id: uuidv4(),
      speaker: 'referee',
      text: SAMPLE_RESPONSES[i] || "Yes, I can provide more details about that.",
      timestamp: currentTimestamp,
      confidence: 0.92 + Math.random() * 0.07 // 0.92-0.99
    });
    currentTimestamp += Math.floor(Math.random() * 30) + 15; // 15-45 seconds
  }

  return {
    sessionId,
    turns,
    summary: "Comprehensive reference check covering professional experience, work ethic, strengths, areas for improvement, and overall recommendation.",
    generatedAt: new Date().toISOString()
  };
}

function generateRecording(sessionId: string, duration: number): SessionRecording {
  return {
    sessionId,
    videoUrl: `/mock-recordings/${sessionId}.mp4`,
    audioUrl: `/mock-recordings/${sessionId}.mp3`,
    duration,
    format: 'mp4',
    size: Math.floor(duration * 1024 * 50), // ~50KB per second
    uploadedAt: new Date().toISOString()
  };
}

function generateAnalysis(sessionId: string): AIAnalysis {
  const categories: CategoryScore[] = CATEGORIES.map(cat => ({
    category: cat.name,
    score: Math.floor(Math.random() * (cat.maxScore - cat.minScore + 1)) + cat.minScore,
    evidence: [
      SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)],
      SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)]
    ]
  }));

  const avgScore = categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length;
  const sentiment = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];

  return {
    sessionId,
    overallRating: Math.round(avgScore * 10) / 10,
    sentiment,
    keyInsights: [
      "Strong technical competency with proven track record",
      "Excellent collaboration and communication skills",
      "Demonstrates leadership potential",
      "Highly recommended by reference with no significant concerns"
    ],
    strengths: [
      "Analytical thinking and attention to detail",
      "Reliable and consistently meets deadlines",
      "Strong team player and natural mentor",
      "Handles pressure well and remains composed"
    ],
    concerns: [
      "Tendency towards perfectionism may occasionally slow progress",
      "Could benefit from delegating more routine tasks"
    ],
    recommendationScore: Math.floor(Math.random() * 20) + 80, // 80-100
    categories,
    aiConfidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
    generatedAt: new Date().toISOString()
  };
}

export function generateMockAISession(
  refereeId: string,
  candidateId: string,
  backgroundCheckId: string,
  mode: AIReferenceCheckSession['mode'] = 'video',
  status: AIReferenceCheckSession['status'] = 'completed'
): AIReferenceCheckSession {
  const sessionId = uuidv4();
  const duration = Math.floor(Math.random() * 600) + 300; // 5-15 minutes in seconds
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

  const session: AIReferenceCheckSession = {
    id: sessionId,
    refereeId,
    candidateId,
    backgroundCheckId,
    mode,
    status,
    questionSource: QUESTION_SOURCES[Math.floor(Math.random() * QUESTION_SOURCES.length)],
    createdAt,
    updatedAt: createdAt
  };

  if (status === 'scheduled') {
    session.scheduledDate = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(); // Next 7 days
  }

  if (status === 'in-progress') {
    session.startedAt = new Date(now.getTime() - Math.random() * 600 * 1000).toISOString(); // Started within last 10 minutes
  }

  if (status === 'completed') {
    const startTime = new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000); // Last 5 days
    session.startedAt = startTime.toISOString();
    session.completedAt = new Date(startTime.getTime() + duration * 1000).toISOString();
    session.duration = duration;
    session.transcript = generateTranscript(sessionId);
    session.analysis = generateAnalysis(sessionId);
    
    if (mode === 'video') {
      session.recording = generateRecording(sessionId, duration);
    } else if (mode === 'phone') {
      session.recording = {
        ...generateRecording(sessionId, duration),
        videoUrl: undefined
      };
    }
  }

  return session;
}

export function generateMockAISessions(count: number = 10): AIReferenceCheckSession[] {
  const sessions: AIReferenceCheckSession[] = [];
  const modes: AIReferenceCheckSession['mode'][] = ['video', 'phone', 'questionnaire'];
  const statuses: AIReferenceCheckSession['status'][] = ['scheduled', 'in-progress', 'completed', 'completed', 'completed']; // Weight towards completed

  for (let i = 0; i < count; i++) {
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    sessions.push(generateMockAISession(
      `referee-${uuidv4()}`,
      `candidate-${uuidv4()}`,
      `bg-check-${uuidv4()}`,
      mode,
      status
    ));
  }

  return sessions;
}

export function getMockTranscriptPreview(transcript: InterviewTranscript, maxTurns: number = 4): TranscriptTurn[] {
  return transcript.turns.slice(0, maxTurns);
}

export function calculateSessionDuration(transcript: InterviewTranscript): number {
  if (transcript.turns.length === 0) return 0;
  const lastTurn = transcript.turns[transcript.turns.length - 1];
  return Math.ceil(lastTurn.timestamp / 60); // Convert to minutes
}

export function getAverageRating(sessions: AIReferenceCheckSession[]): number {
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.analysis);
  if (completedSessions.length === 0) return 0;
  
  const sum = completedSessions.reduce((acc, s) => acc + (s.analysis?.overallRating || 0), 0);
  return Math.round((sum / completedSessions.length) * 10) / 10;
}

export function getCompletionRate(sessions: AIReferenceCheckSession[]): number {
  if (sessions.length === 0) return 0;
  const completed = sessions.filter(s => s.status === 'completed').length;
  return Math.round((completed / sessions.length) * 100);
}
import { createNotification } from '@/shared/lib/notificationStorage';
import { Notification } from '@/shared/types/notification';

export type BackgroundCheckNotificationEvent =
  | 'consent_requested'
  | 'consent_given'
  | 'consent_declined'
  | 'consent_expired'
  | 'consent_reminder'
  | 'referee_invited'
  | 'referee_opened'
  | 'referee_completed'
  | 'referee_overdue'
  | 'referee_reminder'
  | 'check_initiated'
  | 'check_completed'
  | 'check_requires_review'
  | 'check_issues_found'
  | 'all_referees_completed'
  | 'check_cancelled';

interface NotificationContext {
  candidateName: string;
  candidateEmail?: string;
  checkId: string;
  jobTitle?: string;
  refereeName?: string;
  checkType?: string;
  recruiterEmail?: string;
  reminderNumber?: number;
}

/**
 * Creates notifications for background check events
 * Sends to recruiters/admins with appropriate priority and category
 */
export function createBackgroundCheckNotification(
  event: BackgroundCheckNotificationEvent,
  context: NotificationContext,
  recipientUserId: string = 'user-1' // Default mock user, should be actual recruiter ID
): Notification {
  const notificationConfig = getNotificationConfig(event, context);
  
  return createNotification({
    userId: recipientUserId,
    category: 'document', // Background checks fall under document category
    type: notificationConfig.type,
    priority: notificationConfig.priority,
    title: notificationConfig.title,
    message: notificationConfig.message,
    link: notificationConfig.link,
    read: false,
    archived: false,
    actionType: notificationConfig.actionType,
    metadata: {
      checkId: context.checkId,
      candidateName: context.candidateName,
      event,
      ...context,
    },
  });
}

function getNotificationConfig(
  event: BackgroundCheckNotificationEvent,
  context: NotificationContext
) {
  const { candidateName, refereeName, checkType, jobTitle } = context;

  switch (event) {
    case 'consent_given':
      return {
        type: 'success' as const,
        priority: 'medium' as const,
        title: `✓ Consent Approved - ${candidateName}`,
        message: `${candidateName} has approved the background check consent. Checks are now in progress.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'consent_declined':
      return {
        type: 'warning' as const,
        priority: 'high' as const,
        title: `✗ Consent Declined - ${candidateName}`,
        message: `${candidateName} has declined the background check consent. Please review and contact candidate.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'consent_expired':
      return {
        type: 'warning' as const,
        priority: 'medium' as const,
        title: `⏰ Consent Expired - ${candidateName}`,
        message: `Background check consent for ${candidateName} has expired. Resend consent request to proceed.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'consent_reminder':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `📧 Consent Reminder Sent - ${candidateName}`,
        message: `Reminder #${context.reminderNumber || 1} sent to ${candidateName} for pending consent.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_completed':
      return {
        type: 'success' as const,
        priority: 'medium' as const,
        title: `✓ Reference Completed - ${candidateName}`,
        message: `${refereeName || 'A referee'} has completed their reference check for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_overdue':
      return {
        type: 'warning' as const,
        priority: 'medium' as const,
        title: `⏰ Overdue Reference - ${candidateName}`,
        message: `Reference check from ${refereeName || 'a referee'} for ${candidateName} is overdue. Consider sending a reminder.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'referee_reminder':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `📧 Referee Reminder Sent`,
        message: `Reminder #${context.reminderNumber || 1} sent to ${refereeName || 'referee'} for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'all_referees_completed':
      return {
        type: 'success' as const,
        priority: 'high' as const,
        title: `✓ All References Complete - ${candidateName}`,
        message: `All referees have completed their responses for ${candidateName}. Review the feedback.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_completed':
      return {
        type: 'success' as const,
        priority: 'high' as const,
        title: `✓ Check Complete - ${candidateName}`,
        message: `Background check for ${candidateName} has been completed. ${checkType ? `(${checkType})` : ''}`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_requires_review':
      return {
        type: 'warning' as const,
        priority: 'high' as const,
        title: `⚠ Review Required - ${candidateName}`,
        message: `Background check for ${candidateName} requires your review before proceeding.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_issues_found':
      return {
        type: 'error' as const,
        priority: 'critical' as const,
        title: `⚠ Issues Found - ${candidateName}`,
        message: `Background check for ${candidateName} has identified issues that require immediate attention.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_initiated':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Background Check Started - ${candidateName}`,
        message: `Background check process has been initiated for ${candidateName}${jobTitle ? ` (${jobTitle})` : ''}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'consent_requested':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Consent Requested - ${candidateName}`,
        message: `Background check consent has been sent to ${candidateName}. Awaiting response.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_invited':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Reference Invited - ${candidateName}`,
        message: `Reference check invitation sent to ${refereeName || 'referee'} for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_opened':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Reference Opened - ${candidateName}`,
        message: `${refereeName || 'A referee'} has opened the reference check form for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'check_cancelled':
      return {
        type: 'warning' as const,
        priority: 'medium' as const,
        title: `Check Cancelled - ${candidateName}`,
        message: `Background check for ${candidateName} has been cancelled.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    default:
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Background Check Update - ${candidateName}`,
        message: `There's an update on the background check for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };
  }
}

/**
 * Bulk notification for multiple events
 */
export function createBulkNotifications(
  events: Array<{ event: BackgroundCheckNotificationEvent; context: NotificationContext }>,
  recipientUserId?: string
): Notification[] {
  return events.map(({ event, context }) =>
    createBackgroundCheckNotification(event, context, recipientUserId)
  );
}
import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface PeriodMetrics {
  totalChecks: number;
  completed: number;
  active: number;
  completionRate: number;
  avgCompletionTime: number;
  issuesFound: number;
}

export interface PeriodComparison {
  current: PeriodMetrics;
  previous: PeriodMetrics;
  changes: {
    totalChecks: number;
    totalChecksPercent: number;
    completed: number;
    completedPercent: number;
    completionRate: number;
    avgCompletionTime: number;
    avgCompletionTimePercent: number;
  };
}

function calculateMetrics(checks: BackgroundCheck[]): PeriodMetrics {
  const completed = checks.filter(c => c.status === 'completed');
  const active = checks.filter(c => ['pending-consent', 'in-progress'].includes(c.status));
  const issuesFound = checks.filter(c => c.status === 'issues-found');
  
  const completionRate = checks.length > 0 ? (completed.length / checks.length) * 100 : 0;
  
  const avgCompletionTime = completed.length > 0
    ? completed.reduce((sum, c) => {
        const initiated = new Date(c.initiatedDate);
        const completedDate = new Date(c.completedDate!);
        return sum + Math.floor((completedDate.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / completed.length
    : 0;
  
  return {
    totalChecks: checks.length,
    completed: completed.length,
    active: active.length,
    completionRate,
    avgCompletionTime: Math.round(avgCompletionTime),
    issuesFound: issuesFound.length,
  };
}

export function getPeriodComparison(
  currentFrom: Date,
  currentTo: Date
): PeriodComparison {
  const checks = getBackgroundChecks();
  
  // Calculate period duration in days
  const periodDuration = Math.floor((currentTo.getTime() - currentFrom.getTime()) / (1000 * 60 * 60 * 24));
  
  // Previous period
  const previousFrom = new Date(currentFrom.getTime() - periodDuration * 24 * 60 * 60 * 1000);
  const previousTo = new Date(currentFrom.getTime() - 1); // Day before current period starts
  
  // Filter checks for each period
  const currentChecks = checks.filter(c => {
    const date = new Date(c.initiatedDate);
    return date >= currentFrom && date <= currentTo;
  });
  
  const previousChecks = checks.filter(c => {
    const date = new Date(c.initiatedDate);
    return date >= previousFrom && date <= previousTo;
  });
  
  const current = calculateMetrics(currentChecks);
  const previous = calculateMetrics(previousChecks);
  
  // Calculate changes
  const totalChecksChange = current.totalChecks - previous.totalChecks;
  const totalChecksPercent = previous.totalChecks > 0 
    ? (totalChecksChange / previous.totalChecks) * 100 
    : 0;
  
  const completedChange = current.completed - previous.completed;
  const completedPercent = previous.completed > 0
    ? (completedChange / previous.completed) * 100
    : 0;
  
  const completionRateChange = current.completionRate - previous.completionRate;
  
  const avgTimeChange = current.avgCompletionTime - previous.avgCompletionTime;
  const avgTimePercent = previous.avgCompletionTime > 0
    ? (avgTimeChange / previous.avgCompletionTime) * 100
    : 0;
  
  return {
    current,
    previous,
    changes: {
      totalChecks: totalChecksChange,
      totalChecksPercent,
      completed: completedChange,
      completedPercent,
      completionRate: completionRateChange,
      avgCompletionTime: avgTimeChange,
      avgCompletionTimePercent: avgTimePercent,
    },
  };
}
import type { BackgroundCheckType } from '@/shared/types/backgroundCheck';

export interface CheckTypePricing {
  type: BackgroundCheckType;
  name: string;
  description: string;
  provider: string;
  cost: number;
  estimatedTime: string;
  icon: string;
}

export const BACKGROUND_CHECK_PRICING: Record<BackgroundCheckType, CheckTypePricing> = {
  'reference': {
    type: 'reference',
    name: 'Reference Check',
    description: 'Automated reference checking with customizable questionnaires',
    provider: 'HRM8 Native',
    cost: 69,
    estimatedTime: '2-5 business days',
    icon: '✅'
  },
  'criminal': {
    type: 'criminal',
    name: 'Criminal Record Check',
    description: 'Comprehensive criminal background check',
    provider: 'Checkr',
    cost: 49,
    estimatedTime: '1-3 business days',
    icon: '🧾'
  },
  'education': {
    type: 'education',
    name: 'Qualification Verification',
    description: 'Verify educational credentials and certifications',
    provider: 'Sterling',
    cost: 59,
    estimatedTime: '3-7 business days',
    icon: '🎓'
  },
  'identity': {
    type: 'identity',
    name: 'Identity Verification',
    description: 'Verify identity documents and personal information',
    provider: 'HireRight',
    cost: 39,
    estimatedTime: '1-2 business days',
    icon: '🪪'
  },
  'employment': {
    type: 'employment',
    name: 'Employment Verification',
    description: 'Verify employment history and dates',
    provider: 'Sterling',
    cost: 45,
    estimatedTime: '3-5 business days',
    icon: '💼'
  },
  'credit': {
    type: 'credit',
    name: 'Credit Check',
    description: 'Financial history and credit report',
    provider: 'Checkr',
    cost: 35,
    estimatedTime: '1-2 business days',
    icon: '💳'
  },
  'drug-screen': {
    type: 'drug-screen',
    name: 'Drug Screening',
    description: 'Pre-employment drug testing',
    provider: 'HireRight',
    cost: 55,
    estimatedTime: '2-4 business days',
    icon: '🔬'
  },
  'professional-license': {
    type: 'professional-license',
    name: 'Professional License Verification',
    description: 'Verify professional licenses and certifications',
    provider: 'Sterling',
    cost: 42,
    estimatedTime: '3-5 business days',
    icon: '📜'
  }
};

export function calculateTotalCost(checkTypes: BackgroundCheckType[]): number {
  return checkTypes.reduce((total, type) => {
    return total + (BACKGROUND_CHECK_PRICING[type]?.cost || 0);
  }, 0);
}

export function getCostBreakdown(checkTypes: BackgroundCheckType[]) {
  return checkTypes.map(type => ({
    checkType: type,
    ...BACKGROUND_CHECK_PRICING[type]
  }));
}
import type { QuestionnaireTemplate } from '@/shared/types/referee';

const TEMPLATES_KEY = 'hrm8_questionnaire_templates';

const DEFAULT_TEMPLATES: QuestionnaireTemplate[] = [
  {
    id: 'standard-professional',
    name: 'Standard Professional Reference',
    description: 'Comprehensive professional reference check covering performance, reliability, and teamwork',
    isDefault: true,
    category: 'general',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How would you rate this candidate\'s overall performance?',
        required: true,
        ratingScale: { min: 1, max: 5, labels: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'] },
        order: 1
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'How would you rate their reliability and attendance?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 2
      },
      {
        id: 'q3',
        type: 'rating',
        question: 'How would you rate their teamwork and collaboration skills?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 3
      },
      {
        id: 'q4',
        type: 'rating',
        question: 'How would you rate their communication skills?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 4
      },
      {
        id: 'q5',
        type: 'yes-no',
        question: 'Would you re-hire this person if given the opportunity?',
        required: true,
        order: 5
      },
      {
        id: 'q6',
        type: 'text',
        question: 'What are this person\'s greatest strengths?',
        required: true,
        maxLength: 500,
        placeholder: 'Describe their key strengths...',
        order: 6
      },
      {
        id: 'q7',
        type: 'text',
        question: 'What areas could this person improve?',
        required: false,
        maxLength: 500,
        placeholder: 'Areas for development...',
        order: 7
      },
      {
        id: 'q8',
        type: 'textarea',
        question: 'Any additional comments or information you\'d like to share?',
        required: false,
        maxLength: 1000,
        placeholder: 'Additional feedback...',
        order: 8
      }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'leadership-reference',
    name: 'Leadership Reference',
    description: 'Focused on leadership qualities, team management, and strategic thinking',
    isDefault: false,
    category: 'leadership',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How would you rate their leadership abilities?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 1
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'How effective were they at motivating team members?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 2
      },
      {
        id: 'q3',
        type: 'rating',
        question: 'How would you rate their decision-making skills?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 3
      },
      {
        id: 'q4',
        type: 'rating',
        question: 'How effective were they at conflict resolution?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 4
      },
      {
        id: 'q5',
        type: 'rating',
        question: 'How would you rate their strategic thinking?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 5
      },
      {
        id: 'q6',
        type: 'yes-no',
        question: 'Did they successfully manage and develop their team members?',
        required: true,
        order: 6
      },
      {
        id: 'q7',
        type: 'text',
        question: 'Describe their leadership style',
        required: true,
        maxLength: 500,
        order: 7
      },
      {
        id: 'q8',
        type: 'textarea',
        question: 'Can you provide an example of a challenging situation they handled well?',
        required: false,
        maxLength: 1000,
        order: 8
      }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'quick-reference',
    name: 'Quick Reference',
    description: 'Brief 5-question reference check for fast turnaround',
    isDefault: false,
    category: 'quick',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'Overall performance rating',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 1
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'Work quality rating',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 2
      },
      {
        id: 'q3',
        type: 'yes-no',
        question: 'Would you recommend this candidate?',
        required: true,
        order: 3
      },
      {
        id: 'q4',
        type: 'text',
        question: 'Key strengths',
        required: true,
        maxLength: 300,
        order: 4
      },
      {
        id: 'q5',
        type: 'text',
        question: 'Any concerns?',
        required: false,
        maxLength: 300,
        order: 5
      }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function initializeStorage() {
  const existing = localStorage.getItem(TEMPLATES_KEY);
  if (!existing) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
  }
}

export function saveTemplate(template: QuestionnaireTemplate): void {
  initializeStorage();
  const templates = getTemplates();
  templates.push(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getTemplates(): QuestionnaireTemplate[] {
  initializeStorage();
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : DEFAULT_TEMPLATES;
}

export function getTemplateById(id: string): QuestionnaireTemplate | undefined {
  return getTemplates().find(t => t.id === id);
}

export function getQuestionnaireTemplate(id: string): QuestionnaireTemplate | undefined {
  if (id === 'default') {
    return getDefaultTemplate();
  }
  return getTemplateById(id);
}

export function getDefaultTemplate(): QuestionnaireTemplate {
  const templates = getTemplates();
  return templates.find(t => t.isDefault) || templates[0];
}

export function updateTemplate(id: string, updates: Partial<QuestionnaireTemplate>): void {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id || t.isDefault);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
}

export function duplicateTemplate(id: string, newName: string): QuestionnaireTemplate {
  const original = getTemplateById(id);
  if (!original) throw new Error('Template not found');
  
  const duplicate: QuestionnaireTemplate = {
    ...original,
    id: `${original.id}-copy-${Date.now()}`,
    name: newName,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveTemplate(duplicate);
  return duplicate;
}
import type { RefereeDetails } from '@/shared/types/referee';

const REFEREES_KEY = 'hrm8_referees';

function initializeStorage() {
  if (!localStorage.getItem(REFEREES_KEY)) {
    localStorage.setItem(REFEREES_KEY, JSON.stringify([]));
  }
}

export function saveReferee(referee: RefereeDetails): void {
  initializeStorage();
  const referees = getReferees();
  referees.push(referee);
  localStorage.setItem(REFEREES_KEY, JSON.stringify(referees));
}

export function getReferees(): RefereeDetails[] {
  initializeStorage();
  const data = localStorage.getItem(REFEREES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getRefereeById(id: string): RefereeDetails | undefined {
  return getReferees().find(r => r.id === id);
}

export function getRefereeByToken(token: string): RefereeDetails | undefined {
  return getReferees().find(r => r.token === token);
}

export function updateReferee(id: string, updates: Partial<RefereeDetails>): void {
  const referees = getReferees();
  const index = referees.findIndex(r => r.id === id);
  if (index !== -1) {
    referees[index] = {
      ...referees[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(REFEREES_KEY, JSON.stringify(referees));
  }
}

export function deleteReferee(id: string): void {
  const referees = getReferees();
  const filtered = referees.filter(r => r.id !== id);
  localStorage.setItem(REFEREES_KEY, JSON.stringify(filtered));
}

export function getRefereesByCandidate(candidateId: string): RefereeDetails[] {
  return getReferees().filter(r => r.candidateId === candidateId);
}

export function getRefereesByBackgroundCheck(backgroundCheckId: string): RefereeDetails[] {
  return getReferees().filter(r => r.backgroundCheckId === backgroundCheckId);
}

export function getPendingReferees(): RefereeDetails[] {
  const now = new Date();
  return getReferees().filter(r => {
    if (r.status === 'completed' as any) return false;
    if (!r.invitedDate) return false;
    
    const invitedDate = new Date(r.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceInvite >= 3 && r.status !== 'completed';
  });
}

export function getOverdueReferees(): RefereeDetails[] {
  const now = new Date();
  return getReferees().filter(r => {
    if (r.status === 'completed' as any) return false;
    if (!r.invitedDate) return false;
    
    const invitedDate = new Date(r.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceInvite >= 10;
  });
}
import { v4 as uuidv4 } from 'uuid';
import type { RefereeDetails, ReferenceResponse, QuestionAnswer } from '@/shared/types/referee';
import {
  saveReferee,
  updateReferee,
  getRefereeByToken as getRefereeByTokenStorage,
  getRefereesByBackgroundCheck
} from './refereeStorage';
import { updateBackgroundCheck, getBackgroundCheckById } from '@/shared/lib/mockBackgroundCheckStorage';
import { generateRefereeInvitationEmail } from './emailTemplates';
import { createBackgroundCheckNotification } from './notificationService';
import { sendBackgroundCheckEmail } from './emailNotificationService';

export function generateRefereeToken(): string {
  return `referee_${uuidv4()}_${Date.now()}`;
}

export function getRefereeByToken(token: string): RefereeDetails | undefined {
  return getRefereeByTokenStorage(token);
}

export function createReferee(
  candidateId: string,
  backgroundCheckId: string,
  refereeData: Omit<RefereeDetails, 'id' | 'candidateId' | 'backgroundCheckId' | 'token' | 'status' | 'createdAt' | 'updatedAt'>
): RefereeDetails {
  const referee: RefereeDetails = {
    ...refereeData,
    id: uuidv4(),
    candidateId,
    backgroundCheckId,
    token: generateRefereeToken(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveReferee(referee);
  return referee;
}

export function inviteReferee(
  referee: RefereeDetails,
  candidateName: string
): void {
  const questionnaireUrl = `${window.location.origin}/reference/${referee.token}`;
  const emailHtml = generateRefereeInvitationEmail(referee, candidateName, questionnaireUrl);
  
  // Simulate sending email
  console.log('📧 Sending referee invitation to:', referee.email);
  console.log('Questionnaire URL:', questionnaireUrl);
  console.log('Email HTML:', emailHtml);
  
  // Update referee status
  updateReferee(referee.id, {
    status: 'invited',
    invitedDate: new Date().toISOString()
  });

  // Send email notification to referee
  const backgroundCheck = getBackgroundCheckById(referee.backgroundCheckId);
  if (backgroundCheck) {
    sendBackgroundCheckEmail('referee_invited', {
      candidateName: candidateName,
      candidateEmail: '',
      recruiterName: backgroundCheck.initiatedByName,
      recruiterEmail: 'recruiter@example.com',
      refereeName: referee.name,
      refereeEmail: referee.email,
      referenceLink: questionnaireUrl,
      checkId: referee.backgroundCheckId,
    });

    // Create in-app notification for recruiter
    createBackgroundCheckNotification('referee_invited', {
      candidateName: candidateName,
      checkId: referee.backgroundCheckId,
      refereeName: referee.name,
    });
  }
}

export function validateRefereeToken(token: string): boolean {
  const referee = getRefereeByTokenStorage(token);
  
  if (!referee) return false;
  if (referee.status === 'completed') return false;
  
  // Check if overdue (14 days)
  if (referee.invitedDate) {
    const invitedDate = new Date(referee.invitedDate);
    const now = new Date();
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInvite > 14) {
      updateReferee(referee.id, { status: 'overdue' });
      return false;
    }
  }
  
  return true;
}

export function markRefereeQuestionnaireOpened(token: string): void {
  const referee = getRefereeByTokenStorage(token);
  if (referee && referee.status === 'invited') {
    updateReferee(referee.id, { status: 'opened' });
  }
}

export function markRefereeQuestionnaireInProgress(token: string): void {
  const referee = getRefereeByTokenStorage(token);
  if (referee && (referee.status === 'invited' || referee.status === 'opened')) {
    updateReferee(referee.id, { status: 'in-progress' });
  }
}

export function submitReferenceResponse(
  token: string,
  questionnaireTemplateId: string,
  answers: QuestionAnswer[],
  ipAddress: string = '0.0.0.0',
  completionTime?: number
): void {
  const referee = getRefereeByTokenStorage(token);
  if (!referee) throw new Error('Referee not found');
  if (referee.status === 'completed') throw new Error('Response already submitted');
  
  const overallRating = calculateOverallRating(answers);
  
  const response: ReferenceResponse = {
    refereeId: referee.id,
    questionnaireTemplateId,
    answers,
    overallRating,
    submittedAt: new Date().toISOString(),
    ipAddress,
    completionTime
  };
  
  // Update referee with response
  updateReferee(referee.id, {
    status: 'completed',
    completedDate: new Date().toISOString(),
    response
  });
  
  // Check if all referees are completed
  checkAllRefereesCompleted(referee.backgroundCheckId);

  // Send notifications
  const backgroundCheck = getBackgroundCheckById(referee.backgroundCheckId);
  if (backgroundCheck) {
    sendBackgroundCheckEmail('referee_completed', {
      candidateName: backgroundCheck.candidateName,
      candidateEmail: '',
      recruiterName: backgroundCheck.initiatedByName,
      recruiterEmail: 'recruiter@example.com',
      refereeName: referee.name,
      checkId: referee.backgroundCheckId,
      reportLink: `${window.location.origin}/background-checks/${referee.backgroundCheckId}`,
    });

    createBackgroundCheckNotification('referee_completed', {
      candidateName: backgroundCheck.candidateName,
      checkId: referee.backgroundCheckId,
      refereeName: referee.name,
    });
  }
  
  console.log('✅ Reference response submitted:', referee.id);
}

export function calculateOverallRating(answers: QuestionAnswer[]): number {
  const ratingAnswers = answers.filter(a => a.type === 'rating' && typeof a.value === 'number');
  
  if (ratingAnswers.length === 0) return 0;
  
  const sum = ratingAnswers.reduce((total, answer) => total + (answer.value as number), 0);
  return Math.round((sum / ratingAnswers.length) * 10) / 10; // Round to 1 decimal
}

export function checkAllRefereesCompleted(backgroundCheckId: string): void {
  const referees = getRefereesByBackgroundCheck(backgroundCheckId);
  const allCompleted = referees.every(r => r.status === 'completed');
  
  if (allCompleted && referees.length > 0) {
    // Update background check status
    const completedResults = referees
      .filter(r => r.response)
      .map(r => ({
        checkType: 'reference' as const,
        status: 'clear' as const,
        details: `Reference from ${r.name} (${r.relationship})`,
        completedDate: r.completedDate
      }));
    
    updateBackgroundCheck(backgroundCheckId, {
      status: 'completed',
      completedDate: new Date().toISOString(),
      results: completedResults
    });

    // Send notifications
    const backgroundCheck = getBackgroundCheckById(backgroundCheckId);
    if (backgroundCheck) {
      sendBackgroundCheckEmail('all_referees_completed', {
        candidateName: backgroundCheck.candidateName,
        candidateEmail: '',
        recruiterName: backgroundCheck.initiatedByName,
        recruiterEmail: 'recruiter@example.com',
        checkId: backgroundCheckId,
        reportLink: `${window.location.origin}/background-checks/${backgroundCheckId}`,
      });

      createBackgroundCheckNotification('all_referees_completed', {
        candidateName: backgroundCheck.candidateName,
        checkId: backgroundCheckId,
      });
    }
    
    console.log('✅ All referees completed for background check:', backgroundCheckId);
  }
}

export function getAggregateRatings(backgroundCheckId: string): {
  averageRating: number;
  totalResponses: number;
  wouldRehireCount: number;
} {
  const referees = getRefereesByBackgroundCheck(backgroundCheckId);
  const completed = referees.filter(r => r.status === 'completed' && r.response);
  
  if (completed.length === 0) {
    return { averageRating: 0, totalResponses: 0, wouldRehireCount: 0 };
  }
  
  const totalRating = completed.reduce((sum, r) => sum + (r.response?.overallRating || 0), 0);
  const averageRating = totalRating / completed.length;
  
  // Count "would rehire" yes answers
  const wouldRehireCount = completed.filter(r => {
    const rehireAnswer = r.response?.answers.find(a => 
      a.question.toLowerCase().includes('re-hire') && a.value === true
    );
    return !!rehireAnswer;
  }).length;
  
  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalResponses: completed.length,
    wouldRehireCount
  };
}
import type { RefereeDetails } from '@/shared/types/referee';
import type { ConsentRequest } from '@/shared/types/consent';
import { updateReferee, getPendingReferees, getOverdueReferees, getRefereesByBackgroundCheck } from './refereeStorage';
import { getConsentRequests, updateConsent } from './consentStorage';
import { generateReminderEmail } from './emailTemplates';
import { createBackgroundCheckNotification } from './notificationService';
import { sendBackgroundCheckEmail } from './emailNotificationService';
import { getBackgroundCheckById } from '@/shared/lib/mockBackgroundCheckStorage';

export function scheduleReminders(refereeId: string, refereeName: string): void {
  console.log(`📅 Scheduled reminders for referee ${refereeName}:`);
  console.log('  - Day 3: First reminder');
  console.log('  - Day 7: Second reminder');
  console.log('  - Day 10: Mark as overdue');
}

export function sendRefereeReminder(
  referee: RefereeDetails,
  candidateName: string,
  reminderNumber: number
): void {
  const questionnaireUrl = `${window.location.origin}/reference/${referee.token}`;
  const emailHtml = generateReminderEmail(referee, candidateName, questionnaireUrl, reminderNumber);
  
  console.log(`📧 Sending referee reminder ${reminderNumber} to:`, referee.email);
  console.log('Email HTML:', emailHtml);
  
  // Send email notification
  sendBackgroundCheckEmail('referee_reminder', {
    refereeName: referee.name,
    refereeEmail: referee.email,
    candidateName,
    questionnaireLink: questionnaireUrl,
    reminderNumber,
    candidateEmail: '',
    checkId: referee.backgroundCheckId,
  });

  // Create in-app notification
  createBackgroundCheckNotification('referee_reminder', {
    refereeName: referee.name,
    candidateName,
    checkId: referee.backgroundCheckId,
    reminderNumber,
  });
  
  updateReferee(referee.id, {
    lastReminderDate: new Date().toISOString()
  });
}

export function sendConsentReminder(consent: ConsentRequest, reminderNumber: number): void {
  const consentUrl = `${window.location.origin}/consent/${consent.token}`;
  
  console.log(`📧 Sending consent reminder ${reminderNumber} to:`, consent.candidateEmail);
  
  // Send email notification
  sendBackgroundCheckEmail('consent_reminder', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    checkId: consent.backgroundCheckId,
    consentLink: consentUrl,
    reminderNumber,
  });

  // Create in-app notification
  createBackgroundCheckNotification('consent_reminder', {
    candidateName: consent.candidateName,
    checkId: consent.backgroundCheckId,
    reminderNumber,
  });

  updateConsent(consent.id, {
    lastReminderDate: new Date().toISOString()
  } as any);
}

export function processScheduledReminders(): {
  refereeReminders: number;
  consentReminders: number;
} {
  const pending = getPendingReferees();
  const now = new Date();
  let refereeReminders = 0;
  
  pending.forEach(referee => {
    if (!referee.invitedDate) return;
    
    const invitedDate = new Date(referee.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const lastReminderDate = referee.lastReminderDate ? new Date(referee.lastReminderDate) : null;
    const daysSinceLastReminder = lastReminderDate
      ? Math.floor((now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
      : daysSinceInvite;
    
    // Get candidate name from background check
    const bgCheck = getBackgroundCheckById(referee.backgroundCheckId);
    const candidateName = bgCheck?.candidateName || 'Candidate';
    
    // Send first reminder after 3 days
    if (daysSinceInvite >= 3 && daysSinceInvite < 7 && !lastReminderDate) {
      console.log('Sending first reminder for referee:', referee.id);
      sendRefereeReminder(referee, candidateName, 1);
      refereeReminders++;
    }
    
    // Send second reminder after 7 days
    if (daysSinceInvite >= 7 && daysSinceLastReminder >= 4) {
      console.log('Sending second reminder for referee:', referee.id);
      sendRefereeReminder(referee, candidateName, 2);
      refereeReminders++;
    }
  });

  // Process consent reminders
  const consentReminders = processConsentReminders();
  
  return { refereeReminders, consentReminders };
}

export function processConsentReminders(): number {
  const consents = getConsentRequests();
  const now = new Date();
  let remindersSent = 0;
  
  consents
    .filter(c => c.status === 'sent' || c.status === 'viewed')
    .forEach(consent => {
      const sentDate = new Date(consent.sentDate);
      const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const lastReminderDate = (consent as any).lastReminderDate 
        ? new Date((consent as any).lastReminderDate) 
        : null;
      const daysSinceLastReminder = lastReminderDate
        ? Math.floor((now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
        : daysSinceSent;
      
      // Check if expired
      const expiryDate = new Date(consent.expiryDate);
      if (now > expiryDate) {
        updateConsent(consent.id, { status: 'expired' });
        return;
      }
      
      // Send first reminder after 3 days
      if (daysSinceSent >= 3 && daysSinceSent < 6 && !lastReminderDate) {
        console.log('Sending first consent reminder for:', consent.id);
        sendConsentReminder(consent, 1);
        remindersSent++;
      }
      
      // Send second reminder after 6 days
      if (daysSinceSent >= 6 && daysSinceLastReminder >= 3) {
        console.log('Sending second consent reminder for:', consent.id);
        sendConsentReminder(consent, 2);
        remindersSent++;
      }
    });
  
  return remindersSent;
}

export function markOverdueReferees(): void {
  const overdue = getOverdueReferees();
  
  overdue.forEach(referee => {
    if (referee.status !== 'overdue') {
      console.log('Marking referee as overdue:', referee.id);
      updateReferee(referee.id, { status: 'overdue' });
    }
  });
}

export function getReminderStats(): {
  pendingReminders: number;
  overdueCount: number;
  pendingConsents: number;
  overdueConsents: number;
} {
  const pending = getPendingReferees();
  const overdue = getOverdueReferees();
  
  const consents = getConsentRequests();
  const now = new Date();
  
  const pendingConsents = consents.filter(c => {
    if (c.status !== 'sent' && c.status !== 'viewed') return false;
    const sentDate = new Date(c.sentDate);
    const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent >= 3;
  }).length;

  const overdueConsents = consents.filter(c => {
    if (c.status !== 'sent' && c.status !== 'viewed') return false;
    const sentDate = new Date(c.sentDate);
    const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent >= 6;
  }).length;
  
  return {
    pendingReminders: pending.length,
    overdueCount: overdue.length,
    pendingConsents,
    overdueConsents
  };
}
import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

export interface CategoryComparison {
  category: string;
  scores: { refereeName: string; score: number; summary: string }[];
  averageScore: number;
  variance: number;
  consensus: 'high' | 'medium' | 'low';
}

export interface ConsensusArea {
  type: 'strength' | 'concern' | 'observation';
  text: string;
  supportingReferees: string[];
  evidence: string[];
}

export interface DivergentArea {
  category: string;
  refereeViews: { name: string; view: string; score?: number }[];
  divergenceLevel: 'high' | 'medium' | 'low';
}

export interface AggregateRecommendation {
  overallScore: number;
  recommendationDistribution: Record<string, number>;
  majorityRecommendation: string;
  confidenceLevel: number;
  summary: string;
}

export interface ComparisonResult {
  categoryComparisons: CategoryComparison[];
  consensusAreas: ConsensusArea[];
  divergentAreas: DivergentArea[];
  aggregateRecommendation: AggregateRecommendation;
  totalReferees: number;
}

export function compareAIReports(reports: AITranscriptionSummary[]): ComparisonResult {
  if (reports.length === 0) {
    return {
      categoryComparisons: [],
      consensusAreas: [],
      divergentAreas: [],
      aggregateRecommendation: {
        overallScore: 0,
        recommendationDistribution: {},
        majorityRecommendation: 'neutral',
        confidenceLevel: 0,
        summary: 'No reports available for comparison',
      },
      totalReferees: 0,
    };
  }

  const categoryComparisons = analyzeCategoryScores(reports);
  const consensusAreas = findConsensusAreas(reports);
  const divergentAreas = findDivergentAreas(reports, categoryComparisons);
  const aggregateRecommendation = calculateAggregateRecommendation(reports);

  return {
    categoryComparisons,
    consensusAreas,
    divergentAreas,
    aggregateRecommendation,
    totalReferees: reports.length,
  };
}

function analyzeCategoryScores(reports: AITranscriptionSummary[]): CategoryComparison[] {
  const categoryMap = new Map<string, { scores: any[]; summaries: string[] }>();

  reports.forEach((report) => {
    report.categoryBreakdown.forEach((cat) => {
      if (!categoryMap.has(cat.category)) {
        categoryMap.set(cat.category, { scores: [], summaries: [] });
      }
      categoryMap.get(cat.category)!.scores.push({
        refereeName: report.refereeInfo.name,
        score: cat.score,
        summary: cat.summary,
      });
    });
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => {
    const scores = data.scores.map((s) => s.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = calculateVariance(scores);
    
    let consensus: 'high' | 'medium' | 'low' = 'high';
    if (variance > 1.5) consensus = 'low';
    else if (variance > 0.8) consensus = 'medium';

    return {
      category,
      scores: data.scores,
      averageScore,
      variance,
      consensus,
    };
  });
}

function findConsensusAreas(reports: AITranscriptionSummary[]): ConsensusArea[] {
  const consensusAreas: ConsensusArea[] = [];

  // Find common strengths
  const strengthCounts = new Map<string, { count: number; referees: string[]; evidence: string[] }>();
  reports.forEach((report) => {
    report.keyFindings.strengths.forEach((strength) => {
      const normalized = strength.toLowerCase().trim();
      if (!strengthCounts.has(normalized)) {
        strengthCounts.set(normalized, { count: 0, referees: [], evidence: [] });
      }
      const entry = strengthCounts.get(normalized)!;
      entry.count++;
      entry.referees.push(report.refereeInfo.name);
      
      // Find evidence from category breakdown
      report.categoryBreakdown.forEach((cat) => {
        cat.evidence.forEach((ev) => {
          if (ev.toLowerCase().includes(normalized.split(' ')[0])) {
            entry.evidence.push(ev);
          }
        });
      });
    });
  });

  strengthCounts.forEach((data, strength) => {
    if (data.count >= Math.ceil(reports.length / 2)) {
      consensusAreas.push({
        type: 'strength',
        text: strength.charAt(0).toUpperCase() + strength.slice(1),
        supportingReferees: data.referees,
        evidence: data.evidence.slice(0, 3),
      });
    }
  });

  // Find common concerns
  const concernCounts = new Map<string, { count: number; referees: string[]; evidence: string[] }>();
  reports.forEach((report) => {
    report.keyFindings.concerns.forEach((concern) => {
      const normalized = concern.toLowerCase().trim();
      if (!concernCounts.has(normalized)) {
        concernCounts.set(normalized, { count: 0, referees: [], evidence: [] });
      }
      const entry = concernCounts.get(normalized)!;
      entry.count++;
      entry.referees.push(report.refereeInfo.name);
      
      report.categoryBreakdown.forEach((cat) => {
        cat.evidence.forEach((ev) => {
          if (ev.toLowerCase().includes(normalized.split(' ')[0])) {
            entry.evidence.push(ev);
          }
        });
      });
    });
  });

  concernCounts.forEach((data, concern) => {
    if (data.count >= Math.ceil(reports.length / 2)) {
      consensusAreas.push({
        type: 'concern',
        text: concern.charAt(0).toUpperCase() + concern.slice(1),
        supportingReferees: data.referees,
        evidence: data.evidence.slice(0, 3),
      });
    }
  });

  return consensusAreas;
}

function findDivergentAreas(
  reports: AITranscriptionSummary[],
  categoryComparisons: CategoryComparison[]
): DivergentArea[] {
  const divergentAreas: DivergentArea[] = [];

  // Find categories with low consensus (high variance)
  categoryComparisons.forEach((comp) => {
    if (comp.consensus === 'low') {
      divergentAreas.push({
        category: comp.category,
        refereeViews: comp.scores.map((s) => ({
          name: s.refereeName,
          view: s.summary,
          score: s.score,
        })),
        divergenceLevel: 'high',
      });
    } else if (comp.consensus === 'medium') {
      divergentAreas.push({
        category: comp.category,
        refereeViews: comp.scores.map((s) => ({
          name: s.refereeName,
          view: s.summary,
          score: s.score,
        })),
        divergenceLevel: 'medium',
      });
    }
  });

  return divergentAreas;
}

function calculateAggregateRecommendation(reports: AITranscriptionSummary[]): AggregateRecommendation {
  const scores = reports.map((r) => r.recommendation.overallScore);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const recommendationDistribution: Record<string, number> = {};
  reports.forEach((report) => {
    const rec = report.recommendation.hiringRecommendation;
    recommendationDistribution[rec] = (recommendationDistribution[rec] || 0) + 1;
  });

  const majorityRecommendation = Object.entries(recommendationDistribution).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  const confidenceLevels = reports.map((r) => r.recommendation.confidenceLevel);
  const confidenceLevel = confidenceLevels.reduce((a, b) => a + b, 0) / confidenceLevels.length;

  const summary = generateAggregateSummary(overallScore, majorityRecommendation, reports.length);

  return {
    overallScore,
    recommendationDistribution,
    majorityRecommendation,
    confidenceLevel,
    summary,
  };
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function generateAggregateSummary(score: number, recommendation: string, refereeCount: number): string {
  let scoreSummary = '';
  if (score >= 80) scoreSummary = 'consistently excellent';
  else if (score >= 70) scoreSummary = 'generally strong';
  else if (score >= 60) scoreSummary = 'moderately positive';
  else if (score >= 50) scoreSummary = 'mixed';
  else scoreSummary = 'below expectations';

  const recText = recommendation.replace(/-/g, ' ');
  
  return `Based on ${refereeCount} referee ${refereeCount === 1 ? 'interview' : 'interviews'}, the candidate received ${scoreSummary} feedback with a majority recommendation to ${recText}. Review individual reports and divergent areas for comprehensive assessment.`;
}
import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

export function generateReportHTML(summary: AITranscriptionSummary): string {
  const categoryAnalysisHTML = summary.categoryBreakdown
    .map(
      (cat) => `
      <div class="category-section">
        <h4>${cat.category} - ${cat.score}/5</h4>
        <p>${cat.summary}</p>
        ${cat.evidence.length > 0 ? `
          <ul>
            ${cat.evidence.map((ev) => `<li>"${ev}"</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `
    )
    .join('');

  const highlightsHTML = summary.conversationHighlights
    .map(
      (highlight) => `
      <div class="highlight-section">
        <p><strong>Q:</strong> ${highlight.question}</p>
        <p><strong>A:</strong> ${highlight.answer}</p>
        <p><em>Significance:</em> ${highlight.significance}</p>
      </div>
    `
    )
    .join('');

  const redFlagsHTML =
    summary.redFlags.length > 0
      ? `
      <h2 id="red-flags">Red Flags & Concerns</h2>
      ${summary.redFlags
        .map(
          (flag) => `
        <div class="red-flag-section severity-${flag.severity}">
          <p><strong>[${flag.severity.toUpperCase()}]</strong> ${flag.description}</p>
          <p><em>Evidence:</em> "${flag.evidence}"</p>
        </div>
      `
        )
        .join('')}
    `
      : '<h2 id="red-flags">Red Flags & Concerns</h2><p>No significant red flags identified.</p>';

  const verificationHTML = summary.verificationItems
    .map(
      (item) => `
      <div class="verification-item">
        <p><strong>${item.verified ? '✓' : '○'}</strong> ${item.claim}</p>
        ${item.notes ? `<p><em>Notes:</em> ${item.notes}</p>` : ''}
      </div>
    `
    )
    .join('');

  return `
    <h1>Reference Check Report</h1>
    
    <div class="metadata">
      <p><strong>Candidate:</strong> ${summary.candidateName}</p>
      <p><strong>Referee:</strong> ${summary.refereeInfo.name} (${summary.refereeInfo.relationship})</p>
      <p><strong>Company:</strong> ${summary.refereeInfo.companyName}</p>
      ${summary.refereeInfo.yearsKnown ? `<p><strong>Years Known:</strong> ${summary.refereeInfo.yearsKnown}</p>` : ''}
      <p><strong>Interview Mode:</strong> ${summary.sessionDetails.mode}</p>
      <p><strong>Duration:</strong> ${Math.round(summary.sessionDetails.duration / 60)} minutes</p>
      <p><strong>Questions Asked:</strong> ${summary.sessionDetails.questionsAsked}</p>
    </div>

    <h2 id="executive-summary">Executive Summary</h2>
    <p>${summary.executiveSummary}</p>

    <h2 id="key-findings">Key Findings</h2>
    
    <h3>Strengths</h3>
    <ul>
      ${summary.keyFindings.strengths.map((s) => `<li>${s}</li>`).join('')}
    </ul>

    <h3>Concerns</h3>
    ${
      summary.keyFindings.concerns.length > 0
        ? `<ul>${summary.keyFindings.concerns.map((c) => `<li>${c}</li>`).join('')}</ul>`
        : '<p>No significant concerns identified.</p>'
    }

    <h3>Neutral Observations</h3>
    ${
      summary.keyFindings.neutralObservations.length > 0
        ? `<ul>${summary.keyFindings.neutralObservations.map((n) => `<li>${n}</li>`).join('')}</ul>`
        : '<p>No additional observations.</p>'
    }

    <h2 id="category-analysis">Category Analysis</h2>
    ${categoryAnalysisHTML}

    <h2 id="conversation-highlights">Conversation Highlights</h2>
    ${highlightsHTML}

    ${redFlagsHTML}

    <h2 id="verification">Verification Items</h2>
    ${verificationHTML}

    <h2 id="recommendation">Recommendation</h2>
    <div class="recommendation-section">
      <p><strong>Overall Score:</strong> ${summary.recommendation.overallScore}/100</p>
      <p><strong>Hiring Recommendation:</strong> ${summary.recommendation.hiringRecommendation.replace(/-/g, ' ').toUpperCase()}</p>
      <p><strong>Confidence Level:</strong> ${Math.round(summary.recommendation.confidenceLevel * 100)}%</p>
      <p>${summary.recommendation.reasoningSummary}</p>
    </div>
  `;
}
import type { SLAConfiguration, SLAStatus } from '@/shared/types/sla';
import { DEFAULT_SLA_CONFIGS } from '@/shared/types/sla';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import { createNotification } from '@/shared/lib/notificationStorage';

const SLA_CONFIG_KEY = 'hrm8_sla_configurations';
const SLA_NOTIFICATIONS_KEY = 'hrm8_sla_notifications_sent';

function initializeSLAConfigs() {
  const existing = localStorage.getItem(SLA_CONFIG_KEY);
  if (!existing) {
    const configs = (DEFAULT_SLA_CONFIGS as any[]).map((config, index) => ({
      ...config,
      id: `sla-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(SLA_CONFIG_KEY, JSON.stringify(configs));
  }
}

export function getSLAConfigurations(): SLAConfiguration[] {
  initializeSLAConfigs();
  const data = localStorage.getItem(SLA_CONFIG_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSLAConfiguration(config: SLAConfiguration): void {
  const configs = getSLAConfigurations();
  const index = configs.findIndex(c => c.id === config.id);
  
  if (index !== -1) {
    configs[index] = { ...config, updatedAt: new Date().toISOString() };
  } else {
    configs.push(config);
  }
  
  localStorage.setItem(SLA_CONFIG_KEY, JSON.stringify(configs));
}

export function getSLAForStatus(status: BackgroundCheck['status']): SLAConfiguration | undefined {
  return getSLAConfigurations().find(c => c.status === status && c.enabled);
}

function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

export function calculateSLAStatus(check: BackgroundCheck): SLAStatus | null {
  const slaConfig = getSLAForStatus(check.status);
  if (!slaConfig) return null;
  
  const now = new Date();
  const startDate = new Date(check.initiatedDate);
  
  const daysElapsed = slaConfig.businessDaysOnly
    ? calculateBusinessDays(startDate, now)
    : Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const targetDate = slaConfig.businessDaysOnly
    ? addBusinessDays(startDate, slaConfig.targetDays)
    : new Date(startDate.getTime() + slaConfig.targetDays * 24 * 60 * 60 * 1000);
  
  const daysRemaining = slaConfig.businessDaysOnly
    ? calculateBusinessDays(now, targetDate)
    : Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const percentComplete = (daysElapsed / slaConfig.targetDays) * 100;
  
  let slaStatus: SLAStatus['slaStatus'] = 'on-track';
  let breached = false;
  let breachedDate: string | undefined;
  
  if (percentComplete >= slaConfig.criticalThresholdPercent) {
    slaStatus = 'critical';
  } else if (percentComplete >= slaConfig.warningThresholdPercent) {
    slaStatus = 'warning';
  }
  
  if (daysElapsed > slaConfig.targetDays) {
    slaStatus = 'breached';
    breached = true;
    breachedDate = targetDate.toISOString();
  }
  
  return {
    checkId: check.id,
    candidateName: check.candidateName,
    status: check.status,
    slaConfig,
    startDate: startDate.toISOString(),
    targetDate: targetDate.toISOString(),
    daysElapsed,
    daysRemaining,
    percentComplete: Math.min(percentComplete, 150), // Cap at 150%
    slaStatus,
    breached,
    breachedDate,
  };
}

export function getAllSLAStatuses(): SLAStatus[] {
  const checks = getBackgroundChecks().filter(c => 
    c.status !== 'completed' && c.status !== 'cancelled'
  );
  
  return checks
    .map(check => calculateSLAStatus(check))
    .filter(sla => sla !== null) as SLAStatus[];
}

export function getBreachedSLAs(): SLAStatus[] {
  return getAllSLAStatuses().filter(sla => sla.breached);
}

export function getCriticalSLAs(): SLAStatus[] {
  return getAllSLAStatuses().filter(sla => sla.slaStatus === 'critical' && !sla.breached);
}

// Track which notifications have been sent to avoid duplicates
function getNotificationsSent(): Record<string, string[]> {
  const data = localStorage.getItem(SLA_NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : {};
}

function markNotificationSent(checkId: string, type: 'warning' | 'critical' | 'breached'): void {
  const sent = getNotificationsSent();
  if (!sent[checkId]) {
    sent[checkId] = [];
  }
  if (!sent[checkId].includes(type)) {
    sent[checkId].push(type);
  }
  localStorage.setItem(SLA_NOTIFICATIONS_KEY, JSON.stringify(sent));
}

function wasNotificationSent(checkId: string, type: 'warning' | 'critical' | 'breached'): boolean {
  const sent = getNotificationsSent();
  return sent[checkId]?.includes(type) || false;
}

export function processSLANotifications(): void {
  const slaStatuses = getAllSLAStatuses();
  
  slaStatuses.forEach(sla => {
    const check = getBackgroundChecks().find(c => c.id === sla.checkId);
    if (!check || !sla.slaConfig) return;
    
    // Breached notification
    if (sla.breached && sla.slaConfig.notifyAtBreached && !wasNotificationSent(sla.checkId, 'breached')) {
      createNotification({
        userId: check.initiatedBy,
        category: 'system',
        type: 'error',
        priority: 'critical',
        title: `SLA Breached: ${sla.candidateName}`,
        message: `Background check for ${sla.candidateName} has exceeded the ${sla.slaConfig.targetDays} day SLA for ${sla.status} status.`,
        link: `/background-checks/${sla.checkId}`,
        read: false,
        archived: false,
        metadata: {
          entityType: 'background-check',
          entityId: sla.checkId,
          slaStatus: 'breached',
        }
      });
      markNotificationSent(sla.checkId, 'breached');
    }
    
    // Critical notification
    else if (sla.slaStatus === 'critical' && sla.slaConfig.notifyAtCritical && !wasNotificationSent(sla.checkId, 'critical')) {
      createNotification({
        userId: check.initiatedBy,
        category: 'system',
        type: 'warning',
        priority: 'high',
        title: `SLA Critical: ${sla.candidateName}`,
        message: `Background check for ${sla.candidateName} is approaching SLA breach (${Math.round(sla.percentComplete)}% complete). ${sla.daysRemaining} days remaining.`,
        link: `/background-checks/${sla.checkId}`,
        read: false,
        archived: false,
        metadata: {
          entityType: 'background-check',
          entityId: sla.checkId,
          slaStatus: 'critical',
        }
      });
      markNotificationSent(sla.checkId, 'critical');
    }
    
    // Warning notification
    else if (sla.slaStatus === 'warning' && sla.slaConfig.notifyAtWarning && !wasNotificationSent(sla.checkId, 'warning')) {
      createNotification({
        userId: check.initiatedBy,
        category: 'system',
        type: 'info',
        priority: 'medium',
        title: `SLA Warning: ${sla.candidateName}`,
        message: `Background check for ${sla.candidateName} is ${Math.round(sla.percentComplete)}% through its SLA target. ${sla.daysRemaining} days remaining.`,
        link: `/background-checks/${sla.checkId}`,
        read: false,
        archived: false,
        metadata: {
          entityType: 'background-check',
          entityId: sla.checkId,
          slaStatus: 'warning',
        }
      });
      markNotificationSent(sla.checkId, 'warning');
    }
  });
}

export function getSLAStats() {
  const allSLAs = getAllSLAStatuses();
  
  return {
    total: allSLAs.length,
    onTrack: allSLAs.filter(s => s.slaStatus === 'on-track').length,
    warning: allSLAs.filter(s => s.slaStatus === 'warning').length,
    critical: allSLAs.filter(s => s.slaStatus === 'critical').length,
    breached: allSLAs.filter(s => s.breached).length,
    averagePercentComplete: Math.round(
      allSLAs.reduce((sum, s) => sum + s.percentComplete, 0) / allSLAs.length
    ),
  };
}
import type { StatusChangeRecord, StatusHistoryFilters } from '@/shared/types/statusHistory';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

const HISTORY_KEY = 'hrm8_status_history';

function getStatusHistory(): StatusChangeRecord[] {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function recordStatusChange(
  checkId: string,
  candidateId: string,
  candidateName: string,
  previousStatus: BackgroundCheck['status'],
  newStatus: BackgroundCheck['status'],
  changedBy: string,
  changedByName: string,
  reason?: string,
  notes?: string,
  automated: boolean = false,
  metadata?: Record<string, any>
): StatusChangeRecord {
  const record: StatusChangeRecord = {
    id: `sh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    checkId,
    candidateId,
    candidateName,
    previousStatus,
    newStatus,
    changedBy,
    changedByName,
    reason,
    notes,
    timestamp: new Date().toISOString(),
    automated,
    metadata
  };

  const history = getStatusHistory();
  history.push(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  return record;
}

export function getCheckStatusHistory(checkId: string): StatusChangeRecord[] {
  return getStatusHistory()
    .filter(record => record.checkId === checkId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getCandidateStatusHistory(candidateId: string): StatusChangeRecord[] {
  return getStatusHistory()
    .filter(record => record.candidateId === candidateId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function filterStatusHistory(filters: StatusHistoryFilters): StatusChangeRecord[] {
  let history = getStatusHistory();

  if (filters.checkId) {
    history = history.filter(r => r.checkId === filters.checkId);
  }

  if (filters.candidateId) {
    history = history.filter(r => r.candidateId === filters.candidateId);
  }

  if (filters.status) {
    history = history.filter(r => r.newStatus === filters.status || r.previousStatus === filters.status);
  }

  if (filters.changedBy) {
    history = history.filter(r => r.changedBy === filters.changedBy);
  }

  if (filters.dateFrom) {
    history = history.filter(r => new Date(r.timestamp) >= new Date(filters.dateFrom!));
  }

  if (filters.dateTo) {
    history = history.filter(r => new Date(r.timestamp) <= new Date(filters.dateTo!));
  }

  if (filters.automated !== undefined) {
    history = history.filter(r => r.automated === filters.automated);
  }

  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function exportStatusHistory(filters?: StatusHistoryFilters): string {
  const history = filters ? filterStatusHistory(filters) : getStatusHistory();
  
  const csv = [
    ['Timestamp', 'Candidate', 'Check ID', 'Previous Status', 'New Status', 'Changed By', 'Reason', 'Automated', 'Notes'].join(','),
    ...history.map(record => [
      record.timestamp,
      record.candidateName,
      record.checkId,
      record.previousStatus,
      record.newStatus,
      record.changedByName,
      record.reason || '',
      record.automated ? 'Yes' : 'No',
      record.notes || ''
    ].join(','))
  ].join('\n');

  return csv;
}

export function getStatusHistoryStats() {
  const history = getStatusHistory();
  const last30Days = history.filter(r => {
    const date = new Date(r.timestamp);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  return {
    totalChanges: history.length,
    changesLast30Days: last30Days.length,
    automatedChanges: history.filter(r => r.automated).length,
    manualChanges: history.filter(r => !r.automated).length,
    byStatus: history.reduce((acc, r) => {
      acc[r.newStatus] = (acc[r.newStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { updateBackgroundCheck, getBackgroundCheckById } from '../mockBackgroundCheckStorage';
import { createNotification } from '@/shared/lib/notificationStorage';
import { logStatusChange } from './digestService';
import { recordStatusChange } from './statusHistoryService';

type StatusTransition = {
  from: BackgroundCheck['status'];
  to: BackgroundCheck['status'];
  condition: (check: BackgroundCheck) => boolean;
  notificationMessage: (check: BackgroundCheck) => string;
};

const statusTransitions: StatusTransition[] = [
  {
    from: 'pending-consent',
    to: 'in-progress',
    condition: (check) => check.consentGiven === true,
    notificationMessage: (check) => 
      `Background check for ${check.candidateName} has moved to In Progress after consent was received.`
  },
  {
    from: 'in-progress',
    to: 'completed',
    condition: (check) => {
      // Check if all check types have results
      const allCheckTypesHaveResults = check.checkTypes.every(checkType => 
        check.results.some(result => result.checkType === checkType.type)
      );
      
      // Check if all results are complete
      const allResultsComplete = check.results.every(result => 
        result.status === 'clear' || result.status === 'review-required' || result.status === 'not-clear'
      );
      
      return allCheckTypesHaveResults && allResultsComplete && check.results.length > 0;
    },
    notificationMessage: (check) => 
      `Background check for ${check.candidateName} has been completed. Review the results now.`
  },
  {
    from: 'in-progress',
    to: 'issues-found',
    condition: (check) => {
      // Check if any result is not-clear
      return check.results.some(result => result.status === 'not-clear');
    },
    notificationMessage: (check) => 
      `Issues found in background check for ${check.candidateName}. Immediate review required.`
  }
];

export function autoUpdateCheckStatus(checkId: string): void {
  const check = getBackgroundCheckById(checkId);
  if (!check) return;

  const currentStatus = check.status;

  // Find applicable transition
  const transition = statusTransitions.find(t => 
    t.from === check.status && t.condition(check)
  );

  if (transition) {
    // Update status
    const updates: Partial<BackgroundCheck> = {
      status: transition.to
    };

    // Set completed date if moving to completed or issues-found
    if (transition.to === 'completed' || transition.to === 'issues-found') {
      updates.completedDate = new Date().toISOString();
    }

    // Calculate overall status for completed checks
    if (transition.to === 'completed' || transition.to === 'issues-found') {
      updates.overallStatus = calculateOverallStatus(check);
    }

    updateBackgroundCheck(checkId, updates);

    // Log status change for digest
    logStatusChange({
      checkId: check.id,
      candidateName: check.candidateName,
      previousStatus: currentStatus,
      newStatus: transition.to,
      changedAt: new Date().toISOString()
    });

    // Record status change history
    recordStatusChange(
      check.id,
      check.candidateId,
      check.candidateName,
      currentStatus,
      transition.to,
      'system',
      'Automated System',
      'Automated status transition',
      undefined,
      true
    );

    // Send notification to initiator
    sendStatusChangeNotification(check, transition.to, transition.notificationMessage(check));
  }
}

function calculateOverallStatus(check: BackgroundCheck): 'clear' | 'conditional' | 'not-clear' {
  const hasNotClear = check.results.some(r => r.status === 'not-clear');
  const hasReviewRequired = check.results.some(r => r.status === 'review-required');
  
  if (hasNotClear) return 'not-clear';
  if (hasReviewRequired) return 'conditional';
  return 'clear';
}

function sendStatusChangeNotification(
  check: BackgroundCheck, 
  newStatus: BackgroundCheck['status'],
  message: string
): void {
  createNotification({
    userId: check.initiatedBy,
    category: 'document' as const,
    type: newStatus === 'issues-found' ? 'error' as const : 
          newStatus === 'completed' ? 'success' as const : 'info' as const,
    priority: newStatus === 'issues-found' ? 'high' as const : 
              newStatus === 'completed' ? 'medium' as const : 'low' as const,
    title: `Background Check Status Update`,
    message,
    link: `/background-checks/${check.id}`,
    read: false,
    archived: false,
    metadata: {
      entityType: 'background-check',
      entityId: check.id,
      candidateId: check.candidateId,
      previousStatus: check.status,
      newStatus
    }
  });
}

export function handleConsentReceived(checkId: string): void {
  const check = getBackgroundCheckById(checkId);
  if (!check) return;

  // Update consent status
  updateBackgroundCheck(checkId, {
    consentGiven: true,
    consentDate: new Date().toISOString(),
    status: 'in-progress'
  });

  // Send notification
  sendStatusChangeNotification(
    check,
    'in-progress',
    `${check.candidateName} has provided consent. Background check is now in progress.`
  );
}

export function handleCheckResultAdded(checkId: string): void {
  // Auto-update status when a check result is added
  autoUpdateCheckStatus(checkId);
}

export function handleAllChecksCompleted(checkId: string): void {
  // Auto-update status when all checks are completed
  autoUpdateCheckStatus(checkId);
}

export function cancelCheck(checkId: string, cancelledBy: string, reason?: string): void {
  const check = getBackgroundCheckById(checkId);
  if (!check) return;

  updateBackgroundCheck(checkId, {
    status: 'cancelled',
    reviewNotes: reason || 'Check cancelled',
    reviewedBy: cancelledBy,
    updatedAt: new Date().toISOString()
  });

  // Send notification
  sendStatusChangeNotification(
    check,
    'cancelled',
    `Background check for ${check.candidateName} has been cancelled.`
  );
}
