import { z } from 'zod';
import {
  TeamMemberFeedback,
  HiringVote,
  ConsensusMetrics,
  DecisionHistoryEntry,
  RatingCriterion,
  CandidateComparison,
  StructuredComment,
} from '@/shared/types/collaborativeFeedback';

// Storage keys
const FEEDBACK_KEY = 'collaborative_feedback';
const VOTES_KEY = 'hiring_votes';
const DECISIONS_KEY = 'decision_history';
const CRITERIA_KEY = 'rating_criteria';

// Validation schemas
export const feedbackSchema = z.object({
  candidateId: z.string(),
  applicationId: z.string().optional(),
  interviewId: z.string().optional(),
  reviewerId: z.string(),
  reviewerName: z.string(),
  reviewerRole: z.string(),
  ratings: z.array(z.object({
    criterionId: z.string(),
    value: z.union([z.number(), z.string()]),
    confidence: z.number().min(1).max(5),
    notes: z.string().optional(),
  })),
  comments: z.array(z.object({
    type: z.enum(['strength', 'concern', 'observation', 'question']),
    category: z.string(),
    content: z.string(),
    importance: z.enum(['low', 'medium', 'high']),
  })),
  overallScore: z.number().min(0).max(100),
  recommendation: z.enum(['strong-hire', 'hire', 'maybe', 'no-hire', 'strong-no-hire']),
  confidence: z.number().min(1).max(5),
});

// Initialize storage
function initializeStorage() {
  if (!localStorage.getItem(CRITERIA_KEY)) {
    const defaultCriteria: RatingCriterion[] = [
      { id: '1', name: 'Technical Skills', description: 'Proficiency in required technologies', scale: '1-10', weight: 0.25, category: 'technical' },
      { id: '2', name: 'Problem Solving', description: 'Analytical and critical thinking abilities', scale: '1-10', weight: 0.20, category: 'technical' },
      { id: '3', name: 'Communication', description: 'Clarity and effectiveness in communication', scale: '1-10', weight: 0.15, category: 'communication' },
      { id: '4', name: 'Cultural Fit', description: 'Alignment with company values and culture', scale: '1-10', weight: 0.15, category: 'cultural' },
      { id: '5', name: 'Leadership Potential', description: 'Ability to lead and inspire teams', scale: '1-10', weight: 0.15, category: 'leadership' },
      { id: '6', name: 'Growth Mindset', description: 'Willingness to learn and adapt', scale: '1-10', weight: 0.10, category: 'cultural' },
    ];
    localStorage.setItem(CRITERIA_KEY, JSON.stringify(defaultCriteria));
  }
}

// Import and initialize mock data
import { initializeMockFeedbackData } from './mockFeedbackData';

initializeStorage();
initializeMockFeedbackData();

// Rating Criteria Management
export function getRatingCriteria(): RatingCriterion[] {
  const data = localStorage.getItem(CRITERIA_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRatingCriterion(criterion: Omit<RatingCriterion, 'id'>): void {
  const criteria = getRatingCriteria();
  const newCriterion: RatingCriterion = {
    ...criterion,
    id: Date.now().toString(),
  };
  criteria.push(newCriterion);
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
}

export function updateRatingCriterion(id: string, updates: Partial<RatingCriterion>): void {
  const criteria = getRatingCriteria();
  const index = criteria.findIndex(c => c.id === id);
  if (index !== -1) {
    criteria[index] = { ...criteria[index], ...updates };
    localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
  }
}

export function deleteRatingCriterion(id: string): void {
  const criteria = getRatingCriteria().filter(c => c.id !== id);
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
}

export function reorderRatingCriteria(reorderedCriteria: RatingCriterion[]): void {
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(reorderedCriteria));
}

// Feedback Management
export function getCandidateFeedback(candidateId: string): TeamMemberFeedback[] {
  const data = localStorage.getItem(FEEDBACK_KEY);
  const allFeedback: TeamMemberFeedback[] = data ? JSON.parse(data) : [];
  return allFeedback.filter(f => f.candidateId === candidateId);
}

export function getAllFeedback(): TeamMemberFeedback[] {
  const data = localStorage.getItem(FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveFeedback(feedback: Omit<TeamMemberFeedback, 'id' | 'submittedAt' | 'updatedAt'>): TeamMemberFeedback {
  const allFeedback = getAllFeedback();
  const newFeedback: TeamMemberFeedback = {
    ...feedback,
    id: Date.now().toString(),
    comments: feedback.comments.map(c => ({
      ...c,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    })),
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allFeedback.push(newFeedback);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  return newFeedback;
}

export function updateFeedback(id: string, updates: Partial<TeamMemberFeedback>): void {
  const allFeedback = getAllFeedback();
  const index = allFeedback.findIndex(f => f.id === id);
  if (index !== -1) {
    allFeedback[index] = {
      ...allFeedback[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  }
}

export function deleteFeedback(id: string): void {
  const allFeedback = getAllFeedback().filter(f => f.id !== id);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
}

export function getFeedbackByCandidateId(candidateId: string): TeamMemberFeedback[] {
  return getCandidateFeedback(candidateId);
}

export function getVotesByCandidateId(candidateId: string): HiringVote[] {
  return getCandidateVotes(candidateId);
}

// Voting Management
export function getCandidateVotes(candidateId: string): HiringVote[] {
  const data = localStorage.getItem(VOTES_KEY);
  const allVotes: HiringVote[] = data ? JSON.parse(data) : [];
  return allVotes.filter(v => v.candidateId === candidateId);
}

export function saveVote(vote: Omit<HiringVote, 'id' | 'votedAt'>): HiringVote {
  const allVotes: HiringVote[] = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
  
  // Remove existing vote from same voter for same candidate
  const filteredVotes = allVotes.filter(
    v => !(v.candidateId === vote.candidateId && v.voterId === vote.voterId)
  );
  
  const newVote: HiringVote = {
    ...vote,
    id: Date.now().toString(),
    votedAt: new Date().toISOString(),
  };
  
  filteredVotes.push(newVote);
  localStorage.setItem(VOTES_KEY, JSON.stringify(filteredVotes));
  return newVote;
}

// Decision History
export function getCandidateDecisionHistory(candidateId: string): DecisionHistoryEntry[] {
  const data = localStorage.getItem(DECISIONS_KEY);
  const allDecisions: DecisionHistoryEntry[] = data ? JSON.parse(data) : [];
  return allDecisions.filter(d => d.candidateId === candidateId);
}

export function saveDecision(decision: Omit<DecisionHistoryEntry, 'id' | 'decidedAt'>): DecisionHistoryEntry {
  const allDecisions: DecisionHistoryEntry[] = JSON.parse(localStorage.getItem(DECISIONS_KEY) || '[]');
  const newDecision: DecisionHistoryEntry = {
    ...decision,
    id: Date.now().toString(),
    decidedAt: new Date().toISOString(),
  };
  allDecisions.push(newDecision);
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(allDecisions));
  return newDecision;
}

// Consensus Calculations
export function calculateConsensusMetrics(candidateId: string): ConsensusMetrics {
  const feedback = getCandidateFeedback(candidateId);
  const votes = getCandidateVotes(candidateId);
  
  if (feedback.length === 0) {
    return {
      candidateId,
      totalFeedbacks: 0,
      averageScore: 0,
      scoreStdDev: 0,
      agreementLevel: 0,
      criteriaAverages: {},
      recommendationDistribution: {},
      voteResults: { hire: 0, noHire: 0, abstain: 0 },
      topStrengths: [],
      topConcerns: [],
      lastUpdated: new Date().toISOString(),
    };
  }
  
  // Calculate average score
  const scores = feedback.map(f => f.overallScore);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Calculate standard deviation
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
  const scoreStdDev = Math.sqrt(variance);
  
  // Calculate agreement level (inverse of coefficient of variation, normalized to 0-1)
  const agreementLevel = averageScore > 0 ? Math.max(0, 1 - (scoreStdDev / averageScore)) : 0;
  
  // Aggregate criteria ratings
  const criteriaAverages: Record<string, number> = {};
  const criteria = getRatingCriteria();
  
  criteria.forEach(criterion => {
    const ratings = feedback
      .flatMap(f => f.ratings)
      .filter(r => r.criterionId === criterion.id)
      .map(r => typeof r.value === 'number' ? r.value : parseFloat(r.value as string) || 0);
    
    if (ratings.length > 0) {
      criteriaAverages[criterion.id] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
  });
  
  // Recommendation distribution
  const recommendationDistribution: Record<string, number> = {};
  feedback.forEach(f => {
    recommendationDistribution[f.recommendation] = (recommendationDistribution[f.recommendation] || 0) + 1;
  });
  
  // Vote results
  const voteResults = {
    hire: votes.filter(v => v.decision === 'hire').length,
    noHire: votes.filter(v => v.decision === 'no-hire').length,
    abstain: votes.filter(v => v.decision === 'abstain').length,
  };
  
  // Extract top strengths and concerns
  const strengths: Record<string, number> = {};
  const concerns: Record<string, number> = {};
  
  feedback.forEach(f => {
    f.comments.forEach(comment => {
      if (comment.type === 'strength') {
        const key = comment.content.substring(0, 50);
        strengths[key] = (strengths[key] || 0) + 1;
      } else if (comment.type === 'concern') {
        const key = comment.content.substring(0, 50);
        concerns[key] = (concerns[key] || 0) + 1;
      }
    });
  });
  
  const topStrengths = Object.entries(strengths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);
  
  const topConcerns = Object.entries(concerns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);
  
  return {
    candidateId,
    totalFeedbacks: feedback.length,
    averageScore,
    scoreStdDev,
    agreementLevel,
    criteriaAverages,
    recommendationDistribution,
    voteResults,
    topStrengths,
    topConcerns,
    lastUpdated: new Date().toISOString(),
  };
}

// Comparison Reports
export function generateCandidateComparison(candidateIds: string[]): CandidateComparison[] {
  return candidateIds.map(candidateId => {
    const feedback = getCandidateFeedback(candidateId);
    const votes = getCandidateVotes(candidateId);
    const decisionHistory = getCandidateDecisionHistory(candidateId);
    const consensusMetrics = calculateConsensusMetrics(candidateId);
    
    // Get candidate info (mock for now)
    const candidateName = `Candidate ${candidateId}`;
    const jobTitle = 'Position';
    
    return {
      candidateId,
      candidateName,
      jobTitle,
      consensusMetrics,
      feedback,
      votes,
      decisionHistory,
    };
  });
}

export function getRecommendationColor(recommendation: string): string {
  const colors: Record<string, string> = {
    'strong-hire': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    'hire': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    'maybe': 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    'no-hire': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    'strong-no-hire': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  };
  return colors[recommendation] || 'text-muted-foreground bg-muted';
}

export function getRecommendationLabel(recommendation: string): string {
  const labels: Record<string, string> = {
    'strong-hire': 'Strong Hire',
    'hire': 'Hire',
    'maybe': 'Maybe',
    'no-hire': 'No Hire',
    'strong-no-hire': 'Strong No Hire',
  };
  return labels[recommendation] || recommendation;
}
import { FeedbackRequest, TeamMember, NotificationPreference } from '@/shared/types/feedbackRequest';

const TEAM_KEY = 'team_members';
const REQUESTS_KEY = 'feedback_requests';
const PREFS_KEY = 'notification_preferences';

export function getTeamMembers(): TeamMember[] {
  const data = localStorage.getItem(TEAM_KEY);
  return data ? JSON.parse(data) : [];
}

export function getFeedbackRequests(): FeedbackRequest[] {
  const data = localStorage.getItem(REQUESTS_KEY);
  const requests: FeedbackRequest[] = data ? JSON.parse(data) : [];
  
  // Update overdue status
  return requests.map(req => {
    if (req.status === 'pending' && new Date(req.dueDate) < new Date()) {
      return { ...req, status: 'overdue' as const };
    }
    return req;
  });
}

export function getRequestsByCandidateId(candidateId: string): FeedbackRequest[] {
  return getFeedbackRequests().filter(req => req.candidateId === candidateId);
}

export function getRequestsByUserId(userId: string): FeedbackRequest[] {
  return getFeedbackRequests().filter(req => req.requestedTo === userId);
}

export function createFeedbackRequest(request: Omit<FeedbackRequest, 'id' | 'requestedAt' | 'status'>): FeedbackRequest {
  const requests = getFeedbackRequests();
  const newRequest: FeedbackRequest = {
    ...request,
    id: `req-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  
  requests.push(newRequest);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  
  // Simulate email notification
  console.log(`📧 Email sent to ${newRequest.requestedToEmail}: Feedback requested for ${newRequest.candidateName}`);
  
  return newRequest;
}

export function createBulkFeedbackRequests(
  requestsData: Omit<FeedbackRequest, 'id' | 'requestedAt' | 'status'>[]
): FeedbackRequest[] {
  const existingRequests = getFeedbackRequests();
  const baseTimestamp = Date.now();
  
  const newRequests: FeedbackRequest[] = requestsData.map((request, index) => ({
    ...request,
    id: `req-${baseTimestamp}-${index}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  }));
  
  existingRequests.push(...newRequests);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(existingRequests));
  
  // Simulate bulk email notifications
  console.log(`📧 Bulk emails sent to ${newRequests.length} team members for ${requestsData[0]?.candidateName || 'candidate'}`);
  newRequests.forEach(req => {
    console.log(`   → ${req.requestedToEmail}`);
  });
  
  return newRequests;
}

export function completeRequest(requestId: string): void {
  const requests = getFeedbackRequests();
  const updated = requests.map(req => 
    req.id === requestId 
      ? { ...req, status: 'completed' as const, completedAt: new Date().toISOString() }
      : req
  );
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
}

export function sendReminder(requestId: string): void {
  const requests = getFeedbackRequests();
  const updated = requests.map(req => 
    req.id === requestId 
      ? { ...req, reminderSent: true }
      : req
  );
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  
  const request = updated.find(r => r.id === requestId);
  if (request) {
    console.log(`📧 Reminder sent to ${request.requestedToEmail}: Feedback still needed for ${request.candidateName}`);
  }
}

export function getNotificationPreferences(userId: string): NotificationPreference {
  const data = localStorage.getItem(PREFS_KEY);
  const prefs: NotificationPreference[] = data ? JSON.parse(data) : [];
  
  const userPref = prefs.find(p => p.userId === userId);
  return userPref || {
    userId,
    emailOnRequest: true,
    emailReminders: true,
    reminderDaysBefore: 2,
    dailyDigest: false,
  };
}

export function updateNotificationPreferences(preferences: NotificationPreference): void {
  const data = localStorage.getItem(PREFS_KEY);
  const prefs: NotificationPreference[] = data ? JSON.parse(data) : [];
  
  const index = prefs.findIndex(p => p.userId === preferences.userId);
  if (index >= 0) {
    prefs[index] = preferences;
  } else {
    prefs.push(preferences);
  }
  
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { PerformanceGoal, PerformanceReview } from "@/shared/types/performance";
import type { Employee } from "@/shared/types/employee";
import { format } from "date-fns";

interface ExportData {
  goals: PerformanceGoal[];
  reviews: PerformanceReview[];
  includeKPIs: boolean;
  includeCharts: boolean;
  template: string;
  employees: Employee[];
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${format(new Date(), "PPP")}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Summary Statistics
  if (data.template === "comprehensive" || data.template === "summary") {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, yPosition);
    yPosition += 8;

    const totalGoals = data.goals.length;
    const completedGoals = data.goals.filter(g => g.status === "completed").length;
    const avgProgress = totalGoals > 0 
      ? Math.round(data.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;
    const totalReviews = data.reviews.length;
    const completedReviews = data.reviews.filter(r => r.status === "completed").length;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryData = [
      ["Total Goals", totalGoals.toString()],
      ["Completed Goals", completedGoals.toString()],
      ["Average Progress", `${avgProgress}%`],
      ["Completion Rate", `${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%`],
      ["Total Reviews", totalReviews.toString()],
      ["Completed Reviews", completedReviews.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Goals Section
  if (data.goals.length > 0 && data.template !== "reviews-only") {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Goals", 14, yPosition);
    yPosition += 8;

    const goalsData = data.goals.map(goal => {
      const employee = data.employees.find(e => e.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeName;
      
      return [
        employeeName,
        goal.title.substring(0, 40) + (goal.title.length > 40 ? "..." : ""),
        goal.category || "N/A",
        goal.priority.toUpperCase(),
        goal.status.replace("-", " ").toUpperCase(),
        `${goal.progress}%`,
        format(new Date(goal.targetDate), "MMM dd, yyyy"),
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Employee", "Goal", "Category", "Priority", "Status", "Progress", "Target Date"]],
      body: goalsData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 50 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // KPI Details
    if (data.includeKPIs && data.template !== "summary") {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Key Performance Indicators", 14, yPosition);
      yPosition += 8;

      const kpiData: any[] = [];
      data.goals.forEach(goal => {
        goal.kpis?.forEach(kpi => {
          const achievement = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
          kpiData.push([
            goal.title.substring(0, 30) + (goal.title.length > 30 ? "..." : ""),
            kpi.name.substring(0, 30) + (kpi.name.length > 30 ? "..." : ""),
            `${kpi.current} ${kpi.unit}`,
            `${kpi.target} ${kpi.unit}`,
            `${achievement}%`,
          ]);
        });
      });

      if (kpiData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [["Goal", "KPI", "Current", "Target", "Achievement"]],
          body: kpiData,
          theme: "striped",
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    }
  }

  // Reviews Section
  if (data.reviews.length > 0 && data.template !== "goals-only") {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Reviews", 14, yPosition);
    yPosition += 8;

    const reviewsData = data.reviews.map(review => {
      const employee = data.employees.find(e => e.id === review.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : review.employeeName;
      
      return [
        employeeName,
        review.templateName,
        format(new Date(review.reviewPeriodStart), "MMM yyyy") + " - " + format(new Date(review.reviewPeriodEnd), "MMM yyyy"),
        review.status.toUpperCase(),
        review.overallRating ? review.overallRating.toFixed(1) : "N/A",
        review.completedDate ? format(new Date(review.completedDate), "MMM dd, yyyy") : "Pending",
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Employee", "Template", "Period", "Status", "Rating", "Completed"]],
      body: reviewsData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  doc.save(`performance-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export async function exportToExcel(data: ExportData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Performance Report Summary"],
    ["Generated", format(new Date(), "PPP")],
    [""],
    ["Metric", "Value"],
    ["Total Goals", data.goals.length],
    ["Completed Goals", data.goals.filter(g => g.status === "completed").length],
    ["Average Progress", `${data.goals.length > 0 ? Math.round(data.goals.reduce((sum, g) => sum + g.progress, 0) / data.goals.length) : 0}%`],
    ["Total Reviews", data.reviews.length],
    ["Completed Reviews", data.reviews.filter(r => r.status === "completed").length],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Goals Sheet
  if (data.goals.length > 0) {
    const goalsData = data.goals.map(goal => {
      const employee = data.employees.find(e => e.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeName;
      
      return {
        Employee: employeeName,
        Title: goal.title,
        Description: goal.description,
        Category: goal.category || "N/A",
        Priority: goal.priority,
        Status: goal.status,
        Progress: `${goal.progress}%`,
        "Start Date": format(new Date(goal.startDate), "yyyy-MM-dd"),
        "Target Date": format(new Date(goal.targetDate), "yyyy-MM-dd"),
        "Completed Date": goal.completedDate ? format(new Date(goal.completedDate), "yyyy-MM-dd") : "",
      };
    });

    const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
    XLSX.utils.book_append_sheet(workbook, goalsSheet, "Goals");
  }

  // KPIs Sheet
  if (data.includeKPIs && data.goals.length > 0) {
    const kpiData: any[] = [];
    data.goals.forEach(goal => {
      const employee = data.employees.find(e => e.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeName;
      
      goal.kpis?.forEach(kpi => {
        const achievement = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
        kpiData.push({
          Employee: employeeName,
          Goal: goal.title,
          "KPI Name": kpi.name,
          Description: kpi.description || "",
          Current: kpi.current,
          Target: kpi.target,
          Unit: kpi.unit,
          Achievement: `${achievement}%`,
        });
      });
    });

    if (kpiData.length > 0) {
      const kpisSheet = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpisSheet, "KPIs");
    }
  }

  // Reviews Sheet
  if (data.reviews.length > 0) {
    const reviewsData = data.reviews.map(review => {
      const employee = data.employees.find(e => e.id === review.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : review.employeeName;
      
      return {
        Employee: employeeName,
        Reviewer: review.reviewerName,
        Template: review.templateName,
        "Period Start": format(new Date(review.reviewPeriodStart), "yyyy-MM-dd"),
        "Period End": format(new Date(review.reviewPeriodEnd), "yyyy-MM-dd"),
        Status: review.status,
        "Overall Rating": review.overallRating || "N/A",
        "Due Date": format(new Date(review.dueDate), "yyyy-MM-dd"),
        "Completed Date": review.completedDate ? format(new Date(review.completedDate), "yyyy-MM-dd") : "",
        Strengths: review.strengths || "",
        "Areas for Improvement": review.areasForImprovement || "",
        "Manager Comments": review.managerComments || "",
      };
    });

    const reviewsSheet = XLSX.utils.json_to_sheet(reviewsData);
    XLSX.utils.book_append_sheet(workbook, reviewsSheet, "Reviews");
  }

  // Save
  XLSX.writeFile(workbook, `performance-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { AIFeedbackAnalysis } from '@/shared/types/aiAnalysis';

export function exportIndividualFeedbackPDF(
  feedback: TeamMemberFeedback,
  analysis: AIFeedbackAnalysis,
  candidateName: string
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Individual Feedback Report', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Candidate: ${candidateName}`, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.text(`Reviewer: ${feedback.reviewerName} (${feedback.reviewerRole})`, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setTextColor(128, 128, 128);
  doc.text(`Date: ${new Date(feedback.submittedAt).toLocaleDateString()}`, 105, yPos, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Overall Rating
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Assessment', 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Score: ${feedback.overallScore}/100`, 20, yPos);
  doc.text(`Recommendation: ${feedback.recommendation}`, 20, yPos + 6);
  
  yPos += 18;

  // AI Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Analysis Summary', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = doc.splitTextToSize(analysis.summary, 170);
  doc.text(summaryText, 20, yPos);
  yPos += summaryText.length * 5 + 10;

  // Sentiment & Confidence
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sentiment Analysis', 20, yPos);
  yPos += 8;

  const sentimentData = [
    ['Overall Sentiment', analysis.sentiment.overall.toUpperCase()],
    ['Sentiment Score', `${(analysis.sentiment.score * 100).toFixed(0)}%`],
    ['Confidence Level', `${analysis.sentiment.emotions.confidence}%`],
    ['Enthusiasm', `${analysis.sentiment.emotions.enthusiasm}%`],
    ['Objectivity', `${analysis.sentiment.emotions.objectivity}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    body: sentimentData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 80 }
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Detailed Comments
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Feedback', 20, yPos);
  yPos += 10;

  feedback.comments.forEach((comment, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}`, 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const commentText = doc.splitTextToSize(comment.content, 170);
    doc.text(commentText, 25, yPos);
    yPos += commentText.length * 5 + 8;
  });

  // Bias Detection
  if (analysis.biasDetection.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('⚠ Potential Biases Detected', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;

    analysis.biasDetection.forEach((bias, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${bias.type?.toUpperCase()} Bias (${bias.severity.toUpperCase()})`, 20, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const excerptText = doc.splitTextToSize(`"${bias.excerpt}"`, 170);
      doc.text(excerptText, 25, yPos);
      yPos += excerptText.length * 5 + 4;

      doc.setFont('helvetica', 'normal');
      const suggestionText = doc.splitTextToSize(bias.suggestion, 170);
      doc.text(suggestionText, 25, yPos);
      yPos += suggestionText.length * 5 + 10;
    });
  }

  // AI Suggestions
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Improvement Suggestions', 20, yPos);
  yPos += 10;

  analysis.suggestions.forEach((suggestion, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${suggestion.title}`, 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const suggestionText = doc.splitTextToSize(suggestion.suggestion, 170);
    doc.text(suggestionText, 25, yPos);
    yPos += suggestionText.length * 5 + 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('Generated by AI Feedback System', 105, 285, { align: 'center' });
  }

  doc.save(`Feedback_${feedback.reviewerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

export function exportIndividualFeedbackExcel(
  feedback: TeamMemberFeedback,
  analysis: AIFeedbackAnalysis,
  candidateName: string
): void {
  const data = {
    candidateName,
    reviewerName: feedback.reviewerName,
    reviewerRole: feedback.reviewerRole,
    submittedAt: new Date(feedback.submittedAt).toLocaleString(),
    overallScore: feedback.overallScore,
    recommendation: feedback.recommendation,
    aiSummary: analysis.summary,
    sentimentOverall: analysis.sentiment.overall,
    sentimentScore: analysis.sentiment.score,
    confidenceScore: analysis.confidenceScore,
    comments: feedback.comments,
    biases: analysis.biasDetection,
    suggestions: analysis.suggestions,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Feedback_${feedback.reviewerName.replace(/\s+/g, '_')}_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
