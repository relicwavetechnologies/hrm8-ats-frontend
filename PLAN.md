# Complete HRM8-ATS Extraction Plan - Detailed Breakdown

## Executive Summary

This plan details the extraction of the **Employer/HR Dashboard (ATS + HRMS)** from the monolithic `hrm8/frontend` into a standalone `hrm8-ats` application. This is a **restructuring** operation, not a rewrite - 100% of functionality will be preserved with the same routes, layouts, and backend API.

**Total Scope:**
- **~1,055+ files** will be extracted from hrm8/frontend
- **127 pages** across all modules
- **721+ components** organized into modular architecture
- **33 custom hooks** and **119+ service/utility files**
- **56 TypeScript type definition files**

---

## Source Location

**Monolithic Application:**
- Path: `/Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/hrm8/frontend`
- All extractions will come from this location

**New Application:**
- Path: `/Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/hrm8-ats`
- Clean, modular architecture

---

## Final Architecture

```
hrm8-ats/
├── src/
│   ├── app/                    # App shell (routing, providers, layouts)
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── ...
│   │   ├── providers.tsx       # All context providers
│   │   ├── routes.tsx          # Route configuration
│   │   └── App.tsx
│   │
│   ├── modules/                # 26 business modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── jobs/
│   │   ├── candidates/
│   │   ├── applications/
│   │   ├── interviews/
│   │   ├── offers/
│   │   ├── assessments/
│   │   ├── background-checks/
│   │   ├── ai-interviews/
│   │   ├── email/
│   │   ├── careers-page/
│   │   ├── import-export/
│   │   ├── employees/
│   │   ├── performance/
│   │   ├── leave/
│   │   ├── attendance/
│   │   ├── payroll/
│   │   ├── benefits/
│   │   ├── compliance/
│   │   ├── documents/
│   │   ├── onboarding/
│   │   ├── offboarding/
│   │   ├── rpo/
│   │   ├── settings/
│   │   ├── notifications/
│   │   ├── wallet/
│   │   ├── messages/
│   │   ├── dashboard/
│   │   └── analytics/
│   │
│   ├── shared/                 # Shared utilities
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components (~50 files)
│   │   │   ├── common/        # Common components (~30 files)
│   │   │   └── skeletons/     # Loading skeletons
│   │   ├── hooks/             # Shared hooks (~30 files)
│   │   ├── services/          # API client, auth service, etc.
│   │   ├── types/             # Shared TypeScript types
│   │   └── lib/               # Utilities (cn, formatDate, etc.)
│   │
│   ├── pages/                  # Route entry points (THIN)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── jobs/
│   │   ├── candidates/
│   │   ├── applications/
│   │   ├── interviews/
│   │   ├── offers/
│   │   ├── assessments/
│   │   ├── background-checks/
│   │   ├── ai-interviews/
│   │   ├── email/
│   │   ├── careers-page/
│   │   ├── import-export/
│   │   ├── employees/
│   │   ├── performance/
│   │   ├── leave/
│   │   ├── attendance/
│   │   ├── payroll/
│   │   ├── benefits/
│   │   ├── compliance/
│   │   ├── documents/
│   │   ├── onboarding/
│   │   ├── offboarding/
│   │   ├── rpo/
│   │   ├── settings/
│   │   ├── notifications/
│   │   ├── wallet/
│   │   ├── messages/
│   │   ├── dashboard/
│   │   └── analytics/
│   │
│   └── assets/                 # Static assets
│
├── public/
├── PLAN.md                     # This file
├── UPDATES.md                  # Progress tracker
├── PROJECT_STRUCTURE.md        # Architecture documentation
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example
```

---

## Module Structure Pattern

Every module follows this consistent structure:

```
modules/[module-name]/
├── components/          # UI components for this module
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── subfolder/      # Max 1 level deep
│       └── SpecializedComponent.tsx
├── hooks/              # Custom hooks for this module
│   ├── useModuleData.ts
│   └── useModuleAction.ts
├── services.ts         # API calls and business logic
├── types.ts            # TypeScript types
└── index.ts            # Public exports only
```

---

## Phase 0: Project Initialization

### Actions

1. **Create new Vite React TypeScript project**
   ```bash
   cd /Users/abhishekverma/Desktop/Cluster/Projects/hrm8-new/hrm8-ats
   pnpm create vite . --template react-swc-ts
   ```

2. **Install all dependencies** (from hrm8/frontend/package.json)
   ```json
   {
     "@dnd-kit/core": "^6.3.1",
     "@dnd-kit/sortable": "^10.0.0",
     "@fullcalendar/core": "^6.1.19",
     "@fullcalendar/daygrid": "^6.1.19",
     "@fullcalendar/react": "^6.1.19",
     "@hookform/resolvers": "^3.10.0",
     "@radix-ui/react-*": "latest",
     "@tanstack/react-query": "^5.83.0",
     "@tanstack/react-table": "^8.21.3",
     "@tiptap/react": "^3.6.6",
     "class-variance-authority": "^0.7.1",
     "clsx": "^2.1.1",
     "date-fns": "^3.6.0",
     "framer-motion": "^12.23.24",
     "lucide-react": "^0.462.0",
     "react": "^18.3.1",
     "react-dom": "^18.3.1",
     "react-helmet-async": "^2.0.5",
     "react-hook-form": "^7.61.1",
     "react-router-dom": "^6.30.1",
     "recharts": "^2.15.4",
     "sonner": "^1.7.4",
     "tailwind-merge": "^2.6.0",
     "zod": "^3.25.76",
     "zustand": "^5.0.10"
   }
   ```

3. **Setup Tailwind CSS + PostCSS**
4. **Configure TypeScript**
5. **Create complete folder structure**
6. **Create environment variables (.env.example)**

---

## Phase 1: Shared Foundation Layer

### 1.1 UI Components (~50 files)

**Source:** `hrm8/frontend/src/components/ui/`
**Destination:** `hrm8-ats/src/shared/components/ui/`

**All shadcn/ui components:**
- accordion, alert, alert-dialog, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card, carousel, chart
- checkbox, collapsible, combobox-with-add, command, context-menu
- date-range-picker, date-range-picker-v2, delete-confirmation-dialog
- dialog, drawer, dropdown-menu, empty-state, form, hover-card
- input, input-otp, label, menubar, navigation-menu, pagination
- popover, progress, radio-group, resizable, rich-text-editor
- scroll-area, select, separator, sheet, sidebar, skeleton, slider
- sonner, switch, table, tabs, textarea, timeline, toast, toaster
- toggle, tooltip, use-toast.ts
- All pill components from pills/ subdirectory

### 1.2 Common Shared Components (~30 files)

**Source:** `hrm8/frontend/src/components/common/`
**Destination:** `hrm8-ats/src/shared/components/common/`

**Categories:**
- **Authentication:** AuthGuard, ProtectedRoutes, AnyAuthRedirectGate, RoleIsolationGate, ModuleAccessGuard
- **Permissions:** PermissionGate, PermissionGateWithModules, ModuleAccessBadge
- **Search & Navigation:** GlobalSearch, SearchInput, Breadcrumbs, CommandPalette, LocationSelect
- **Forms:** FormWizard, FormBuilder, AdvancedSearchBuilder, PhoneCountrySelect
- **Export:** ExportButton, ExportDialog, ExportPreviewDialog, ExportTemplateDialog, ExportTemplateManager
- **UI Features:** PageHeader, FilterDropdown, ThemeToggle, CurrencyFormatToggle
- **Utilities:** ErrorBoundary, ScrollToTop, DraftRestoreAlert, FeatureLockedCard

### 1.3 Layout Components (~34 files)

**Source:** `hrm8/frontend/src/components/layouts/`
**Destination:** `hrm8-ats/src/app/layouts/`

**Files to extract:**
- DashboardLayout.tsx, DashboardPageLayout.tsx, DashboardHeader.tsx
- AppSidebar.tsx, SidebarFooterContent.tsx, UnifiedSidebar.tsx, UnifiedSidebarFooter.tsx
- HeaderQuickActions.tsx, NotificationsDropdown.tsx, UserNav.tsx
- AtsPageHeader.tsx, DashboardShell.tsx

**Exclude:**
- CandidateLayout, ConsultantLayout, Hrm8Layout, SalesLayout

### 1.4 Skeleton Components

**Source:** `hrm8/frontend/src/components/skeletons/`
**Destination:** `hrm8-ats/src/shared/components/skeletons/`

**Extract all skeleton loader components.**

### 1.5 Contexts & Providers

**Source:** `hrm8/frontend/src/contexts/`
**Destination:** `hrm8-ats/src/app/providers.tsx` (consolidated)

**Files to consolidate:**
- AuthContext.tsx (will be refactored into useAuth hook)
- CurrencyFormatContext.tsx
- WebSocketContext.tsx

**Exclude:**
- CandidateAuthContext, ConsultantAuthContext, Hrm8AuthContext

### 1.6 Shared Hooks (~30 files)

**Source:** `hrm8/frontend/src/hooks/`
**Destination:** `hrm8-ats/src/shared/hooks/`

**Categories:**
- **Utilities:** use-debounce, use-mobile, useMediaQuery, useKeyboardShortcuts, useColumnResize
- **Form:** use-form-analytics, use-form-autosave
- **State:** useDashboardLayout, useCurrentDashboard, useSidebarState, useSidebarSections
- **Auth & Access:** useAuthAdapter, useRBAC, useRole, useModuleAccess, usePermissions
- **Data:** useRecentRecords
- **Notifications:** useNotifications, useUniversalNotifications, useNotificationPreferences, useToast, useNotification, useActivityNotifications
- **Company:** useCompanyProfile
- **Wallet:** useWallet, useWalletBalance, useStripeIntegration

### 1.7 Utilities & Services

**Source:** `hrm8/frontend/src/lib/`
**Destination:** `hrm8-ats/src/shared/lib/` & `hrm8-ats/src/shared/services/`

**Files:**
- utils.ts, constants.ts
- api.ts, authService.ts, notificationService.ts, messagingService.ts

### 1.8 Shared Types

**Source:** `hrm8/frontend/src/types/`
**Destination:** `hrm8-ats/src/shared/types/`

**Files (shared/common types only):**
- user.ts, entities.ts, dashboard.ts
- notification.ts, notificationPreferences.ts
- rbac.ts, audit.ts, websocket.ts
- company.ts, companyProfile.ts, skills.ts
- filterPreset.ts, statusHistory.ts, teamAssignment.ts
- billing.ts, pricing.ts, expense.ts

---

## Phase 2: Authentication Module

### Structure
```
modules/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   └── AuthGuard.tsx
├── hooks/
│   └── useAuth.ts
├── services.ts
├── types.ts
└── index.ts
```

### Pages (5 files)
**Source:** `hrm8/frontend/src/pages/`
**Destination:** `hrm8-ats/src/pages/`
- Login.tsx → LoginPage.tsx
- Register.tsx → RegisterPage.tsx
- ForgotPassword.tsx → ForgotPasswordPage.tsx
- ResetPassword.tsx → ResetPasswordPage.tsx
- VerifyEmail.tsx → VerifyEmailPage.tsx

---

## Phase 3: Dashboard Module (~130 files)

### Pages (15 files)
**Source:** `hrm8/frontend/src/pages/`
**Destination:** `hrm8-ats/src/pages/dashboard/`
- Dashboard.tsx → HomePage.tsx
- OverviewDashboardPage.tsx → OverviewPage.tsx
- HRMSDashboardPage.tsx → HRMSPage.tsx
- AdvancedAnalytics.tsx → AdvancedAnalyticsPage.tsx
- HRAnalytics.tsx → HRAnalyticsPage.tsx
- Analytics.tsx → AnalyticsPage.tsx

**From:** `hrm8/frontend/src/pages/dashboard/`
- AddonsDashboard.tsx → AddonsPage.tsx
- AssessmentsDashboard.tsx → AssessmentsPage.tsx
- BackgroundChecksDashboard.tsx → BackgroundChecksPage.tsx

**From:** `hrm8/frontend/src/pages/ats/`
- JobsDashboard.tsx → JobsPage.tsx
- CandidatesDashboard.tsx → CandidatesPage.tsx
- ApplicationAnalyticsDashboard.tsx → ApplicationsPage.tsx
- RecruiterAnalyticsDashboard.tsx → RecruiterPage.tsx

### Components (~112 files)
**Source:** `hrm8/frontend/src/components/dashboard/`
**Destination:** `hrm8-ats/src/modules/dashboard/components/`

**All dashboard components including:**
- Core: DashboardGrid, DashboardSelector, DashboardActionBar, DashboardFilterDialog
- Widgets: 20+ widget components (StatCard, ActivityCard, ModuleCard, etc.)
- Charts: 40+ chart components for various analytics
- Controls: Edit mode, layout controls, filters
- Addons: Customer health, churn tracking, revenue forecasting (14 components)

---

## Phase 4: ATS Modules (~523 files)

### 4.1 Jobs Module (~130 files)

**Structure:**
```
modules/jobs/
├── components/          # 100+ components
│   ├── JobWizard.tsx
│   ├── JobEditDrawer.tsx
│   ├── JobFilters.tsx
│   ├── aiInterview/
│   ├── candidate-assessment/
│   ├── templates/
│   ├── history/
│   ├── automation/
│   ├── filters/
│   ├── matching/
│   ├── collaboration/
│   ├── budget/
│   ├── bulk/
│   └── analytics/
├── hooks/
│   ├── useDraftJob.ts
│   ├── useEmployerJobs.ts
│   ├── useJobCategoriesTags.ts
│   └── useJobPostingPermission.ts
├── services.ts         # Consolidate 15+ service files
├── types.ts
└── index.ts
```

**Pages (10 files):**
- Jobs.tsx → JobsPage.tsx
- JobCreate.tsx → CreatePage.tsx
- JobEdit.tsx → EditPage.tsx
- JobDetail.tsx → DetailPage.tsx
- JobsDashboard.tsx → DashboardPage.tsx
- JobTemplates.tsx → TemplatesPage.tsx
- JobAnalytics.tsx → AnalyticsPage.tsx
- JobAutomationSettings.tsx → AutomationPage.tsx
- InternalJobs.tsx → InternalPage.tsx

### 4.2 Candidates Module (~58 files)

**Structure:**
```
modules/candidates/
├── components/          # 48 components
│   ├── CandidateDetailView.tsx
│   ├── CandidateFormWizard.tsx
│   ├── CandidateCard.tsx
│   ├── CandidatePipelineBoard.tsx
│   ├── DocumentUploader.tsx
│   ├── ResumeAnnotator.tsx
│   └── ... (tabs, search, bulk, advanced)
├── hooks/
│   ├── useCandidateComparison.ts
│   ├── useCandidateFormDraft.ts
│   ├── useCandidatePresence.ts
│   └── useResumeAnnotations.ts
├── services.ts
├── types.ts
└── index.ts
```

**Pages (2 files):**
- Candidates.tsx → CandidatesPage.tsx
- CandidatesDashboard.tsx → DashboardPage.tsx

### 4.3 Applications Module (~82 files)

**Structure:**
```
modules/applications/
├── components/          # 65+ components
│   ├── ApplicationCard.tsx
│   ├── ApplicationDetailPanel.tsx
│   ├── ApplicationReviewPanel.tsx
│   ├── screening/
│   ├── parsing/
│   ├── analytics/
│   ├── shortlisting/
│   └── stages/
├── hooks/
│   └── (use React Query directly)
├── services.ts         # Consolidate 10+ services
├── types.ts
└── index.ts
```

**Pages (5 files):**
- Applications.tsx → ApplicationsPage.tsx
- ApplicationDetail.tsx → DetailPage.tsx
- ApplicationAnalyticsDashboard.tsx → AnalyticsPage.tsx
- JobApplications.tsx → JobApplicationsPage.tsx

### 4.4 Interviews Module (~36 files)

**Pages (2 files):**
- Interviews.tsx → InterviewsPage.tsx
- InterviewScheduling.tsx → SchedulingPage.tsx

**Components (27 files):**
- InterviewList, InterviewDetailPanel
- InterviewCalendar, InterviewScheduler
- InterviewKanbanBoard
- InterviewFeedbackForm
- InterviewTemplateManager
- CalibrationSessionManager

### 4.5 Offers Module (~8 files)

**Pages (2 files):**
- Offers.tsx → OffersPage.tsx
- OfferManagement.tsx → ManagementPage.tsx

**Components (3 files):**
- CreateOfferDialog
- OfferForm
- OfferApprovalFlow

### 4.6 Assessments Module (~44 files)

**Pages (9 files):**
- Assessments.tsx → AssessmentsPage.tsx
- AssessmentDetail.tsx → DetailPage.tsx
- AssessmentTemplates.tsx → TemplatesPage.tsx
- AssessmentPreview.tsx → PreviewPage.tsx
- AssessmentAnalytics.tsx → AnalyticsPage.tsx
- AssessmentComparisonPage.tsx → ComparisonPage.tsx
- ScheduledAssessments.tsx → ScheduledPage.tsx
- QuestionnaireBuilder.tsx → BuilderPage.tsx
- QuestionBank.tsx → QuestionBankPage.tsx

**Components (21 files):**
- AssessmentInvitationWizard
- AssessmentCollaboration
- QuestionBankDialog
- ScheduleAssessmentDialog
- TemplateBuilderDialog
- questionnaire-builder/ subfolder components

### 4.7 Background Checks Module (~100 files)

**Pages (6 files):**
- BackgroundChecks.tsx → BackgroundChecksPage.tsx
- BackgroundCheckDetail.tsx → DetailPage.tsx
- BackgroundChecksAnalytics.tsx → AnalyticsPage.tsx
- DigestSettingsPage.tsx
- EscalationRulesPage.tsx
- SLASettingsPage.tsx

**Components (55+ files):**
- Core components
- Analytics (13 files)
- Results (7 files)
- AI Interview (13 files)
- Consent (2 files)
- References (5 files)
- Widgets (8 files)
- Wizard (6 files)

**Services:**
- Consolidate 35 service files from lib/backgroundChecks/

### 4.8 AI Interviews Module (~46 files)

**Pages (6 files):**
- AIInterviews.tsx → AIInterviewsPage.tsx
- AIInterviewDetail.tsx → DetailPage.tsx
- AIInterviewSession.tsx → SessionPage.tsx
- AIInterviewReports.tsx → ReportsPage.tsx
- AIInterviewReportDetail.tsx → ReportDetailPage.tsx
- AIInterviewAnalytics.tsx → AnalyticsPage.tsx

**Components (24 files):**
- AI interview wizard, calendar, analysis
- Dashboard, session interface

**Services:**
- Consolidate 12 files from lib/aiInterview/

### 4.9 Email Module (~19 files)

**Pages (2 files):**
- EmailCenter.tsx → EmailCenterPage.tsx
- EmailTemplates.tsx → TemplatesPage.tsx

**Components (8 files):**
- DraftEmailsList, EmailAnalytics, EmailDetailDialog
- EmailEventTimeline, EmailFilters, EmailLogsList
- ScheduleEmailDialog, ScheduledEmailsList

### 4.10 Careers Page Module

**Pages (1 file):**
- CareersPageAdmin.tsx → AdminPage.tsx

### 4.11 Import/Export Module

**Pages (1 file):**
- ImportExport.tsx → ImportExportPage.tsx

---

## Phase 5: HRMS Modules (~246 files)

### 5.1 Employees Module (~33 files)

**Pages (5 files):**
- HRMS.tsx → EmployeesPage.tsx
- EmployeeCreate.tsx → CreatePage.tsx
- EmployeeDetail.tsx → DetailPage.tsx
- EmployeeSelfService.tsx → SelfServicePage.tsx
- EmployeeRelations.tsx → RelationsPage.tsx

**Components (20+ files):**
- EmployeeFormDialog, EmployeeStatusBadge
- BulkEditDialog, BulkImportDialog
- EmployeeDocuments, EmployeeHistory
- EmployeeTableColumns, EmployeesFilterBar

### 5.2 Performance Module (~147 files)

**Pages (12 files):**
- Performance.tsx → PerformancePage.tsx
- PerformanceDashboard.tsx → DashboardPage.tsx
- GoalCreate/Detail, ReviewCreate/Detail
- CollaborativeFeedback, FeedbackDashboard
- FeedbackDetail, FeedbackRequestCreate

**Components (56 files from performance/ + 56 from feedback/):**
- Goals: GoalCard, GoalFormDialog, GoalsOverview, GoalAlignmentView
- Reviews: ReviewCard, ReviewTemplateBuilder, ReviewsOverview
- Feedback360: Feedback360Card, Feedback360Overview, Feedback360Results
- Learning: LearningDevelopment, AILearningRecommendations
- Calibration: CalibrationOverview, CalibrationSessionManager
- Analytics: Multiple analytics dashboards
- Collaboration: TeamConsensusView, TeamVoting, CommentThreads

**Hooks (12 files):**
- useFeedbackPresence, useFeedbackStats, useReportComments
- useLiveActivityFeed, useRealtimeFeedback, useVoting
- useCollaborativeEditor, useCursorTracking, useTypingIndicator
- useConflictDetection, useVersionHistory

### 5.3 Leave Module (~13 files)

**Pages (3 files):**
- LeaveManagement.tsx → LeaveManagementPage.tsx
- LeaveRequestCreate.tsx → CreatePage.tsx
- AccrualPolicies.tsx → AccrualPoliciesPage.tsx

**Components (8 files):**
- LeaveRequestDialog, LeaveRequestDetailDialog
- LeaveApprovalWorkflow, LeaveStatusBadge
- LeaveBalanceCard, LeaveCalendar

### 5.4 Attendance Module (~13 files)

**Pages (2 files):**
- TimeAttendance.tsx → AttendancePage.tsx
- Calendar.tsx → CalendarPage.tsx

**Components (10 files):**
- ClockInOut, ManualAttendanceDialog
- AttendanceDetailDialog, AttendanceReports
- ShiftManagement, TimesheetView
- OvertimeManagement, OvertimeRequestDialog

### 5.5 Payroll Module (~7 files)

**Pages (3 files):**
- Payroll.tsx → PayrollPage.tsx
- Compensation.tsx → CompensationPage.tsx
- CompensationManagement.tsx → ManagementPage.tsx

**Components (2 files):**
- PayrollRunDialog
- PayslipDetailDialog

### 5.6 Benefits Module (~8 files)

**Pages (2 files):**
- Benefits.tsx → BenefitsPage.tsx
- BenefitsAdmin.tsx → AdminPage.tsx

**Components (4 files):**
- BenefitEnrollmentDialog
- EnrollmentPeriodDialog
- LifeEventDialog
- COBRADialog

### 5.7 Compliance Module (~5 files)

**Pages (1 file):**
- Compliance.tsx → CompliancePage.tsx

**Components (2 files):**
- PolicyDialog
- DataSubjectRequestDialog

### 5.8 Documents Module (~3 files)

**Pages (1 file):**
- Documents.tsx → DocumentsPage.tsx

**Components (1 file):**
- DocumentUploadDialog

### 5.9 Onboarding Module (~10 files)

**Pages (2 files):**
- OnboardingWizard.tsx → WizardPage.tsx
- OnboardingOffboardingDashboard.tsx → DashboardPage.tsx

**Components (7 files):**
- OnboardingReminderBanner
- OnboardingBulkActions
- ScheduledEmailsView
- EmailAnalyticsDashboard

### 5.10 Offboarding Module (~7 files)

**Pages (2 files):**
- Offboarding.tsx → OffboardingPage.tsx
- OffboardingDetail.tsx → DetailPage.tsx

**Components (4 files):**
- OffboardingChecklistDialog
- OffboardingTimeline
- ClearanceChecklist
- ExitInterviewForm

---

## Phase 6: System & Settings Modules

### 6.1 Settings Module (~38 files)

**Pages (10+ files):**
- Settings.tsx → SettingsPage.tsx
- AdminSettings.tsx → AdminSettingsPage.tsx
- CompanyProfile.tsx → CompanyProfilePage.tsx
- UserProfile.tsx → UserProfilePage.tsx
- Users.tsx → UsersPage.tsx
- RoleManagement.tsx → RoleManagementPage.tsx
- Integrations.tsx → IntegrationsPage.tsx
- SupportTickets.tsx → SupportTicketsPage.tsx
- SystemMonitoring.tsx → SystemMonitoringPage.tsx
- NotificationPreferences.tsx → NotificationPreferencesPage.tsx

### 6.2 Notifications Module (~23 files)

**Pages (5 files):**
- NotificationCenter.tsx → CenterPage.tsx
- NotificationsPage.tsx → NotificationsPage.tsx
- NotificationDetailPage.tsx → DetailPage.tsx

**Components (11 files):**
- NotificationBell, NotificationCenter, UnifiedNotificationCenter
- NotificationDropdown, NotificationDetailModal
- NotificationAnalytics, PriorityAlerts

### 6.3 Wallet Module (~14 files)

**Components (12 files):**
- WalletBalance, WalletRechargeDialog, WithdrawalDialog
- RefundDialog, InsufficientBalanceModal
- ConsultantEarningsDashboard, AdminWalletDashboard
- TransactionList, SubscriptionManagementPage

---

## Phase 7: RPO Module (~47 files)

**Pages (12 files):**
- RPOManagementPage.tsx → ManagementPage.tsx
- RPOOverviewPage.tsx → OverviewPage.tsx
- RPOPerformancePage.tsx → PerformancePage.tsx
- RPOContractsPage.tsx → ContractsPage.tsx
- RPOConsultantsPage.tsx → ConsultantsPage.tsx
- RPOForecastPage.tsx → ForecastPage.tsx
- RPORenewalsPage.tsx → RenewalsPage.tsx
- RPOTasksPage.tsx → TasksPage.tsx
- RPODashboardPage.tsx → DashboardPage.tsx
- RecruitmentServices.tsx → ServicesPage.tsx

**Components (30 files):**
- Contracts: RPOContractsFilterBar, RPOContractsList, RPOContractHealthScoring
- Consultants: RPOConsultantAvailabilityTracker, RPOConsultantSkillMatrix
- Analytics: RPOAnalyticsDashboard, RPOPerformanceDashboard
- SLA: RPOSLATracker, RPOSLAAlerts, RPOSLAForecasting
- Planning: RPOPlacementPipeline, RPORevenueForecastChart

---

## Phase 8: Additional Modules

### 8.1 Analytics Module
- Reports.tsx → ReportsPage.tsx
- Various analytics components

### 8.2 Messages Module (~9 files)
- MessagesPage.tsx
- ConversationPage.tsx
- Inbox.tsx → InboxPage.tsx
- Message components

---

## Phase 9: Routes Configuration

**Source:** `hrm8/frontend/src/routes/`
**Destination:** `hrm8-ats/src/app/routes.tsx`

**Consolidate these route files:**
- ats.routes.tsx
- hrms.routes.tsx
- rpo.routes.tsx
- dashboard.routes.tsx
- shared.routes.tsx
- employer.routes.tsx

**Exclude:**
- candidate.routes.tsx
- consultant.routes.tsx
- consultant360.routes.tsx
- hrm8.routes.tsx
- sales.routes.tsx

---

## What Gets EXCLUDED

### Portals (Separate Apps)

1. **Candidate Portal** - All pages/components in candidate/
2. **Consultant Portal** - All pages/components in consultants/
3. **HRM8 Super Admin** - All pages/components in hrm8/
4. **Sales Agent** - All pages/components in sales/

---

## Environment Variables

```env
# .env.example
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=HRM8 ATS
VITE_WS_URL=ws://localhost:3000
```

**Same backend API** - No backend changes required.

---

## Verification Checklist

### Build Verification
- [ ] `pnpm install` completes without errors
- [ ] `pnpm tsc --noEmit` passes (no TypeScript errors)
- [ ] `pnpm build` completes successfully
- [ ] `pnpm lint` passes

### Route Verification
- [ ] `/login` - Login page
- [ ] `/` - Home/Dashboard
- [ ] `/jobs` - Jobs listing
- [ ] `/candidates` - Candidates listing
- [ ] `/applications` - Applications listing
- [ ] `/interviews` - Interviews listing
- [ ] All ATS routes work
- [ ] All HRMS routes work
- [ ] All RPO routes work
- [ ] All settings routes work

### Feature Verification
- [ ] Authentication flow works
- [ ] Job creation wizard works
- [ ] Application review flow works
- [ ] Interview scheduling works
- [ ] Assessment creation works
- [ ] Employee management works
- [ ] Performance reviews work
- [ ] Dashboard loads data
- [ ] Real-time updates work

---

## Success Criteria

✅ **The extraction is successful when:**

1. All 127 pages render without errors
2. All routes work correctly
3. Authentication flow works end-to-end
4. All major features are functional
5. TypeScript compilation passes
6. Production build succeeds
7. Same backend API works without modification
8. No console errors during usage
9. All real-time features work

---

## File Count Summary

| Category | Count |
|----------|-------|
| **Total Files** | ~1,055 |
| **Pages** | 127 |
| **Components** | 721+ |
| **Hooks** | 33 |
| **Services** | 119+ |
| **Types** | 56 |

---

## Module Breakdown

| Module | Files |
|--------|-------|
| Jobs | ~130 |
| Candidates | ~58 |
| Applications | ~82 |
| Interviews | ~36 |
| Offers | ~8 |
| Assessments | ~44 |
| Background Checks | ~100 |
| AI Interviews | ~46 |
| Email | ~19 |
| Employees | ~33 |
| Performance | ~147 |
| Leave | ~13 |
| Attendance | ~13 |
| Payroll | ~7 |
| Benefits | ~8 |
| Compliance | ~5 |
| Documents | ~3 |
| Onboarding | ~10 |
| Offboarding | ~7 |
| RPO | ~47 |
| Dashboard | ~142 |
| Settings | ~38 |
| Notifications | ~23 |
| Wallet | ~14 |
| Messages | ~9 |
| Auth | ~13 |
| **TOTAL** | **~1,055** |

---

## Migration Strategy

### For Each Module:

1. **Create folder structure**
2. **Copy types first**
3. **Copy and consolidate services**
4. **Copy components** (update imports)
5. **Copy and refactor hooks**
6. **Create module index.ts**
7. **Copy pages** (keep thin, composition only)
8. **Test the module**

### Import Path Patterns:

```typescript
// UI components
import { Button } from '@/shared/components/ui'

// Common components
import { PageHeader } from '@/shared/components/common'

// Module components
import { JobCard, useJobs } from '@/modules/jobs'

// Local services
import { jobsApi } from '../services'

// Shared types
import type { User } from '@/shared/types'
```

---

**Last Updated:** 2026-01-23
**Status:** Ready for implementation
**AI Assistant:** Can continue from UPDATES.md if session expires
