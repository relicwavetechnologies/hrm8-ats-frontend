/**
 * Application Routes Configuration
 * Defines all routes for the HRM8-ATS application
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { AuthGuard } from '@/shared/components/common/AuthGuard';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyCompanyPage from '@/pages/auth/VerifyCompanyPage';

// Module Pages
import JobsPage from '@/pages/jobs/JobsPage';
import CandidatesPage from '@/pages/candidates/CandidatesPage';
import ApplicationsPage from '@/pages/applications/ApplicationsPage';
import EmployeesPage from '@/pages/employees/EmployeesPage';
import PerformancePage from '@/pages/performance/PerformancePage';
import SettingsPage from '@/pages/settings/SettingsPage';

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
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />

                {/* Module Routes */}
                <Route path="/jobs/*" element={<JobsPage />} />
                <Route path="/candidates/*" element={<CandidatesPage />} />
                <Route path="/applications/*" element={<ApplicationsPage />} />
                <Route path="/employees/*" element={<EmployeesPage />} />
                <Route path="/performance/*" element={<PerformancePage />} />
                <Route path="/settings/*" element={<SettingsPage />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
