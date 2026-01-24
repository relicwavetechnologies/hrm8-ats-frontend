import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
import type { Assessment } from '@/shared/types/assessment';
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format } from 'date-fns';

export interface AssessmentStats {
  total: number;
  active: number;
  completed: number;
  avgScore: number;
  passRate: number;
  avgCompletionTime: number;
  pendingInvitations: number;
  expiringSoon: number;
  needsReview: number;
  lowScores: number;
  changeFromLastMonth: {
    total: number;
    active: number;
    completed: number;
    avgScore: number;
  };
}

export function getAssessmentStats(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): AssessmentStats {
  let assessments = getAssessments();

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const total = assessments.length;
  const active = assessments.filter(a => 
    a.status === 'invited' || a.status === 'in-progress'
  ).length;
  const completed = assessments.filter(a => a.status === 'completed').length;
  
  const completedAssessments = assessments.filter(a => a.status === 'completed' && a.overallScore);
  const avgScore = completedAssessments.length > 0
    ? completedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssessments.length
    : 0;

  const passedCount = completedAssessments.filter(a => a.passed).length;
  const passRate = completedAssessments.length > 0 
    ? (passedCount / completedAssessments.length) * 100 
    : 0;

  const assessmentsWithTime = completedAssessments.filter(a => a.result?.timeSpent);
  const avgCompletionTime = assessmentsWithTime.length > 0
    ? assessmentsWithTime.reduce((sum, a) => sum + (a.result?.timeSpent || 0), 0) / assessmentsWithTime.length
    : 0;

  const now = new Date();
  const pendingInvitations = assessments.filter(a => a.status === 'pending-invitation').length;
  
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  const expiringSoon = assessments.filter(a => {
    if (a.status === 'completed' || a.status === 'expired' || a.status === 'cancelled') return false;
    const expiryDate = new Date(a.expiryDate);
    return expiryDate <= threeDaysFromNow && expiryDate > now;
  }).length;

  const needsReview = completedAssessments.filter(a => 
    a.result?.status === 'needs-review'
  ).length;

  const lowScores = completedAssessments.filter(a => 
    (a.overallScore || 0) < 50
  ).length;

  // Calculate last month comparison
  const lastMonth = subMonths(now, 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);
  
  const lastMonthAssessments = getAssessments().filter(a => {
    const date = new Date(a.invitedDate);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const lastMonthTotal = lastMonthAssessments.length;
  const lastMonthActive = lastMonthAssessments.filter(a => 
    a.status === 'invited' || a.status === 'in-progress'
  ).length;
  const lastMonthCompleted = lastMonthAssessments.filter(a => a.status === 'completed').length;
  
  const lastMonthCompletedAssessments = lastMonthAssessments.filter(a => a.status === 'completed' && a.overallScore);
  const lastMonthAvgScore = lastMonthCompletedAssessments.length > 0
    ? lastMonthCompletedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / lastMonthCompletedAssessments.length
    : 0;

  return {
    total,
    active,
    completed,
    avgScore: Math.round(avgScore * 10) / 10,
    passRate: Math.round(passRate * 10) / 10,
    avgCompletionTime: Math.round(avgCompletionTime),
    pendingInvitations,
    expiringSoon,
    needsReview,
    lowScores,
    changeFromLastMonth: {
      total: lastMonthTotal > 0 ? Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100) : 0,
      active: lastMonthActive > 0 ? Math.round(((active - lastMonthActive) / lastMonthActive) * 100) : 0,
      completed: lastMonthCompleted > 0 ? Math.round(((completed - lastMonthCompleted) / lastMonthCompleted) * 100) : 0,
      avgScore: lastMonthAvgScore > 0 ? Math.round(((avgScore - lastMonthAvgScore) / lastMonthAvgScore) * 100) : 0,
    }
  };
}

export function getAssessmentVolumeData(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments();

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const now = new Date();
  const sixMonthsAgo = subMonths(now, 6);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

  return months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthAssessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= monthStart && date <= monthEnd;
    });

    return {
      month: format(month, 'MMM yyyy'),
      total: monthAssessments.length,
      completed: monthAssessments.filter(a => a.status === 'completed').length,
      inProgress: monthAssessments.filter(a => a.status === 'in-progress').length,
      invited: monthAssessments.filter(a => a.status === 'invited').length,
    };
  });
}

export function getAssessmentTypeDistribution(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments();

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const distribution: Record<string, number> = {};
  
  assessments.forEach(a => {
    distribution[a.assessmentType] = (distribution[a.assessmentType] || 0) + 1;
  });

  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / assessments.length) * 100)
  }));
}

export function getProviderPerformanceData(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments();

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const providerStats: Record<string, { total: number; completed: number; avgScore: number; scores: number[] }> = {};

  assessments.forEach(a => {
    if (!providerStats[a.provider]) {
      providerStats[a.provider] = { total: 0, completed: 0, avgScore: 0, scores: [] };
    }
    providerStats[a.provider].total++;
    if (a.status === 'completed') {
      providerStats[a.provider].completed++;
      if (a.overallScore) {
        providerStats[a.provider].scores.push(a.overallScore);
      }
    }
  });

  return Object.entries(providerStats).map(([provider, stats]) => ({
    provider,
    total: stats.total,
    completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    avgScore: stats.scores.length > 0 
      ? Math.round((stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length) * 10) / 10
      : 0
  }));
}

export function getScoreDistributionData(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments().filter(a => a.status === 'completed' && a.overallScore);

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const ranges = [
    { label: '0-20', min: 0, max: 20 },
    { label: '21-40', min: 21, max: 40 },
    { label: '41-60', min: 41, max: 60 },
    { label: '61-80', min: 61, max: 80 },
    { label: '81-100', min: 81, max: 100 },
  ];

  return ranges.map(range => ({
    range: range.label,
    count: assessments.filter(a => 
      (a.overallScore || 0) >= range.min && (a.overallScore || 0) <= range.max
    ).length
  }));
}

export function getRecentActivity() {
  const assessments = getAssessments()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return assessments.map(a => {
    let type = '';
    if (a.status === 'invited') type = 'assessment-invited';
    else if (a.status === 'in-progress') type = 'assessment-started';
    else if (a.status === 'completed') type = 'assessment-completed';
    else if (a.status === 'expired') type = 'assessment-expired';
    else if (a.remindersSent > 0) type = 'reminder-sent';

    return {
      type,
      candidateName: a.candidateName,
      timestamp: a.updatedAt,
      assessmentId: a.id,
      assessmentType: a.assessmentType,
    };
  });
}
import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
import type { 
  RevenueMetrics, 
  UsageMetrics, 
  ProfitabilityMetrics, 
  TrendData,
  ClientRevenueData,
  GeographicData,
  TypeDistribution,
  ConversionMetrics,
  ClientLifetimeValue,
  RetentionMetrics
} from '@/shared/types/businessMetrics';

// Assessment pricing by type
export const ASSESSMENT_PRICING = {
  'cognitive': 69,
  'personality': 59,
  'technical-skills': 89,
  'situational-judgment': 79,
  'behavioral': 69,
  'culture-fit': 59,
  'custom': 99,
};

// Provider costs (what we pay third-party providers)
const PROVIDER_COSTS = {
  'testgorilla': 40,
  'vervoe': 45,
  'criteria': 35,
  'harver': 42,
  'shl': 50,
  'codility': 55,
  'internal': 10, // Internal cost for HRM8 native assessments
};

function getAssessmentPrice(assessmentType: string): number {
  return ASSESSMENT_PRICING[assessmentType as keyof typeof ASSESSMENT_PRICING] || 69;
}

function getProviderCost(provider: string): number {
  return PROVIDER_COSTS[provider as keyof typeof PROVIDER_COSTS] || 30;
}

export function getAssessmentRevenueMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): RevenueMetrics {
  let assessments = getAssessments().filter(a => a.status === 'completed');
  
  // Apply filters
  if (dateRange) {
    assessments = assessments.filter(a => {
      const completedDate = new Date(a.completedDate || a.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }
  
  const totalRevenue = assessments.reduce((sum, a) => sum + getAssessmentPrice(a.assessmentType), 0);
  const totalCosts = assessments.reduce((sum, a) => sum + getProviderCost(a.provider), 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
  
  // Calculate revenue by type
  const revenueByType: Record<string, number> = {};
  assessments.forEach(a => {
    const type = a.assessmentType;
    revenueByType[type] = (revenueByType[type] || 0) + getAssessmentPrice(type);
  });
  
  // Calculate unique clients
  const uniqueClients = new Set(assessments.map(a => a.billedTo)).size;
  const revenuePerClient = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;
  
  // Mock month-over-month growth
  const monthOverMonthGrowth = 12.5;
  
  return {
    totalRevenue,
    revenueByType,
    monthOverMonthGrowth,
    revenuePerClient,
    profitMargin,
  };
}

export function getAssessmentUsageMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): UsageMetrics {
  let assessments = getAssessments();
  
  // Apply filters
  if (dateRange) {
    assessments = assessments.filter(a => {
      const createdDate = new Date(a.createdAt);
      return createdDate >= dateRange.from && createdDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }
  
  const totalVolume = assessments.length;
  
  // Calculate volume by location
  const locationMap = new Map<string, GeographicData>();
  assessments.forEach(a => {
    const key = `${a.country || 'Unknown'}-${a.region || 'Unknown'}`;
    const existing = locationMap.get(key);
    const revenue = a.status === 'completed' ? getAssessmentPrice(a.assessmentType) : 0;
    
    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: a.country || 'Unknown',
        region: a.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });
  
  const volumeByLocation = Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
  
  // Calculate top clients
  const clientMap = new Map<string, ClientRevenueData>();
  assessments.forEach(a => {
    const clientId = a.billedTo || 'unknown';
    const clientName = a.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = a.status === 'completed' ? getAssessmentPrice(a.assessmentType) : 0;
    
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
  const totalPossibleClients = 100; // Mock value
  const activeClients = new Set(assessments.map(a => a.billedTo)).size;
  const clientAdoptionRate = (activeClients / totalPossibleClients) * 100;
  
  return {
    totalVolume,
    volumeByLocation,
    clientAdoptionRate,
    topClients,
  };
}

export function getAssessmentProfitability(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): ProfitabilityMetrics {
  let assessments = getAssessments().filter(a => a.status === 'completed');
  
  // Apply filters
  if (dateRange) {
    assessments = assessments.filter(a => {
      const completedDate = new Date(a.completedDate || a.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }
  
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }
  
  const totalRevenue = assessments.reduce((sum, a) => sum + getAssessmentPrice(a.assessmentType), 0);
  const providerCosts = assessments.reduce((sum, a) => sum + getProviderCost(a.provider), 0);
  const internalCosts = assessments.length * 5; // Mock internal operational cost per assessment
  const netProfit = totalRevenue - providerCosts - internalCosts;
  const costPerUnit = assessments.length > 0 ? (providerCosts + internalCosts) / assessments.length : 0;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    providerCosts,
    internalCosts,
    netProfit,
    costPerUnit,
    marginPercentage,
  };
}

export function getAssessmentRevenueTrends(): TrendData[] {
  const assessments = getAssessments();
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
  
  // Populate with assessment data
  assessments.forEach(a => {
    const date = new Date(a.completedDate || a.createdAt);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const data = monthMap.get(monthKey);
    
    if (data && a.status === 'completed') {
      const revenue = getAssessmentPrice(a.assessmentType);
      const cost = getProviderCost(a.provider) + 5;
      data.revenue += revenue;
      data.volume++;
      data.profit += (revenue - cost);
    }
  });
  
  // Mock new clients per month
  monthMap.forEach((data, key) => {
    data.newClients = Math.floor(Math.random() * 5) + 2;
  });
  
  return months.map(m => monthMap.get(m)!);
}

export function getRevenueByTypeDistribution(): TypeDistribution[] {
  const assessments = getAssessments().filter(a => a.status === 'completed');
  const typeMap = new Map<string, TypeDistribution>();
  
  assessments.forEach(a => {
    const type = a.assessmentType;
    const existing = typeMap.get(type);
    const revenue = getAssessmentPrice(type);
    const providerCost = getProviderCost(a.provider);
    
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
  const assessments = getAssessments().filter(a => a.status === 'completed');
  const clientMap = new Map<string, ClientRevenueData>();
  
  assessments.forEach(a => {
    const clientId = a.billedTo || 'unknown';
    const clientName = a.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = getAssessmentPrice(a.assessmentType);
    
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
  const assessments = getAssessments().filter(a => a.status === 'completed');
  const locationMap = new Map<string, GeographicData>();
  
  assessments.forEach(a => {
    const key = a.country || 'Unknown';
    const existing = locationMap.get(key);
    const revenue = getAssessmentPrice(a.assessmentType);
    
    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: a.country || 'Unknown',
        region: a.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });
  
  return Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
}

export function getConversionMetrics(): ConversionMetrics {
  const assessments = getAssessments().filter(a => a.status === 'completed');
  const totalAssessments = assessments.length;
  
  // Mock: assume 35% of completed assessments lead to hire
  const leadsToHire = Math.round(totalAssessments * 0.35);
  const conversionRate = totalAssessments > 0 ? (leadsToHire / totalAssessments) * 100 : 0;
  
  const totalRevenue = assessments.reduce((sum, a) => sum + getAssessmentPrice(a.assessmentType), 0);
  const revenuePerHire = leadsToHire > 0 ? totalRevenue / leadsToHire : 0;
  
  return {
    totalAssessments,
    leadsToHire,
    conversionRate,
    revenuePerHire,
  };
}

export function getClientLifetimeValues(): ClientLifetimeValue[] {
  const assessments = getAssessments();
  const clientMap = new Map<string, {
    name: string;
    revenue: number;
    transactions: number;
    firstDate: Date;
    lastDate: Date;
  }>();

  // Group by client
  assessments.forEach((assessment) => {
    const clientId = assessment.billedTo || 'unknown';
    const clientName = assessment.billedToName || 'Unknown Client';
    const revenue = assessment.status === 'completed' ? getAssessmentPrice(assessment.assessmentType) : 0;
    const date = new Date(assessment.createdAt);

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
export interface PerformanceTrend {
  month: string;
  averageScore: number;
  passRate: number;
  completionRate: number;
  totalAssessments: number;
}

export interface QuestionDifficulty {
  questionId: string;
  questionText: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timesUsed: number;
  averageScore: number;
  averageTime: number; // seconds
  passRate: number;
  actualDifficulty: number; // 1-10 scale based on performance
}

export interface TimeMetrics {
  assessmentType: string;
  averageTime: number; // minutes
  medianTime: number;
  minTime: number;
  maxTime: number;
  completionRate: number;
}

export interface ProviderEffectiveness {
  provider: string;
  assessmentCount: number;
  averageScore: number;
  passRate: number;
  candidateSatisfaction: number; // 1-5
  costPerAssessment: number;
  averageCompletionTime: number; // minutes
  technicalIssues: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface CategoryPerformance {
  category: string;
  averageScore: number;
  questionsCount: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
}

// Mock data
export const performanceTrends: PerformanceTrend[] = [
  { month: 'Jan', averageScore: 72, passRate: 65, completionRate: 88, totalAssessments: 145 },
  { month: 'Feb', averageScore: 74, passRate: 68, completionRate: 90, totalAssessments: 168 },
  { month: 'Mar', averageScore: 76, passRate: 70, completionRate: 92, totalAssessments: 189 },
  { month: 'Apr', averageScore: 75, passRate: 69, completionRate: 91, totalAssessments: 201 },
  { month: 'May', averageScore: 78, passRate: 73, completionRate: 93, totalAssessments: 223 },
  { month: 'Jun', averageScore: 80, passRate: 75, completionRate: 94, totalAssessments: 245 },
];

export const questionDifficulties: QuestionDifficulty[] = [
  {
    questionId: 'q1',
    questionText: 'What is the time complexity of binary search?',
    category: 'Algorithms',
    difficulty: 'medium',
    timesUsed: 245,
    averageScore: 75,
    averageTime: 98,
    passRate: 68,
    actualDifficulty: 5.2,
  },
  {
    questionId: 'q2',
    questionText: 'Explain the difference between TCP and UDP',
    category: 'Networking',
    difficulty: 'medium',
    timesUsed: 189,
    averageScore: 62,
    averageTime: 156,
    passRate: 54,
    actualDifficulty: 6.8,
  },
  {
    questionId: 'q3',
    questionText: 'Write a function to reverse a string',
    category: 'Programming',
    difficulty: 'easy',
    timesUsed: 312,
    averageScore: 85,
    averageTime: 78,
    passRate: 82,
    actualDifficulty: 3.1,
  },
  {
    questionId: 'q4',
    questionText: 'Implement a LRU cache from scratch',
    category: 'Data Structures',
    difficulty: 'hard',
    timesUsed: 123,
    averageScore: 48,
    averageTime: 425,
    passRate: 38,
    actualDifficulty: 8.7,
  },
  {
    questionId: 'q5',
    questionText: 'Describe Agile methodology principles',
    category: 'Project Management',
    difficulty: 'medium',
    timesUsed: 267,
    averageScore: 71,
    averageTime: 134,
    passRate: 65,
    actualDifficulty: 5.5,
  },
];

export const timeMetrics: TimeMetrics[] = [
  {
    assessmentType: 'Cognitive',
    averageTime: 28,
    medianTime: 25,
    minTime: 15,
    maxTime: 45,
    completionRate: 92,
  },
  {
    assessmentType: 'Technical Skills',
    averageTime: 52,
    medianTime: 48,
    minTime: 30,
    maxTime: 90,
    completionRate: 87,
  },
  {
    assessmentType: 'Personality',
    averageTime: 18,
    medianTime: 16,
    minTime: 12,
    maxTime: 30,
    completionRate: 95,
  },
  {
    assessmentType: 'Situational Judgment',
    averageTime: 35,
    medianTime: 32,
    minTime: 20,
    maxTime: 55,
    completionRate: 89,
  },
];

export const providerEffectiveness: ProviderEffectiveness[] = [
  {
    provider: 'TestGorilla',
    assessmentCount: 342,
    averageScore: 74,
    passRate: 68,
    candidateSatisfaction: 4.2,
    costPerAssessment: 69,
    averageCompletionTime: 32,
    technicalIssues: 5,
  },
  {
    provider: 'Vervoe',
    assessmentCount: 289,
    averageScore: 76,
    passRate: 71,
    candidateSatisfaction: 4.5,
    costPerAssessment: 89,
    averageCompletionTime: 38,
    technicalIssues: 3,
  },
  {
    provider: 'Criteria Corp',
    assessmentCount: 256,
    averageScore: 72,
    passRate: 66,
    candidateSatisfaction: 4.0,
    costPerAssessment: 59,
    averageCompletionTime: 28,
    technicalIssues: 8,
  },
  {
    provider: 'HRM8 Internal',
    assessmentCount: 198,
    averageScore: 78,
    passRate: 73,
    candidateSatisfaction: 4.6,
    costPerAssessment: 0,
    averageCompletionTime: 30,
    technicalIssues: 2,
  },
];

export const scoreDistribution: ScoreDistribution[] = [
  { range: '0-20', count: 12, percentage: 3 },
  { range: '21-40', count: 28, percentage: 7 },
  { range: '41-60', count: 89, percentage: 22 },
  { range: '61-80', count: 176, percentage: 44 },
  { range: '81-100', count: 95, percentage: 24 },
];

export const categoryPerformance: CategoryPerformance[] = [
  {
    category: 'Algorithms',
    averageScore: 75,
    questionsCount: 45,
    passRate: 68,
    trend: 'up',
  },
  {
    category: 'Programming',
    averageScore: 82,
    questionsCount: 67,
    passRate: 78,
    trend: 'up',
  },
  {
    category: 'Data Structures',
    averageScore: 69,
    questionsCount: 38,
    passRate: 62,
    trend: 'stable',
  },
  {
    category: 'System Design',
    averageScore: 64,
    questionsCount: 29,
    passRate: 55,
    trend: 'down',
  },
  {
    category: 'Soft Skills',
    averageScore: 79,
    questionsCount: 52,
    passRate: 74,
    trend: 'up',
  },
  {
    category: 'Project Management',
    averageScore: 73,
    questionsCount: 41,
    passRate: 67,
    trend: 'stable',
  },
];

export function getAnalyticsSummary() {
  const totalAssessments = performanceTrends.reduce(
    (sum, trend) => sum + trend.totalAssessments,
    0
  );
  const averageScore =
    performanceTrends.reduce((sum, trend) => sum + trend.averageScore, 0) /
    performanceTrends.length;
  const averagePassRate =
    performanceTrends.reduce((sum, trend) => sum + trend.passRate, 0) /
    performanceTrends.length;
  const averageCompletionRate =
    performanceTrends.reduce((sum, trend) => sum + trend.completionRate, 0) /
    performanceTrends.length;

  return {
    totalAssessments,
    averageScore: Math.round(averageScore),
    averagePassRate: Math.round(averagePassRate),
    averageCompletionRate: Math.round(averageCompletionRate),
  };
}
import * as XLSX from 'xlsx';
import type { Assessment } from '@/shared/types/assessment';

interface ExportOptions {
  format: 'csv' | 'excel';
  filename?: string;
}

export function exportAssessments(
  assessments: Assessment[],
  options: ExportOptions = { format: 'excel' }
) {
  // Prepare data for export
  const exportData = assessments.map(assessment => ({
    'Assessment ID': assessment.id,
    'Candidate Name': assessment.candidateName,
    'Candidate Email': assessment.candidateEmail,
    'Assessment Type': formatAssessmentType(assessment.assessmentType),
    'Provider': assessment.provider.toUpperCase(),
    'Status': formatStatus(assessment.status),
    'Overall Score': assessment.overallScore !== undefined ? `${assessment.overallScore}%` : 'N/A',
    'Category Score': assessment.result?.score !== undefined ? `${assessment.result.score}%` : 'N/A',
    'Pass/Fail': assessment.passed !== undefined ? (assessment.passed ? 'Pass' : 'Fail') : 'Pending',
    'Invited By': assessment.invitedByName,
    'Invited Date': new Date(assessment.invitedDate).toLocaleDateString(),
    'Completed Date': assessment.completedDate ? new Date(assessment.completedDate).toLocaleDateString() : 'N/A',
    'Expiry Date': new Date(assessment.expiryDate).toLocaleDateString(),
    'Time Spent (min)': assessment.result?.timeSpent || 'N/A',
    'Pass Threshold': `${assessment.passThreshold}%`,
    'Job Title': assessment.jobTitle || 'N/A',
    'Billed To': assessment.billedToName || 'N/A',
    'Country': assessment.country || 'N/A',
    'Region': assessment.region || 'N/A',
    'Cost': `$${assessment.cost}`,
    'Payment Status': assessment.paymentStatus,
    'Reminders Sent': assessment.remindersSent,
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Assessment ID
    { wch: 20 }, // Candidate Name
    { wch: 25 }, // Candidate Email
    { wch: 20 }, // Assessment Type
    { wch: 15 }, // Provider
    { wch: 15 }, // Status
    { wch: 12 }, // Overall Score
    { wch: 12 }, // Category Score
    { wch: 10 }, // Pass/Fail
    { wch: 20 }, // Invited By
    { wch: 15 }, // Invited Date
    { wch: 15 }, // Completed Date
    { wch: 15 }, // Expiry Date
    { wch: 15 }, // Time Spent
    { wch: 15 }, // Pass Threshold
    { wch: 20 }, // Job Title
    { wch: 20 }, // Billed To
    { wch: 15 }, // Country
    { wch: 15 }, // Region
    { wch: 12 }, // Cost
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Reminders Sent
  ];
  worksheet['!cols'] = columnWidths;

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = options.filename || `assessments_export_${timestamp}`;

  if (options.format === 'csv') {
    // Export as CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  } else {
    // Export as Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assessments');
    
    // Add summary sheet
    const summaryData = generateSummaryData(assessments);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  return {
    recordCount: assessments.length,
    filename: options.format === 'csv' ? `${filename}.csv` : `${filename}.xlsx`,
  };
}

function formatAssessmentType(type: string): string {
  const typeMap: Record<string, string> = {
    'cognitive': 'Cognitive Ability',
    'personality': 'Personality & Behavioral',
    'technical-skills': 'Technical Skills',
    'situational-judgment': 'Situational Judgment',
    'behavioral': 'Behavioral',
    'culture-fit': 'Culture Fit',
    'custom': 'Custom Assessment',
  };
  return typeMap[type] || type;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'pending-invitation': 'Pending Invitation',
    'invited': 'Invited',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'expired': 'Expired',
    'cancelled': 'Cancelled',
  };
  return statusMap[status] || status;
}

function generateSummaryData(assessments: Assessment[]) {
  const total = assessments.length;
  const completed = assessments.filter(a => a.status === 'completed').length;
  const inProgress = assessments.filter(a => a.status === 'in-progress').length;
  const invited = assessments.filter(a => a.status === 'invited').length;
  const passed = assessments.filter(a => a.passed === true).length;
  const failed = assessments.filter(a => a.passed === false).length;
  
  const completedAssessments = assessments.filter(a => a.overallScore !== undefined);
  const avgScore = completedAssessments.length > 0
    ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssessments.length)
    : 0;

  const typeBreakdown = assessments.reduce((acc, a) => {
    acc[a.assessmentType] = (acc[a.assessmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { Metric: 'Total Assessments', Value: total },
    { Metric: 'Completed', Value: completed },
    { Metric: 'In Progress', Value: inProgress },
    { Metric: 'Invited', Value: invited },
    { Metric: 'Passed', Value: passed },
    { Metric: 'Failed', Value: failed },
    { Metric: 'Average Score', Value: `${avgScore}%` },
    { Metric: '', Value: '' },
    { Metric: 'Assessment Type Breakdown', Value: '' },
    ...Object.entries(typeBreakdown).map(([type, count]) => ({
      Metric: `  ${formatAssessmentType(type)}`,
      Value: count,
    })),
  ];
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
import { Assessment } from '@/shared/types/assessment';
import {
  AssessmentPrediction,
  SuccessLikelihood,
  PredictionConfidence,
  RiskFactor,
  SuccessIndicator,
  RiskLevel,
} from '@/shared/types/assessmentPrediction';

/**
 * Mock prediction service that generates predictions based on assessment data
 * In production, this would call ML models trained on historical hiring outcomes
 */

function calculateSuccessLikelihood(score: number): SuccessLikelihood {
  if (score >= 85) return 'very-likely';
  if (score >= 70) return 'likely';
  if (score >= 55) return 'neutral';
  if (score >= 40) return 'unlikely';
  return 'very-unlikely';
}

function calculateConfidence(
  score: number,
  sampleSize: number,
  completedDate?: string
): { confidence: number; level: PredictionConfidence } {
  let baseConfidence = 50;

  // Score reliability factor
  if (score >= 80 || score <= 40) baseConfidence += 15; // Clear signals
  else if (score >= 60 && score <= 75) baseConfidence += 5; // Moderate signals

  // Sample size factor
  if (sampleSize >= 100) baseConfidence += 20;
  else if (sampleSize >= 50) baseConfidence += 10;
  else if (sampleSize >= 20) baseConfidence += 5;

  // Recency factor
  if (completedDate) {
    const daysSince = Math.floor(
      (Date.now() - new Date(completedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince <= 7) baseConfidence += 10;
    else if (daysSince <= 30) baseConfidence += 5;
  }

  const confidence = Math.min(Math.max(baseConfidence, 0), 100);

  let level: PredictionConfidence;
  if (confidence >= 80) level = 'very-high';
  else if (confidence >= 65) level = 'high';
  else if (confidence >= 45) level = 'medium';
  else if (confidence >= 25) level = 'low';
  else level = 'very-low';

  return { confidence, level };
}

function generateRiskFactors(assessment: Assessment): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const score = assessment.overallScore || 0;

  // Score-based risks
  if (score < 50) {
    factors.push({
      id: 'low-score',
      category: 'score',
      severity: 'high',
      description: 'Below average assessment performance',
      impact: 'May struggle with core job responsibilities and require extended training',
      mitigation: 'Consider additional skills assessment or structured onboarding plan',
    });
  } else if (score < 65) {
    factors.push({
      id: 'moderate-score',
      category: 'score',
      severity: 'medium',
      description: 'Moderate assessment performance',
      impact: 'May need additional support in certain areas',
      mitigation: 'Identify specific weakness areas for targeted development',
    });
  }

  // Time-based risks
  if (assessment.result?.timeSpent) {
    if (assessment.result.timeSpent > 90) {
      factors.push({
        id: 'slow-completion',
        category: 'time',
        severity: 'medium',
        description: 'Took longer than average to complete assessment',
        impact: 'May indicate slower decision-making or processing speed',
        mitigation: 'Evaluate if role requires time-sensitive decisions',
      });
    }
  }

  // Category-specific risks
  if (assessment.result?.details?.weaknesses?.length) {
    const weaknesses = assessment.result.details.weaknesses;
    if (weaknesses.length >= 3) {
      factors.push({
        id: 'multiple-weaknesses',
        category: 'technical',
        severity: 'medium',
        description: `Multiple areas of weakness identified: ${weaknesses.slice(0, 2).join(', ')}`,
        impact: 'May require comprehensive training across multiple competencies',
        mitigation: 'Create detailed skill development plan with measurable milestones',
      });
    }
  }

  return factors;
}

function generateSuccessIndicators(assessment: Assessment): SuccessIndicator[] {
  const indicators: SuccessIndicator[] = [];
  const score = assessment.overallScore || 0;

  // Score-based indicators
  if (score >= 85) {
    indicators.push({
      id: 'high-score',
      category: 'strength',
      description: 'Exceptional assessment performance',
      confidence: 'very-high',
      supportingData: `Scored in top 15% of all candidates (${score}/100)`,
    });
  } else if (score >= 70) {
    indicators.push({
      id: 'good-score',
      category: 'strength',
      description: 'Strong assessment performance',
      confidence: 'high',
      supportingData: `Above average score indicates solid competency (${score}/100)`,
    });
  }

  // Strength-based indicators
  if (assessment.result?.details?.strengths?.length) {
    const strengths = assessment.result.details.strengths;
    if (strengths.length >= 3) {
      indicators.push({
        id: 'multiple-strengths',
        category: 'strength',
        description: `Multiple core strengths identified: ${strengths.slice(0, 2).join(', ')}`,
        confidence: 'high',
        supportingData: `${strengths.length} areas of excellence demonstrated`,
      });
    }
  }

  // Time efficiency
  if (assessment.result?.timeSpent && assessment.result.timeSpent < 45) {
    indicators.push({
      id: 'efficient-completion',
      category: 'strength',
      description: 'Efficient problem-solving and decision-making',
      confidence: 'medium',
      supportingData: `Completed assessment faster than average while maintaining quality`,
    });
  }

  // Pass status
  if (assessment.passed) {
    indicators.push({
      id: 'passed-threshold',
      category: 'strength',
      description: 'Exceeded minimum qualification threshold',
      confidence: 'high',
      supportingData: `Score of ${score} exceeds pass threshold of ${assessment.passThreshold}`,
    });
  }

  return indicators;
}

function generateRecommendations(
  assessment: Assessment,
  likelihood: SuccessLikelihood,
  riskFactors: RiskFactor[]
): string[] {
  const recommendations: string[] = [];
  const score = assessment.overallScore || 0;

  if (likelihood === 'very-likely' || likelihood === 'likely') {
    recommendations.push('Strong candidate - recommend proceeding to next interview stage');
    recommendations.push('Consider for fast-track hiring process');
    if (score >= 90) {
      recommendations.push('Exceptional fit - prioritize and move quickly to prevent loss to competitors');
    }
  } else if (likelihood === 'neutral') {
    recommendations.push('Proceed with additional evaluation - schedule behavioral interview');
    recommendations.push('Request work samples or practical assessments to validate skills');
    recommendations.push('Consider fit for alternative roles if current role is not ideal');
  } else {
    recommendations.push('High risk candidate - recommend additional screening before proceeding');
    if (riskFactors.length >= 2) {
      recommendations.push('Multiple risk factors identified - consider alternative candidates');
    }
  }

  // Specific recommendations based on risk factors
  const hasLowScore = riskFactors.some(r => r.id === 'low-score');
  if (hasLowScore) {
    recommendations.push('If proceeding, plan for extended onboarding and skill development');
  }

  const hasWeaknesses = riskFactors.some(r => r.id === 'multiple-weaknesses');
  if (hasWeaknesses) {
    recommendations.push('Create targeted training plan to address specific weakness areas');
  }

  return recommendations;
}

export function generatePrediction(assessment: Assessment): AssessmentPrediction {
  const score = assessment.overallScore || 0;
  const sampleSize = 127; // Mock historical data sample size
  
  const successLikelihood = calculateSuccessLikelihood(score);
  const { confidence, level: predictionConfidence } = calculateConfidence(
    score,
    sampleSize,
    assessment.completedDate
  );

  const riskFactors = generateRiskFactors(assessment);
  const successIndicators = generateSuccessIndicators(assessment);
  const recommendations = generateRecommendations(assessment, successLikelihood, riskFactors);

  // Calculate metrics based on score
  const hiringSuccessRate = Math.min(Math.max(40 + (score - 50) * 0.8, 30), 95);
  const retentionProbability = Math.min(Math.max(50 + (score - 50) * 0.7, 40), 92);
  const expectedPerformanceRating = Math.min(Math.max(2.5 + (score - 50) * 0.04, 2.0), 5.0);
  const timeToProductivity = Math.max(30, 120 - score);
  const culturalFitScore = Math.min(Math.max(45 + (score - 50) * 0.9, 35), 95);

  return {
    assessmentId: assessment.id,
    candidateId: assessment.candidateId,
    candidateName: assessment.candidateName,
    jobTitle: assessment.jobTitle || 'Position',
    overallSuccessLikelihood: successLikelihood,
    confidenceScore: confidence,
    predictionConfidence,
    metrics: {
      hiringSuccessRate,
      retentionProbability,
      expectedPerformanceRating: Math.round(expectedPerformanceRating * 10) / 10,
      timeToProductivity: Math.round(timeToProductivity),
      culturalFitScore: Math.round(culturalFitScore),
    },
    riskFactors,
    successIndicators,
    historicalPattern: {
      scoreRange: { min: Math.max(0, score - 10), max: Math.min(100, score + 10) },
      sampleSize,
      successRate: hiringSuccessRate,
      averageRetention: Math.round(retentionProbability / 100 * 36), // months
      averagePerformanceRating: expectedPerformanceRating,
    },
    recommendations,
    comparisonToAverage: {
      betterThan: Math.round((score / 100) * 85), // percentage
      averageScore: 65,
      candidateScore: score,
    },
    predictedAt: new Date().toISOString(),
    dataQuality: {
      sampleSize,
      dataRecency: 'last 12 months',
      confidence: predictionConfidence,
    },
  };
}

export function getPredictionColor(likelihood: SuccessLikelihood): string {
  const colors = {
    'very-likely': 'text-green-600 dark:text-green-400',
    'likely': 'text-blue-600 dark:text-blue-400',
    'neutral': 'text-yellow-600 dark:text-yellow-400',
    'unlikely': 'text-orange-600 dark:text-orange-400',
    'very-unlikely': 'text-red-600 dark:text-red-400',
  };
  return colors[likelihood];
}

export function getPredictionBgColor(likelihood: SuccessLikelihood): string {
  const colors = {
    'very-likely': 'bg-green-50 dark:bg-green-950/30',
    'likely': 'bg-blue-50 dark:bg-blue-950/30',
    'neutral': 'bg-yellow-50 dark:bg-yellow-950/30',
    'unlikely': 'bg-orange-50 dark:bg-orange-950/30',
    'very-unlikely': 'bg-red-50 dark:bg-red-950/30',
  };
  return colors[likelihood];
}

export function getRiskColor(severity: RiskLevel): string {
  const colors = {
    low: 'text-blue-600 dark:text-blue-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  };
  return colors[severity];
}

export function getConfidenceColor(confidence: PredictionConfidence): string {
  const colors = {
    'very-low': 'text-red-600 dark:text-red-400',
    'low': 'text-orange-600 dark:text-orange-400',
    'medium': 'text-yellow-600 dark:text-yellow-400',
    'high': 'text-blue-600 dark:text-blue-400',
    'very-high': 'text-green-600 dark:text-green-400',
  };
  return colors[confidence];
}
import type { AssessmentType, AssessmentProvider, AssessmentTemplate } from '@/shared/types/assessment';

export interface ProviderTemplate {
  providerId: string;
  providerName: AssessmentProvider;
  templateId: string;
  name: string;
  description: string;
  assessmentType: AssessmentType;
  duration: number;
  questionCount: number;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  lastUpdated: string;
}

// Mock provider templates
const TESTGORILLA_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'tg-001',
    providerName: 'testgorilla',
    templateId: 'tg-cognitive-advanced',
    name: 'Advanced Cognitive Ability Test',
    description: 'Comprehensive assessment of problem-solving, critical thinking, and logical reasoning',
    assessmentType: 'cognitive',
    duration: 45,
    questionCount: 40,
    categories: ['Logical Reasoning', 'Numerical Reasoning', 'Verbal Reasoning', 'Pattern Recognition'],
    difficulty: 'advanced',
    popularity: 95,
    lastUpdated: '2025-01-15',
  },
  {
    providerId: 'tg-002',
    providerName: 'testgorilla',
    templateId: 'tg-personality-big5',
    name: 'Big Five Personality Assessment',
    description: 'Evaluate personality traits using the scientifically validated Big Five model',
    assessmentType: 'personality',
    duration: 30,
    questionCount: 50,
    categories: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    difficulty: 'intermediate',
    popularity: 88,
    lastUpdated: '2025-01-10',
  },
  {
    providerId: 'tg-003',
    providerName: 'testgorilla',
    templateId: 'tg-situational-leadership',
    name: 'Leadership Situational Judgment',
    description: 'Assess decision-making skills in leadership scenarios',
    assessmentType: 'situational-judgment',
    duration: 35,
    questionCount: 25,
    categories: ['Conflict Resolution', 'Team Management', 'Strategic Thinking', 'Communication'],
    difficulty: 'advanced',
    popularity: 82,
    lastUpdated: '2025-01-12',
  },
];

const CODILITY_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'cod-001',
    providerName: 'codility',
    templateId: 'cod-javascript-senior',
    name: 'Senior JavaScript Developer Test',
    description: 'Advanced JavaScript coding challenges covering algorithms and data structures',
    assessmentType: 'technical-skills',
    duration: 90,
    questionCount: 5,
    categories: ['Algorithms', 'Data Structures', 'ES6+', 'Performance Optimization'],
    difficulty: 'advanced',
    popularity: 92,
    lastUpdated: '2025-01-18',
  },
  {
    providerId: 'cod-002',
    providerName: 'codility',
    templateId: 'cod-python-intermediate',
    name: 'Python Developer Assessment',
    description: 'Mid-level Python coding test with practical problem-solving',
    assessmentType: 'technical-skills',
    duration: 75,
    questionCount: 6,
    categories: ['Python Fundamentals', 'Object-Oriented Programming', 'Data Analysis', 'Testing'],
    difficulty: 'intermediate',
    popularity: 87,
    lastUpdated: '2025-01-16',
  },
  {
    providerId: 'cod-003',
    providerName: 'codility',
    templateId: 'cod-sql-database',
    name: 'SQL & Database Design Test',
    description: 'Comprehensive SQL queries and database optimization challenges',
    assessmentType: 'technical-skills',
    duration: 60,
    questionCount: 8,
    categories: ['SQL Queries', 'Database Design', 'Indexing', 'Query Optimization'],
    difficulty: 'intermediate',
    popularity: 79,
    lastUpdated: '2025-01-14',
  },
];

const VERVOE_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'ver-001',
    providerName: 'vervoe',
    templateId: 'ver-sales-skills',
    name: 'Sales Representative Skills Assessment',
    description: 'Evaluate sales techniques, communication, and negotiation skills',
    assessmentType: 'behavioral',
    duration: 40,
    questionCount: 15,
    categories: ['Communication', 'Negotiation', 'Product Knowledge', 'Customer Service'],
    difficulty: 'intermediate',
    popularity: 85,
    lastUpdated: '2025-01-17',
  },
  {
    providerId: 'ver-002',
    providerName: 'vervoe',
    templateId: 'ver-customer-support',
    name: 'Customer Support Excellence Test',
    description: 'Assess problem-solving and communication in customer service scenarios',
    assessmentType: 'situational-judgment',
    duration: 35,
    questionCount: 20,
    categories: ['Problem Solving', 'Empathy', 'Technical Aptitude', 'Conflict Resolution'],
    difficulty: 'beginner',
    popularity: 80,
    lastUpdated: '2025-01-11',
  },
];

const CRITERIA_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'cri-001',
    providerName: 'criteria',
    templateId: 'cri-ccat-standard',
    name: 'Criteria Cognitive Aptitude Test (CCAT)',
    description: 'Industry-standard cognitive ability assessment',
    assessmentType: 'cognitive',
    duration: 15,
    questionCount: 50,
    categories: ['Verbal Reasoning', 'Math & Logic', 'Spatial Reasoning'],
    difficulty: 'intermediate',
    popularity: 96,
    lastUpdated: '2025-01-19',
  },
  {
    providerId: 'cri-002',
    providerName: 'criteria',
    templateId: 'cri-personality-workplace',
    name: 'Workplace Personality Inventory',
    description: 'Evaluate workplace behavior and cultural fit',
    assessmentType: 'personality',
    duration: 25,
    questionCount: 35,
    categories: ['Work Style', 'Team Dynamics', 'Leadership Potential', 'Stress Management'],
    difficulty: 'intermediate',
    popularity: 83,
    lastUpdated: '2025-01-13',
  },
];

const HARVER_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'har-001',
    providerName: 'harver',
    templateId: 'har-culture-fit',
    name: 'Organizational Culture Fit Assessment',
    description: 'Measure alignment with company values and culture',
    assessmentType: 'culture-fit',
    duration: 30,
    questionCount: 40,
    categories: ['Values Alignment', 'Work Environment Preferences', 'Communication Style', 'Team Collaboration'],
    difficulty: 'beginner',
    popularity: 78,
    lastUpdated: '2025-01-09',
  },
];

export const PROVIDER_TEMPLATES_MAP: Record<AssessmentProvider, ProviderTemplate[]> = {
  testgorilla: TESTGORILLA_TEMPLATES,
  codility: CODILITY_TEMPLATES,
  vervoe: VERVOE_TEMPLATES,
  criteria: CRITERIA_TEMPLATES,
  harver: HARVER_TEMPLATES,
  shl: [],
  internal: [],
};

export function getAllProviderTemplates(): ProviderTemplate[] {
  return Object.values(PROVIDER_TEMPLATES_MAP).flat();
}

export function getTemplatesByProvider(provider: AssessmentProvider): ProviderTemplate[] {
  return PROVIDER_TEMPLATES_MAP[provider] || [];
}

export function getTemplatesByType(type: AssessmentType): ProviderTemplate[] {
  return getAllProviderTemplates().filter(t => t.assessmentType === type);
}

export function searchProviderTemplates(query: string): ProviderTemplate[] {
  const lowerQuery = query.toLowerCase();
  return getAllProviderTemplates().filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.categories.some(c => c.toLowerCase().includes(lowerQuery))
  );
}

export function convertProviderTemplateToAssessmentTemplate(
  providerTemplate: ProviderTemplate
): Omit<AssessmentTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: `${providerTemplate.name} (${providerTemplate.providerName})`,
    description: providerTemplate.description,
    assessmentType: providerTemplate.assessmentType,
    provider: providerTemplate.providerName,
    duration: providerTemplate.duration,
    questionCount: providerTemplate.questionCount,
    passThreshold: 70,
    categories: providerTemplate.categories,
    isActive: true,
  };
}
import type { QuestionnaireQuestion, QuestionType } from '@/shared/types/questionnaireBuilder';

export interface QuestionTemplate {
  id: string;
  category: string;
  text: string;
  description?: string;
  type: QuestionType;
  options?: { text: string; score?: number }[];
  ratingConfig?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
  tags: string[];
}

export const QUESTION_CATEGORIES = [
  'Leadership',
  'Technical Skills',
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Work Ethic',
  'Adaptability',
  'Customer Service',
  'Time Management',
  'Cultural Fit',
] as const;

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Leadership
  {
    id: 'lead-1',
    category: 'Leadership',
    text: 'How would you rate the candidate\'s ability to lead and motivate a team?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Poor',
      maxLabel: 'Excellent',
    },
    tags: ['leadership', 'management', 'motivation'],
  },
  {
    id: 'lead-2',
    category: 'Leadership',
    text: 'Can you provide an example of when this person successfully led a project or team through a challenging situation?',
    type: 'long-text',
    tags: ['leadership', 'examples', 'challenges'],
  },
  {
    id: 'lead-3',
    category: 'Leadership',
    text: 'Does the candidate demonstrate strategic thinking and vision?',
    type: 'yes-no',
    tags: ['leadership', 'strategy', 'vision'],
  },
  {
    id: 'lead-4',
    category: 'Leadership',
    text: 'How does this person handle conflict within their team?',
    type: 'multiple-choice',
    options: [
      { text: 'Addresses conflicts directly and fairly', score: 5 },
      { text: 'Mediates and finds compromise', score: 4 },
      { text: 'Sometimes avoids difficult conversations', score: 2 },
      { text: 'Rarely addresses conflicts effectively', score: 1 },
    ],
    tags: ['leadership', 'conflict-resolution', 'management'],
  },
  {
    id: 'lead-5',
    category: 'Leadership',
    text: 'Rate the candidate\'s ability to delegate tasks effectively',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Rarely delegates',
      maxLabel: 'Excellent delegator',
    },
    tags: ['leadership', 'delegation', 'management'],
  },

  // Technical Skills
  {
    id: 'tech-1',
    category: 'Technical Skills',
    text: 'How would you rate the candidate\'s technical proficiency in their role?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Below expectations',
      maxLabel: 'Exceptional',
    },
    tags: ['technical', 'skills', 'proficiency'],
  },
  {
    id: 'tech-2',
    category: 'Technical Skills',
    text: 'Does this person stay current with industry trends and technologies?',
    type: 'yes-no',
    tags: ['technical', 'learning', 'development'],
  },
  {
    id: 'tech-3',
    category: 'Technical Skills',
    text: 'Can you describe the candidate\'s approach to learning new technologies or skills?',
    type: 'long-text',
    tags: ['technical', 'learning', 'adaptability'],
  },
  {
    id: 'tech-4',
    category: 'Technical Skills',
    text: 'What is the candidate\'s strongest technical skill?',
    type: 'short-text',
    tags: ['technical', 'strengths', 'expertise'],
  },
  {
    id: 'tech-5',
    category: 'Technical Skills',
    text: 'How does the candidate handle technical challenges or roadblocks?',
    type: 'multiple-choice',
    options: [
      { text: 'Proactively researches solutions', score: 5 },
      { text: 'Seeks guidance from team members', score: 4 },
      { text: 'Works through problems systematically', score: 4 },
      { text: 'Sometimes struggles to find solutions', score: 2 },
      { text: 'Often requires significant help', score: 1 },
    ],
    tags: ['technical', 'problem-solving', 'independence'],
  },

  // Communication
  {
    id: 'comm-1',
    category: 'Communication',
    text: 'How would you rate the candidate\'s written communication skills?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Needs improvement',
      maxLabel: 'Excellent',
    },
    tags: ['communication', 'writing', 'clarity'],
  },
  {
    id: 'comm-2',
    category: 'Communication',
    text: 'How would you rate the candidate\'s verbal communication skills?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Needs improvement',
      maxLabel: 'Excellent',
    },
    tags: ['communication', 'verbal', 'presentation'],
  },
  {
    id: 'comm-3',
    category: 'Communication',
    text: 'Is the candidate an active listener who understands others\' perspectives?',
    type: 'yes-no',
    tags: ['communication', 'listening', 'empathy'],
  },
  {
    id: 'comm-4',
    category: 'Communication',
    text: 'Describe how effectively this person communicates complex information to non-technical audiences',
    type: 'long-text',
    tags: ['communication', 'clarity', 'translation'],
  },
  {
    id: 'comm-5',
    category: 'Communication',
    text: 'How does the candidate handle difficult or sensitive conversations?',
    type: 'multiple-choice',
    options: [
      { text: 'Addresses issues professionally and tactfully', score: 5 },
      { text: 'Communicates clearly but may lack tact', score: 3 },
      { text: 'Avoids difficult conversations', score: 1 },
      { text: 'Sometimes becomes defensive', score: 2 },
    ],
    tags: ['communication', 'conflict', 'professionalism'],
  },

  // Teamwork
  {
    id: 'team-1',
    category: 'Teamwork',
    text: 'How well does this person work as part of a team?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Prefers working alone',
      maxLabel: 'Excellent team player',
    },
    tags: ['teamwork', 'collaboration', 'cooperation'],
  },
  {
    id: 'team-2',
    category: 'Teamwork',
    text: 'Does the candidate actively contribute to team success beyond their own responsibilities?',
    type: 'yes-no',
    tags: ['teamwork', 'initiative', 'collaboration'],
  },
  {
    id: 'team-3',
    category: 'Teamwork',
    text: 'Can you provide an example of when this person went above and beyond to help their team?',
    type: 'long-text',
    tags: ['teamwork', 'examples', 'dedication'],
  },
  {
    id: 'team-4',
    category: 'Teamwork',
    text: 'How does the candidate handle disagreements with team members?',
    type: 'multiple-choice',
    options: [
      { text: 'Discusses respectfully and finds common ground', score: 5 },
      { text: 'Compromises when necessary', score: 4 },
      { text: 'Can be stubborn but eventually cooperates', score: 2 },
      { text: 'Often creates conflict', score: 1 },
    ],
    tags: ['teamwork', 'conflict-resolution', 'cooperation'],
  },
  {
    id: 'team-5',
    category: 'Teamwork',
    text: 'Rate how well the candidate shares knowledge and mentors others',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Rarely shares',
      maxLabel: 'Actively mentors',
    },
    tags: ['teamwork', 'mentoring', 'knowledge-sharing'],
  },

  // Problem Solving
  {
    id: 'prob-1',
    category: 'Problem Solving',
    text: 'How would you rate the candidate\'s analytical and problem-solving abilities?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Limited',
      maxLabel: 'Exceptional',
    },
    tags: ['problem-solving', 'analytical', 'critical-thinking'],
  },
  {
    id: 'prob-2',
    category: 'Problem Solving',
    text: 'Does this person think creatively when approaching challenges?',
    type: 'yes-no',
    tags: ['problem-solving', 'creativity', 'innovation'],
  },
  {
    id: 'prob-3',
    category: 'Problem Solving',
    text: 'Describe a complex problem this person solved and their approach',
    type: 'long-text',
    tags: ['problem-solving', 'examples', 'methodology'],
  },
  {
    id: 'prob-4',
    category: 'Problem Solving',
    text: 'How does the candidate approach unfamiliar problems?',
    type: 'multiple-choice',
    options: [
      { text: 'Breaks down into smaller parts systematically', score: 5 },
      { text: 'Researches similar solutions', score: 4 },
      { text: 'Asks for guidance before starting', score: 3 },
      { text: 'Sometimes gets overwhelmed', score: 2 },
    ],
    tags: ['problem-solving', 'methodology', 'independence'],
  },

  // Work Ethic
  {
    id: 'work-1',
    category: 'Work Ethic',
    text: 'How would you rate the candidate\'s overall work ethic and dedication?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Below expectations',
      maxLabel: 'Outstanding',
    },
    tags: ['work-ethic', 'dedication', 'commitment'],
  },
  {
    id: 'work-2',
    category: 'Work Ethic',
    text: 'Is this person reliable and dependable?',
    type: 'yes-no',
    tags: ['work-ethic', 'reliability', 'dependability'],
  },
  {
    id: 'work-3',
    category: 'Work Ethic',
    text: 'How does the candidate handle tight deadlines?',
    type: 'multiple-choice',
    options: [
      { text: 'Consistently meets or exceeds deadlines', score: 5 },
      { text: 'Usually meets deadlines with good quality', score: 4 },
      { text: 'Sometimes needs deadline extensions', score: 2 },
      { text: 'Often misses deadlines', score: 1 },
    ],
    tags: ['work-ethic', 'deadlines', 'time-management'],
  },
  {
    id: 'work-4',
    category: 'Work Ethic',
    text: 'Rate the quality and attention to detail in the candidate\'s work',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Often needs revisions',
      maxLabel: 'Consistently high quality',
    },
    tags: ['work-ethic', 'quality', 'attention-to-detail'],
  },

  // Adaptability
  {
    id: 'adapt-1',
    category: 'Adaptability',
    text: 'How well does this person adapt to change and new situations?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Resists change',
      maxLabel: 'Highly adaptable',
    },
    tags: ['adaptability', 'flexibility', 'change-management'],
  },
  {
    id: 'adapt-2',
    category: 'Adaptability',
    text: 'Does the candidate remain productive during organizational changes?',
    type: 'yes-no',
    tags: ['adaptability', 'resilience', 'productivity'],
  },
  {
    id: 'adapt-3',
    category: 'Adaptability',
    text: 'Describe how this person handled a significant change in their role or responsibilities',
    type: 'long-text',
    tags: ['adaptability', 'examples', 'change-management'],
  },

  // Customer Service
  {
    id: 'cust-1',
    category: 'Customer Service',
    text: 'How would you rate the candidate\'s customer service skills?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Needs improvement',
      maxLabel: 'Exceptional',
    },
    tags: ['customer-service', 'client-relations', 'satisfaction'],
  },
  {
    id: 'cust-2',
    category: 'Customer Service',
    text: 'Does this person handle difficult customers or clients professionally?',
    type: 'yes-no',
    tags: ['customer-service', 'professionalism', 'conflict-resolution'],
  },
  {
    id: 'cust-3',
    category: 'Customer Service',
    text: 'Rate the candidate\'s ability to build and maintain client relationships',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Limited',
      maxLabel: 'Outstanding',
    },
    tags: ['customer-service', 'relationships', 'rapport'],
  },

  // Time Management
  {
    id: 'time-1',
    category: 'Time Management',
    text: 'How effectively does this person manage their time and priorities?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Poor prioritization',
      maxLabel: 'Excellent organization',
    },
    tags: ['time-management', 'organization', 'prioritization'],
  },
  {
    id: 'time-2',
    category: 'Time Management',
    text: 'Can the candidate successfully manage multiple projects simultaneously?',
    type: 'yes-no',
    tags: ['time-management', 'multitasking', 'organization'],
  },
  {
    id: 'time-3',
    category: 'Time Management',
    text: 'How does the candidate balance competing priorities?',
    type: 'multiple-choice',
    options: [
      { text: 'Assesses urgency and adjusts accordingly', score: 5 },
      { text: 'Creates clear priority lists', score: 4 },
      { text: 'Sometimes struggles with prioritization', score: 2 },
      { text: 'Often overwhelmed by multiple tasks', score: 1 },
    ],
    tags: ['time-management', 'prioritization', 'multitasking'],
  },

  // Cultural Fit
  {
    id: 'cult-1',
    category: 'Cultural Fit',
    text: 'How well did this person fit with your organization\'s culture and values?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Poor fit',
      maxLabel: 'Perfect fit',
    },
    tags: ['cultural-fit', 'values', 'alignment'],
  },
  {
    id: 'cult-2',
    category: 'Cultural Fit',
    text: 'Would you rehire this person if given the opportunity?',
    type: 'yes-no',
    tags: ['cultural-fit', 'recommendation', 'rehire'],
  },
  {
    id: 'cult-3',
    category: 'Cultural Fit',
    text: 'What makes this person a good cultural fit (or not) for a collaborative, fast-paced environment?',
    type: 'long-text',
    tags: ['cultural-fit', 'environment', 'compatibility'],
  },
];

export function getQuestionsByCategory(category: string): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter(q => q.category === category);
}

export function searchQuestions(query: string): QuestionTemplate[] {
  const lowerQuery = query.toLowerCase();
  return QUESTION_TEMPLATES.filter(q => 
    q.text.toLowerCase().includes(lowerQuery) ||
    q.category.toLowerCase().includes(lowerQuery) ||
    q.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function convertTemplateToQuestion(template: QuestionTemplate, order: number): QuestionnaireQuestion {
  const baseQuestion: QuestionnaireQuestion = {
    id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: template.type,
    text: template.text,
    description: template.description,
    required: false,
    order,
  };

  if (template.options) {
    baseQuestion.options = template.options.map((opt, idx) => ({
      id: `option-${Date.now()}-${idx}`,
      text: opt.text,
      score: opt.score,
    }));
  }

  if (template.ratingConfig) {
    baseQuestion.ratingConfig = { ...template.ratingConfig };
  }

  if (template.options && template.options.some(opt => opt.score !== undefined)) {
    baseQuestion.scoringEnabled = true;
    baseQuestion.maxScore = Math.max(...template.options.map(opt => opt.score || 0));
  }

  return baseQuestion;
}
import type { QuestionnaireTemplate } from '@/shared/types/questionnaireBuilder';

const QUESTIONNAIRE_TEMPLATES_KEY = 'hrm8_questionnaire_templates';

function initializeStorage() {
  if (!localStorage.getItem(QUESTIONNAIRE_TEMPLATES_KEY)) {
    localStorage.setItem(QUESTIONNAIRE_TEMPLATES_KEY, JSON.stringify([]));
  }
}

export function saveQuestionnaireTemplate(template: QuestionnaireTemplate): void {
  initializeStorage();
  const templates = getQuestionnaireTemplates();
  
  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex !== -1) {
    templates[existingIndex] = {
      ...template,
      updatedAt: new Date().toISOString(),
      version: templates[existingIndex].version + 1,
    };
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(QUESTIONNAIRE_TEMPLATES_KEY, JSON.stringify(templates));
}

export function getQuestionnaireTemplates(): QuestionnaireTemplate[] {
  initializeStorage();
  const data = localStorage.getItem(QUESTIONNAIRE_TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getQuestionnaireTemplateById(id: string): QuestionnaireTemplate | undefined {
  return getQuestionnaireTemplates().find(t => t.id === id);
}

export function deleteQuestionnaireTemplate(id: string): void {
  const templates = getQuestionnaireTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(QUESTIONNAIRE_TEMPLATES_KEY, JSON.stringify(filtered));
}

export function duplicateQuestionnaireTemplate(id: string): QuestionnaireTemplate | null {
  const template = getQuestionnaireTemplateById(id);
  if (!template) return null;
  
  const duplicate: QuestionnaireTemplate = {
    ...template,
    id: `questionnaire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${template.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  
  saveQuestionnaireTemplate(duplicate);
  return duplicate;
}
