
/**
 * Application Module Services
 */

// Export Types
export type {
  SubmitApplicationRequest,
  Application,
} from './lib/applicationService';
export type {
  TalentPoolCandidate
} from './lib/talentPoolService';
export type {
  UploadFileResponse
} from './lib/applicationUploadService';
export type {
  TimeToHireMetrics,
  ConversionRateMetrics,
  SourceEffectiveness,
  RecruiterPerformance
} from './lib/applicationAnalyticsService';

// Re-export services
export { applicationService } from './lib/applicationService';
export { talentPoolService } from './lib/talentPoolService';
export { applicationUploadService } from './lib/applicationUploadService';

// Re-export utils
export {
  questionTypeIcons,
  questionTypeLabels,
  getQuestionTypeLabel,
  getQuestionTypeIcon,
  getDefaultValidation,
  needsOptions,
  reorderQuestions
} from './lib/applicationUtils';

export {
  getApplications,
  updateApplication
} from './lib/mockApplicationStorage';

// Re-export review & analytics
export * from './lib/applicationReviewService';
export * from './lib/applicationAnalyticsService';

import { PREDEFINED_TAGS, PredefinedTag } from './lib/applicationTags';
import {
  getAllTags,
  addTagToApplication,
  removeTagFromApplication,
  bulkAddTags,
  bulkRemoveTags,
  filterApplicationsByTags,
  getTagColor
} from './lib/applicationTags';

export {
  PREDEFINED_TAGS,
  type PredefinedTag,
  getAllTags,
  addTagToApplication,
  removeTagFromApplication,
  bulkAddTags,
  bulkRemoveTags,
  filterApplicationsByTags,
  getTagColor
};

import {
  getApplicationStageLabel,
  getApplicationStatusColor,
  canMoveToStage,
  calculateDaysInStage,
  getNextStage,
  getStageColor,
  groupApplicationsByJob,
  getApplicationTimeline,
  getApplicationsByStatus,
  calculateAverageTimeInStage,
  type GroupedApplications,
  type TimelineEvent
} from './lib/applicationHelpers';

export {
  getApplicationStageLabel,
  getApplicationStatusColor,
  canMoveToStage,
  calculateDaysInStage,
  getNextStage,
  getStageColor,
  groupApplicationsByJob,
  getApplicationTimeline,
  getApplicationsByStatus,
  calculateAverageTimeInStage,
  type GroupedApplications,
  type TimelineEvent
};

export interface BulkScoringProgress {
  total: number;
  completed: number;
  failed: number;
  currentCandidate?: string;
}

// TODO: Extract Remaining Types/Interfaces to dedicated files if needed, 
// currently we are just re-exporting the split files.
