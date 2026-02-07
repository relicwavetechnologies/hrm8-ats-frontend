/**
 * Job Data Mapper
 * Maps backend job data to frontend format
 */

import { Job as BackendJob } from '@/shared/lib/jobService';
import { Job, JobFormData } from '@/shared/types/job';

/**
 * Normalize backend status to frontend status
 */
function normalizeStatus(status: string): 'draft' | 'open' | 'closed' | 'on-hold' | 'filled' | 'cancelled' | 'template' {
  const normalized = status.toLowerCase();
  if (normalized === 'on_hold' || normalized === 'on-hold') return 'on-hold';
  if (normalized === 'draft') return 'draft';
  if (normalized === 'open') return 'open';
  if (normalized === 'closed') return 'closed';
  if (normalized === 'filled') return 'filled';
  if (normalized === 'cancelled') return 'cancelled';
  if (normalized === 'template') return 'template';
  return 'draft'; // default
}

/**
 * Map backend hiringMode to frontend serviceType
 */
function mapHiringModeToServiceType(hiringMode: string): 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo' {
  const normalized = hiringMode.toLowerCase();
  if (normalized === 'self_managed' || normalized === 'self-managed') return 'self-managed';
  if (normalized === 'shortlisting') return 'shortlisting';
  if (normalized === 'full_service' || normalized === 'full-service') return 'full-service';
  if (normalized === 'executive_search' || normalized === 'executive-search') return 'executive-search';
  if (normalized === 'rpo') return 'rpo';
  return 'self-managed'; // default
}

/**
 * Map backend workArrangement to frontend format
 */
function normalizeWorkArrangement(workArrangement: string): 'on-site' | 'remote' | 'hybrid' {
  const normalized = workArrangement.toLowerCase();
  if (normalized === 'on_site' || normalized === 'on-site') return 'on-site';
  if (normalized === 'remote') return 'remote';
  if (normalized === 'hybrid') return 'hybrid';
  return 'on-site'; // default
}

/**
 * Map backend employmentType to frontend format
 */
function normalizeEmploymentType(employmentType: string): 'full-time' | 'part-time' | 'contract' | 'casual' {
  const normalized = employmentType.toLowerCase();
  if (normalized === 'full_time' || normalized === 'full-time') return 'full-time';
  if (normalized === 'part_time' || normalized === 'part-time') return 'part-time';
  if (normalized === 'contract') return 'contract';
  if (normalized === 'casual') return 'casual';
  return 'full-time'; // default
}

/**
 * Map backend job to frontend Job interface
 */
export function mapBackendJobToFrontend(backendJob: any): Job {
  if (!backendJob) {
    return {
      id: '',
      employerId: '',
      employerName: '',
      employerLogo: undefined,
      createdBy: '',
      createdByName: '',
      title: '',
      numberOfVacancies: 1,
      jobCode: '',
      description: '',
      requirements: [],
      responsibilities: [],
      department: '',
      location: '',
      country: undefined,
      employmentType: 'full-time',
      salaryMin: undefined,
      salaryMax: undefined,
      salaryCurrency: 'USD',
      salaryPeriod: 'annual',
      salaryDescription: undefined,
      experienceLevel: 'mid',
      status: 'draft',
      visibility: 'public',
      stealth: false,
      postingDate: new Date().toISOString(),
      closeDate: undefined,
      tags: [],
      workArrangement: 'on-site',
      aiGeneratedDescription: false,
      serviceType: 'self-managed',
      serviceStatus: undefined,
      assignedConsultantId: undefined,
      assignedConsultantName: undefined,
      pipeline: undefined,
      jobBoardDistribution: ['HRM8 Job Board'],
      applicantsCount: 0,
      unreadApplicants: undefined,
      viewsCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hiringTeam: [],
      applicationForm: undefined,
      hasJobTargetPromotion: undefined,
      jobTargetBudget: undefined,
      jobTargetBudgetRemaining: undefined,
      jobTargetPromotions: undefined,
      paymentId: undefined,
      requiresPayment: undefined,
      paymentStatus: undefined,
      serviceFee: undefined,
      termsAccepted: undefined,
      termsAcceptedAt: undefined,
      termsAcceptedBy: undefined,
      isInternal: undefined,
      internalOnly: undefined,
      eligibleDepartments: undefined,
      internalApplyDeadline: undefined,
      currentEmployeePriority: undefined,
      requisitionId: undefined,
      aiInterviewConfig: undefined,
      videoInterviewingEnabled: false,
    };
  }
  const job = backendJob;
  return {
    id: job.id || job.job_id || '',
    employerId: job.companyId || job.company_id || '',
    employerName: job.company?.name || job.companyName || job.company_name || '',
    employerLogo: job.company?.logo || job.companyLogo || job.company_logo,
    createdBy: job.createdBy || job.created_by || '',
    createdByName: job.createdByName || job.created_by_name || '',
    title: job.title || '',
    numberOfVacancies: job.numberOfVacancies || job.number_of_vacancies || 1,
    jobCode: job.jobCode || job.job_code || '',
    description: job.description || '',
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    department: job.department || '',
    location: job.location || '',
    country: job.country,
    employmentType: normalizeEmploymentType(job.employmentType || job.employment_type || 'FULL_TIME'),
    salaryMin: job.salaryMin ?? job.salary_min,
    salaryMax: job.salaryMax ?? job.salary_max,
    salaryCurrency: job.salaryCurrency || job.salary_currency || 'USD',
    salaryPeriod: job.salaryPeriod || job.salary_period || 'annual',
    salaryDescription: job.salaryDescription || job.salary_description,
    experienceLevel: job.experienceLevel || job.experience_level || 'mid',
    status: normalizeStatus(job.status || 'DRAFT'),
    visibility: job.visibility || 'public',
    stealth: job.stealth || false,
    postingDate: job.postingDate || job.posting_date
      ? (typeof (job.postingDate || job.posting_date) === 'string'
        ? (job.postingDate || job.posting_date)
        : (job.postingDate || job.posting_date).toISOString())
      : new Date().toISOString(),
    closeDate: job.closeDate || job.close_date
      ? (typeof (job.closeDate || job.close_date) === 'string'
        ? (job.closeDate || job.close_date)
        : (job.closeDate || job.close_date).toISOString())
      : undefined,
    tags: job.promotionalTags || job.promotional_tags || job.tags || [],
    workArrangement: normalizeWorkArrangement(job.workArrangement || job.work_arrangement || 'ON_SITE'),
    aiGeneratedDescription: job.aiGeneratedDescription || job.ai_generated_description || false,
    serviceType: mapHiringModeToServiceType(job.hiringMode || job.hiring_mode || job.serviceType || 'SELF_MANAGED'),
    serviceStatus: job.serviceStatus || job.service_status,
    assignedConsultantId: job.assignedConsultantId || job.assigned_consultant_id,
    assignedConsultantName: job.assignedConsultantName || job.assigned_consultant_name,
    pipeline: job.pipeline
      ? {
        stage: job.pipeline.stage,
        progress: job.pipeline.progress,
        note: job.pipeline.note,
        updatedAt: job.pipeline.updatedAt
          ? (typeof job.pipeline.updatedAt === 'string'
            ? job.pipeline.updatedAt
            : job.pipeline.updatedAt.toISOString())
          : null,
        updatedBy: job.pipeline.updatedBy,
        consultantId: job.pipeline.consultantId,
      }
      : undefined,
    jobBoardDistribution: job.jobBoardDistribution || job.job_board_distribution || ['HRM8 Job Board'],
    applicantsCount: job.applicantsCount || job.applicants_count || 0,
    unreadApplicants: job.unreadApplicants || job.unread_applicants,
    viewsCount: job.viewsCount || job.views_count || 0,
    clicksCount: job.clicksCount || job.clicks_count || 0,
    createdAt: job.createdAt || job.created_at
      ? (typeof (job.createdAt || job.created_at) === 'string'
        ? (job.createdAt || job.created_at)
        : (job.createdAt || job.created_at).toISOString())
      : new Date().toISOString(),
    updatedAt: job.updatedAt || job.updated_at
      ? (typeof (job.updatedAt || job.updated_at) === 'string'
        ? (job.updatedAt || job.updated_at)
        : (job.updatedAt || job.updated_at).toISOString())
      : new Date().toISOString(),
    hiringTeam: job.hiringTeam || job.hiring_team || [],
    applicationForm: job.applicationForm || job.application_form,
    hasJobTargetPromotion: job.hasJobTargetPromotion || job.job_target_approved,
    jobTargetBudget: job.jobTargetBudget || job.job_target_budget,
    jobTargetBudgetRemaining: job.jobTargetBudgetRemaining || job.job_target_budget_remaining,
    jobTargetPromotions: job.jobTargetPromotions || job.job_target_promotions,
    paymentId: job.paymentId || job.stripe_payment_intent_id,
    requiresPayment: job.requiresPayment,
    paymentStatus: job.paymentStatus || job.payment_status,
    serviceFee: job.serviceFee,
    termsAccepted: job.termsAccepted || job.terms_accepted,
    termsAcceptedAt: job.termsAcceptedAt || job.terms_accepted_at,
    termsAcceptedBy: job.termsAcceptedBy || job.terms_accepted_by,
    isInternal: job.isInternal,
    internalOnly: job.internalOnly,
    eligibleDepartments: job.eligibleDepartments,
    internalApplyDeadline: job.internalApplyDeadline,
    currentEmployeePriority: job.currentEmployeePriority,
    requisitionId: job.requisitionId,
    aiInterviewConfig: job.aiInterviewConfig,
    videoInterviewingEnabled: job.videoInterviewingEnabled || job.video_interviewing_enabled || false,
  };
}

/**
 * Map backend job to JobFormData for the wizard
 */
export function mapBackendJobToFormData(backendJob: any): Partial<JobFormData> {
  const normalizedJob = mapBackendJobToFrontend(backendJob);

  return {
    serviceType: normalizedJob.serviceType,
    title: normalizedJob.title,
    numberOfVacancies: normalizedJob.numberOfVacancies || 1,
    department: normalizedJob.department,
    location: normalizedJob.location,
    employmentType: normalizedJob.employmentType,
    experienceLevel: normalizedJob.experienceLevel,
    workArrangement: normalizedJob.workArrangement,
    tags: normalizedJob.tags,
    description: normalizedJob.description,
    requirements: (normalizedJob.requirements || []).map((text: string, index: number) => ({
      id: `req-${Date.now()}-${index}`,
      text,
      order: index + 1,
    })),
    responsibilities: (normalizedJob.responsibilities || []).map((text: string, index: number) => ({
      id: `resp-${Date.now()}-${index}`,
      text,
      order: index + 1,
    })),
    salaryMin: normalizedJob.salaryMin,
    salaryMax: normalizedJob.salaryMax,
    salaryCurrency: normalizedJob.salaryCurrency,
    salaryPeriod: normalizedJob.salaryPeriod || 'annual',
    salaryDescription: normalizedJob.salaryDescription,
    hideSalary: false,
    closeDate: normalizedJob.closeDate,
    visibility: normalizedJob.visibility as 'public' | 'private',
    stealth: normalizedJob.stealth,
    hiringTeam: normalizedJob.hiringTeam || [],
    applicationForm: normalizedJob.applicationForm || {
      id: `form-${Date.now()}`,
      name: "Application Form",
      questions: [],
      includeStandardFields: {
        resume: { included: true, required: true },
        coverLetter: { included: false, required: false },
        portfolio: { included: false, required: false },
        linkedIn: { included: false, required: false },
        website: { included: false, required: false },
      },
    },
    status: normalizedJob.status === 'closed' || normalizedJob.status === 'filled' || normalizedJob.status === 'on-hold'
      ? 'draft'
      : normalizedJob.status,
    jobBoardDistribution: normalizedJob.jobBoardDistribution || [],
    videoInterviewingEnabled: normalizedJob.videoInterviewingEnabled || false,
  };
}
