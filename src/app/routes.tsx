/**
 * Application Routes Configuration
 * Defines all routes for the HRM8-ATS application
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { AuthGuard } from '@/shared/components/common/AuthGuard';
import { Loader2 } from 'lucide-react';

// Loading component - only shows in content area, not full screen
const PageLoader = () => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyCompanyPage from '@/pages/auth/VerifyCompanyPage';
import SignupPage from '@/pages/auth/SignupPage';

// Dev Pages

// Lazy load module pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const JobsPage = lazy(() => import('@/pages/jobs/Jobs'));
const JobTemplatesPage = lazy(() => import('@/pages/jobs/JobTemplates'));
const JobDetailPage = lazy(() => import('@/pages/jobs/JobDetail'));
const CandidatesPage = lazy(() => import('@/pages/candidates/Candidates'));
const TasksPage = lazy(() => import('@/pages/tasks/Tasks'));
const ApplicationsPage = lazy(() => import('@/pages/applications/Applications'));
const InterviewsPage = lazy(() => import('@/pages/interviews/Interviews'));
const AiInterviewsPage = lazy(() => import('@/pages/ai-interviews/AIInterviews'));
const AiInterviewAnalyticsPage = lazy(() => import('@/pages/ai-interviews/AIInterviewAnalytics'));
const AiInterviewDetailPage = lazy(() => import('@/pages/ai-interviews/AIInterviewDetail'));
const AiInterviewReportsPage = lazy(() => import('@/pages/ai-interviews/AIInterviewReports'));
const AiInterviewSessionPage = lazy(() => import('@/pages/ai-interviews/AIInterviewSession'));
const OffersPage = lazy(() => import('@/pages/offers/Offers'));
const HiredPage = lazy(() => import('@/pages/offers/Hired'));
const RequisitionsPage = lazy(() => import('@/pages/requisitions/Requisitions'));
const RequisitionDetailPage = lazy(() => import('@/pages/requisitions/RequisitionDetail'));
const AssessmentsPage = lazy(() => import('@/pages/assessments/Assessments'));
const CandidateAssessmentSessionPage = lazy(() => import('@/pages/assessments/CandidateAssessmentSession'));
const AssessmentTemplatesPage = lazy(() => import('@/pages/assessments/AssessmentTemplates'));
const QuestionBankPage = lazy(() => import('@/pages/assessments/QuestionBank'));
const AssessmentAnalyticsPage = lazy(() => import('@/pages/assessments/AssessmentAnalytics'));
const BackgroundChecksPage = lazy(() => import('@/pages/background-checks/BackgroundChecks'));
const EmployeesPage = lazy(() => import('@/pages/employees/HRMS'));
const PerformancePage = lazy(() => import('@/pages/performance/Performance'));
const CollaborativeFeedbackPage = lazy(() => import('@/pages/performance/CollaborativeFeedback'));
const LeaveManagementPage = lazy(() => import('@/pages/leave/LeaveManagement'));
const TimeAttendancePage = lazy(() => import('@/pages/attendance/TimeAttendance'));
const PayrollPage = lazy(() => import('@/pages/payroll/Payroll'));
const BenefitsPage = lazy(() => import('@/pages/benefits/Benefits'));
const CompensationPage = lazy(() => import('@/pages/payroll/Compensation'));
const DocumentsPage = lazy(() => import('@/pages/documents/Documents'));
const OffboardingPage = lazy(() => import('@/pages/offboarding/Offboarding'));
const EmployeeSelfServicePage = lazy(() => import('@/pages/employees/EmployeeSelfService'));
const CompliancePage = lazy(() => import('@/pages/compliance/Compliance'));
const EmployeeRelationsPage = lazy(() => import('@/pages/employees/EmployeeRelations'));
const RoleManagementPage = lazy(() => import('@/pages/settings/RoleManagement'));
const AccrualPoliciesPage = lazy(() => import('@/pages/leave/AccrualPolicies'));
const BenefitsAdminPage = lazy(() => import('@/pages/benefits/BenefitsAdmin'));
const UsersPage = lazy(() => import('@/pages/settings/Users'));
const IntegrationsPage = lazy(() => import('@/pages/settings/Integrations'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
const AdvancedAnalyticsPage = lazy(() => import('@/pages/AdvancedAnalytics'));
const CalendarPage = lazy(() => import('@/pages/attendance/Calendar'));
const InternalJobsPage = lazy(() => import('@/pages/jobs/InternalPage'));
const RecruitmentIntegrationPage = lazy(() => import('@/pages/rpo/RecruitmentIntegration'));
const DashboardOverviewPage = lazy(() => import('@/pages/OverviewDashboardPage'));
const FinancePage = lazy(() => import('@/pages/finance/Finance'));
const ReportsPage = lazy(() => import('@/pages/reports/Reports'));
const TalentDevelopmentPage = lazy(() => import('@/pages/talent-development/TalentDevelopment'));
const WorkforcePlanningPage = lazy(() => import('@/pages/workforce-planning/WorkforcePlanning'));
const EnhancedLearningPage = lazy(() => import('@/pages/learning/EnhancedLearning'));
const ImportExportPage = lazy(() => import('@/pages/import-export/ImportExport'));
const ExpensesPage = lazy(() => import('@/pages/expenses/Expenses'));
const SettingsPage = lazy(() => import('@/pages/settings/Settings'));
const EmailTemplatesPage = lazy(() => import('@/pages/email/EmailTemplates'));
const InboxPage = lazy(() => import('@/pages/Inbox'));
const CompanyProfilePage = lazy(() => import('@/pages/settings/CompanyProfile'));
const AdminSettingsPage = lazy(() => import('@/pages/settings/AdminSettings'));
const SupportTicketsPage = lazy(() => import('@/pages/settings/SupportTickets'));
const SystemMonitoringPage = lazy(() => import('@/pages/settings/SystemMonitoring'));
const CareersPageAdmin = lazy(() => import('@/pages/ats/CareersPageAdmin'));
const NotificationPreferencesPage = lazy(() => import('@/pages/settings/NotificationPreferences'));
const NotificationCenterPage = lazy(() => import('@/pages/notifications/NotificationCenterPage'));
const NotificationDetailPage = lazy(() => import('@/pages/notifications/NotificationDetailPage'));
const SubscriptionsPage = lazy(() => import('@/modules/wallet/components/SubscriptionManagementPage').then(m => ({ default: m.SubscriptionManagementPage })));

export function AppRoutes() {
    return (
        <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-company" element={<VerifyCompanyPage />} />

            {/* Dev/Mock Routes */}

            {/* Public Assessment Route */}
            <Route path="/assessment/:token" element={
                <Suspense fallback={<PageLoader />}>
                    <CandidateAssessmentSessionPage />
                </Suspense>
            } />

            {/* Protected Routes */}
            <Route
                element={
                    <AuthGuard>
                        <DashboardLayout />
                    </AuthGuard>
                }
            >
                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={
                    <Suspense fallback={<PageLoader />}>
                        <HomePage />
                    </Suspense>
                } />

                {/* Dashboard Routes */}
                <Route path="/dashboard/overview" element={
                    <Suspense fallback={<PageLoader />}>
                        <DashboardOverviewPage />
                    </Suspense>
                } />

                {/* ATS Routes */}
                <Route path="/ats/jobs" element={
                    <Suspense fallback={<PageLoader />}>
                        <JobsPage />
                    </Suspense>
                } />
                <Route path="/ats/jobs/:jobId/managed-recruitment-checkout" element={
                    <Suspense fallback={<PageLoader />}>
                        <JobsPage />
                    </Suspense>
                } />
                <Route path="/ats/job-templates" element={
                    <Suspense fallback={<PageLoader />}>
                        <JobTemplatesPage />
                    </Suspense>
                } />
                <Route path="/ats/jobs/:jobId" element={
                    <Suspense fallback={<PageLoader />}>
                        <JobDetailPage />
                    </Suspense>
                } />
                <Route path="/jobs/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <JobsPage />
                    </Suspense>
                } />

                <Route path="/candidates/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <CandidatesPage />
                    </Suspense>
                } />

                <Route path="/tasks/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <TasksPage />
                    </Suspense>
                } />

                <Route path="/applications/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <ApplicationsPage />
                    </Suspense>
                } />

                <Route path="/interviews/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <InterviewsPage />
                    </Suspense>
                } />
                <Route path="/collaborative-feedback" element={
                    <Suspense fallback={<PageLoader />}>
                        <CollaborativeFeedbackPage />
                    </Suspense>
                } />

                <Route path="/offers" element={
                    <Suspense fallback={<PageLoader />}>
                        <OffersPage />
                    </Suspense>
                } />
                <Route path="/offers/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <OffersPage />
                    </Suspense>
                } />
                <Route path="/hired" element={
                    <Suspense fallback={<PageLoader />}>
                        <HiredPage />
                    </Suspense>
                } />
                <Route path="/hired/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <HiredPage />
                    </Suspense>
                } />

                <Route path="/assessments/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <AssessmentsPage />
                    </Suspense>
                } />
                <Route path="/assessment-templates" element={
                    <Suspense fallback={<PageLoader />}>
                        <AssessmentTemplatesPage />
                    </Suspense>
                } />
                <Route path="/question-bank" element={
                    <Suspense fallback={<PageLoader />}>
                        <QuestionBankPage />
                    </Suspense>
                } />
                <Route path="/assessment-analytics" element={
                    <Suspense fallback={<PageLoader />}>
                        <AssessmentAnalyticsPage />
                    </Suspense>
                } />

                <Route path="/ai-interviews" element={
                    <Suspense fallback={<PageLoader />}>
                        <AiInterviewsPage />
                    </Suspense>
                } />
                <Route path="/ai-interviews/analytics" element={
                    <Suspense fallback={<PageLoader />}>
                        <AiInterviewAnalyticsPage />
                    </Suspense>
                } />
                <Route path="/ai-interviews/reports" element={
                    <Suspense fallback={<PageLoader />}>
                        <AiInterviewReportsPage />
                    </Suspense>
                } />
                <Route path="/ai-interviews/session/:token" element={
                    <Suspense fallback={<PageLoader />}>
                        <AiInterviewSessionPage />
                    </Suspense>
                } />
                <Route path="/ai-interviews/:id" element={
                    <Suspense fallback={<PageLoader />}>
                        <AiInterviewDetailPage />
                    </Suspense>
                } />

                <Route path="/background-checks/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <BackgroundChecksPage />
                    </Suspense>
                } />

                <Route path="/requisitions" element={
                    <Suspense fallback={<PageLoader />}>
                        <RequisitionsPage />
                    </Suspense>
                } />
                <Route path="/requisitions/:id" element={
                    <Suspense fallback={<PageLoader />}>
                        <RequisitionDetailPage />
                    </Suspense>
                } />
                <Route path="/ats/careers-page" element={
                    <Suspense fallback={<PageLoader />}>
                        <CareersPageAdmin />
                    </Suspense>
                } />
                <Route path="/email-templates" element={
                    <Suspense fallback={<PageLoader />}>
                        <EmailTemplatesPage />
                    </Suspense>
                } />
                <Route path="/messages" element={
                    <Suspense fallback={<PageLoader />}>
                        <InboxPage />
                    </Suspense>
                } />
                <Route path="/messages/:conversationId" element={
                    <Suspense fallback={<PageLoader />}>
                        <InboxPage />
                    </Suspense>
                } />

                <Route path="/notification-preferences" element={
                    <Suspense fallback={<PageLoader />}>
                        <NotificationPreferencesPage />
                    </Suspense>
                } />

                {/* HR Management Routes */}
                <Route path="/employees/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <EmployeesPage />
                    </Suspense>
                } />
                <Route path="/company-profile" element={
                    <Suspense fallback={<PageLoader />}>
                        <CompanyProfilePage />
                    </Suspense>
                } />
                <Route path="/performance/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <PerformancePage />
                    </Suspense>
                } />
                <Route path="/talent-development" element={
                    <Suspense fallback={<PageLoader />}>
                        <TalentDevelopmentPage />
                    </Suspense>
                } />
                <Route path="/leave/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <LeaveManagementPage />
                    </Suspense>
                } />
                <Route path="/attendance/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <TimeAttendancePage />
                    </Suspense>
                } />
                <Route path="/payroll/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <PayrollPage />
                    </Suspense>
                } />
                <Route path="/benefits/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <BenefitsPage />
                    </Suspense>
                } />
                <Route path="/expenses/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <ExpensesPage />
                    </Suspense>
                } />
                <Route path="/compensation/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <CompensationPage />
                    </Suspense>
                } />
                <Route path="/documents/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <DocumentsPage />
                    </Suspense>
                } />
                <Route path="/offboarding/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <OffboardingPage />
                    </Suspense>
                } />
                <Route path="/ess/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <EmployeeSelfServicePage />
                    </Suspense>
                } />
                <Route path="/compliance/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <CompliancePage />
                    </Suspense>
                } />
                <Route path="/employee-relations/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <EmployeeRelationsPage />
                    </Suspense>
                } />
                <Route path="/role-management" element={
                    <Suspense fallback={<PageLoader />}>
                        <RoleManagementPage />
                    </Suspense>
                } />
                <Route path="/accrual-policies" element={
                    <Suspense fallback={<PageLoader />}>
                        <AccrualPoliciesPage />
                    </Suspense>
                } />
                <Route path="/workforce-planning" element={
                    <Suspense fallback={<PageLoader />}>
                        <WorkforcePlanningPage />
                    </Suspense>
                } />
                <Route path="/benefits-admin" element={
                    <Suspense fallback={<PageLoader />}>
                        <BenefitsAdminPage />
                    </Suspense>
                } />

                {/* Management Routes */}
                <Route path="/users/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <UsersPage />
                    </Suspense>
                } />
                <Route path="/finance/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <FinancePage />
                    </Suspense>
                } />
                <Route path="/integrations/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <IntegrationsPage />
                    </Suspense>
                } />
                <Route path="/reports/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <ReportsPage />
                    </Suspense>
                } />

                {/* System Routes */}
                <Route path="/settings/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <SettingsPage />
                    </Suspense>
                } />
                <Route path="/admin-settings" element={
                    <Suspense fallback={<PageLoader />}>
                        <AdminSettingsPage />
                    </Suspense>
                } />
                <Route path="/support-tickets" element={
                    <Suspense fallback={<PageLoader />}>
                        <SupportTicketsPage />
                    </Suspense>
                } />
                <Route path="/system-monitoring" element={
                    <Suspense fallback={<PageLoader />}>
                        <SystemMonitoringPage />
                    </Suspense>
                } />

                {/* Integration & Intelligence */}
                <Route path="/advanced-analytics" element={
                    <Suspense fallback={<PageLoader />}>
                        <AdvancedAnalyticsPage />
                    </Suspense>
                } />
                <Route path="/recruitment-integration" element={
                    <Suspense fallback={<PageLoader />}>
                        <RecruitmentIntegrationPage />
                    </Suspense>
                } />
                <Route path="/enhanced-learning" element={
                    <Suspense fallback={<PageLoader />}>
                        <EnhancedLearningPage />
                    </Suspense>
                } />

                {/* Other Routes */}
                <Route path="/analytics/*" element={
                    <Suspense fallback={<PageLoader />}>
                        <AnalyticsPage />
                    </Suspense>
                } />
                <Route path="/calendar" element={
                    <Suspense fallback={<PageLoader />}>
                        <CalendarPage />
                    </Suspense>
                } />
                <Route path="/internal-jobs" element={
                    <Suspense fallback={<PageLoader />}>
                        <InternalJobsPage />
                    </Suspense>
                } />
                <Route path="/import-export" element={
                    <Suspense fallback={<PageLoader />}>
                        <ImportExportPage />
                    </Suspense>
                } />
                <Route path="/subscriptions" element={
                    <Suspense fallback={<PageLoader />}>
                        <SubscriptionsPage />
                    </Suspense>
                } />

                {/* Notification Routes */}
                <Route path="/notifications" element={
                    <Suspense fallback={<PageLoader />}>
                        <NotificationCenterPage />
                    </Suspense>
                } />
                <Route path="/notifications/:id" element={
                    <Suspense fallback={<PageLoader />}>
                        <NotificationDetailPage />
                    </Suspense>
                } />
            </Route>

            {/* Dev & Mock Routes (Outside AuthGuard to simulate external Stripe) */}

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
