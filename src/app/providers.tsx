/**
 * Application Providers
 * Consolidates all context providers in one place
 */

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/shared/components/ui/sonner';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { CandidateAuthProvider, useCandidateAuth } from '@/contexts/CandidateAuthContext';
import { ConsultantAuthProvider, useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { Hrm8AuthProvider, useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { CurrencyFormatProvider } from './providers/CurrencyFormatContext';
import { WebSocketProvider } from './providers/WebSocketContext';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Create a Query Client instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * All application providers in the correct order:
 * 1. BrowserRouter (routing)
 * 2. HelmetProvider (SEO/meta tags)
 * 3. QueryClientProvider (data fetching)
 * 4. AuthProvider (main company auth)
 * 5. CandidateAuthProvider (candidate authentication)
 * 6. ConsultantAuthProvider (consultant authentication)
 * 7. Hrm8AuthProvider (global admin/licensee authentication)
 * 8. CurrencyFormatProvider (currency formatting)
 * 9. WebSocketProvider (real-time communication - requires any auth)
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                    <ErrorBoundary>
                        <AuthProvider>
                            <CandidateAuthProvider>
                                <ConsultantAuthProvider>
                                    <Hrm8AuthProvider>
                                        <CurrencyFormatProvider>
                                            <WebSocketWrapper>
                                                {children}
                                                <Toaster />
                                            </WebSocketWrapper>
                                        </CurrencyFormatProvider>
                                    </Hrm8AuthProvider>
                                </ConsultantAuthProvider>
                            </CandidateAuthProvider>
                        </AuthProvider>
                    </ErrorBoundary>
                </QueryClientProvider>
            </HelmetProvider>
        </BrowserRouter>
    );
}

/**
 * Wrapper component to provide auth props to WebSocketProvider
 * Must be inside all AuthProviders to access their hooks
 */
function WebSocketWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated: isAuth, user } = useAuth();
    const { isAuthenticated: isCandidateAuth, candidate } = useCandidateAuth();
    const { isAuthenticated: isConsultantAuth, consultant } = useConsultantAuth();
    const { isAuthenticated: isHrm8Auth, hrm8User } = useHrm8Auth();

    const isConnected = isAuth || isCandidateAuth || isConsultantAuth || isHrm8Auth;
    const userEmail = user?.email || candidate?.email || consultant?.email || hrm8User?.email;

    return (
        <WebSocketProvider isAuthenticated={isConnected} userEmail={userEmail}>
            {children}
        </WebSocketProvider>
    );
}
