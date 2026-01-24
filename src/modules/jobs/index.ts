/**
 * Jobs Module
 * 
 * Public exports for the jobs module.
 * This file defines what can be imported from @/modules/jobs
 */

// Export types
export type * from './types';

// Export hooks
export * from './hooks/useDraftJob';
export * from './hooks/useEmployerJobs';
export * from './hooks/useJobCategoriesTags';
export * from './hooks/useJobPostingPermission';

// Export commonly used components
export { JobWizard } from './components/JobWizard';
export { JobEditDrawer } from './components/JobEditDrawer';
export { JobFilters } from './components/JobFilters';
export { JobsFilterBar } from './components/JobsFilterBar';
export { JobStatusBadge } from './components/JobStatusBadge';
export { EmploymentTypeBadge } from './components/EmploymentTypeBadge';
export { JobOverviewCard } from './components/JobOverviewCard';
export { JobQuickStats } from './components/JobQuickStats';
export { JobBulkActions } from './components/JobBulkActions';
export { JobLifecycleActions } from './components/JobLifecycleActions';
export { JobActivityFeed } from './components/JobActivityFeed';

// Note: Services should be imported from '@/modules/jobs/services'
// Note: Other components can be imported directly from '@/modules/jobs/components/[ComponentName]'
// when needed in specific pages or other components
