/**
 * Application Routes Configuration
 * Defines all routes for the HRM8-ATS application
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { AuthGuard } from '@/shared/components/common/AuthGuard';
import { Loader2 } from 'lucide-react';

// Loading component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyCompanyPage from '@/pages/auth/VerifyCompanyPage';

// Main Pages
import HomePage from '@/pages/HomePage';

// Lazy load module pages for code splitting
// Note: Some pages are commented out due to missing dependencies - fix imports then uncomment
const JobsPage = lazy(() => import('@/pages/jobs/Jobs'));
const CandidatesPage = lazy(() => import('@/pages/candidates/Candidates'));
// const ApplicationsPage = lazy(() => import('@/pages/applications/Applications'));
// const InterviewsPage = lazy(() => import('@/pages/interviews/Interviews'));
// const OffersPage = lazy(() => import('@/pages/offers/Offers'));
// const AssessmentsPage = lazy(() => import('@/pages/assessments/Assessments'));
// const BackgroundChecksPage = lazy(() => import('@/pages/background-checks/BackgroundChecks'));
// const EmployeesPage = lazy(() => import('@/pages/employees/EmployeesPage'));
// const SettingsPage = lazy(() => import('@/pages/settings/Settings'));

// Placeholder component for pages not yet fully extracted
const ComingSoon = ({ title }: { title: string }) => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">This page is under construction</p>
        </div>
    </div>
);

export function AppRoutes() {
    return (
        <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-company" element={<VerifyCompanyPage />} />

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
                <Route path="/home" element={<HomePage />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard/overview" element={<ComingSoon title="Dashboard Overview" />} />

                {/* ATS Routes */}
                <Route path="/ats/jobs" element={
                    <Suspense fallback={<PageLoader />}>
                        <JobsPage />
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

                <Route path="/applications/*" element={<ComingSoon title="Applications" />} />

                <Route path="/interviews/*" element={<ComingSoon title="Interviews" />} />
                <Route path="/collaborative-feedback" element={<ComingSoon title="Collaborative Feedback" />} />

                <Route path="/offers/*" element={<ComingSoon title="Offers" />} />

                <Route path="/assessments/*" element={<ComingSoon title="Assessments" />} />
                <Route path="/assessment-templates" element={<ComingSoon title="Assessment Templates" />} />
                <Route path="/question-bank" element={<ComingSoon title="Question Bank" />} />
                <Route path="/assessment-analytics" element={<ComingSoon title="Assessment Analytics" />} />

                <Route path="/ai-interviews/*" element={<ComingSoon title="AI Interviews" />} />

                <Route path="/background-checks/*" element={<ComingSoon title="Background Checks" />} />

                <Route path="/requisitions/*" element={<ComingSoon title="Requisitions" />} />
                <Route path="/ats/careers-page" element={<ComingSoon title="Careers Page" />} />
                <Route path="/email-templates" element={<ComingSoon title="Email Templates" />} />
                <Route path="/messages" element={<ComingSoon title="Inbox" />} />

                {/* HR Management Routes */}
                <Route path="/employees/*" element={<ComingSoon title="Employees" />} />
                <Route path="/company-profile" element={<ComingSoon title="Company Profile" />} />
                <Route path="/performance/*" element={<ComingSoon title="Performance" />} />
                <Route path="/talent-development" element={<ComingSoon title="Talent Development" />} />
                <Route path="/leave/*" element={<ComingSoon title="Leave Management" />} />
                <Route path="/attendance/*" element={<ComingSoon title="Time & Attendance" />} />
                <Route path="/payroll/*" element={<ComingSoon title="Payroll" />} />
                <Route path="/benefits/*" element={<ComingSoon title="Benefits" />} />
                <Route path="/expenses/*" element={<ComingSoon title="Expenses" />} />
                <Route path="/compensation/*" element={<ComingSoon title="Compensation" />} />
                <Route path="/documents/*" element={<ComingSoon title="Documents" />} />
                <Route path="/offboarding/*" element={<ComingSoon title="Offboarding" />} />
                <Route path="/ess/*" element={<ComingSoon title="Self-Service" />} />
                <Route path="/compliance/*" element={<ComingSoon title="Compliance" />} />
                <Route path="/employee-relations/*" element={<ComingSoon title="Employee Relations" />} />
                <Route path="/role-management" element={<ComingSoon title="Role Management" />} />
                <Route path="/accrual-policies" element={<ComingSoon title="Accrual Policies" />} />
                <Route path="/workforce-planning" element={<ComingSoon title="Workforce Planning" />} />
                <Route path="/benefits-admin" element={<ComingSoon title="Benefits Admin" />} />

                {/* Management Routes */}
                <Route path="/users/*" element={<ComingSoon title="Users" />} />
                <Route path="/finance/*" element={<ComingSoon title="Finance" />} />
                <Route path="/integrations/*" element={<ComingSoon title="Integrations" />} />
                <Route path="/reports/*" element={<ComingSoon title="Reports" />} />

                {/* System Routes */}
                <Route path="/settings/*" element={<ComingSoon title="Settings" />} />
                <Route path="/admin-settings" element={<ComingSoon title="Admin Settings" />} />
                <Route path="/support-tickets" element={<ComingSoon title="Support Tickets" />} />
                <Route path="/system-monitoring" element={<ComingSoon title="System Monitoring" />} />
                <Route path="/notification-preferences" element={<ComingSoon title="Notification Settings" />} />

                {/* Integration & Intelligence */}
                <Route path="/advanced-analytics" element={<ComingSoon title="Advanced Analytics" />} />
                <Route path="/recruitment-integration" element={<ComingSoon title="Recruitment Integration" />} />
                <Route path="/enhanced-learning" element={<ComingSoon title="Enhanced Learning" />} />

                {/* Other Routes */}
                <Route path="/analytics/*" element={<ComingSoon title="Analytics" />} />
                <Route path="/calendar" element={<ComingSoon title="Calendar" />} />
                <Route path="/internal-jobs" element={<ComingSoon title="Internal Jobs" />} />
                <Route path="/import-export" element={<ComingSoon title="Import/Export" />} />
                <Route path="/subscriptions" element={<ComingSoon title="Subscriptions" />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
