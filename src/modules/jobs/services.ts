/**
 * Job Services
 * Re-exports all job-related services
 */

// Public Job Service
export * from './lib/jobService';
// Note: default export jobService from above is the PUBLIC service. 
// If you need the Admin/Employer service, use apiJobService (aliased as administrativeJobService below) or import directly.

// Admin/API Job Service
export { apiJobService, apiJobService as administrativeJobService } from './lib/apiJobService';
export type {
  CreateJobRequest as AdminCreateJobRequest,
  UpdateJobRequest as AdminUpdateJobRequest,
  GetJobsFilters as AdminGetJobsFilters
} from './lib/apiJobService';

// Template Services
// Export mock functions and types
export * from './lib/jobTemplateService';
// Export API service
export { apiJobTemplateService } from './lib/apiJobTemplateService';
export type {
  CreateTemplateRequest as ApiCreateTemplateRequest,
  UpdateTemplateRequest as ApiUpdateTemplateRequest
} from './lib/apiJobTemplateService';

// Other Services
export * from './lib/jobAnalyticsService';
export * from './lib/jobAutomationService';
export * from './lib/jobBudgetService';
export * from './lib/jobCollaborationService';
export * from './lib/jobDataMapper';
export * from './lib/jobFormTransformers';
export * from './lib/jobUtils';
export * from './lib/jobVersioningService';
export * from './lib/jobRoundService';
export * from './lib/jobDescriptionService';
export * from './lib/employerJobService';
