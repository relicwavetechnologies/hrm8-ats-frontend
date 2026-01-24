/**
 * Application Providers
 * Consolidates all context providers in one place
 */

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/shared/components/ui/sonner';
import { AuthProvider, useAuth } from './providers/AuthContext';
import { CurrencyFormatProvider } from './providers/CurrencyFormatContext';
import { WebSocketProvider } from './providers/WebSocketContext';

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
 * 4. AuthProvider (authentication - requires routing)
 * 5. CurrencyFormatProvider (currency formatting)
 * 6. WebSocketProvider (real-time communication - requires auth)
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <BrowserRouter>
            <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <CurrencyFormatProvider>
                            <WebSocketWrapper>
                                {children}
                                <Toaster />
                            </WebSocketWrapper>
                        </CurrencyFormatProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </HelmetProvider>
        </BrowserRouter>
    );
}

/**
 * Wrapper component to provide auth props to WebSocketProvider
 * Must be inside AuthProvider to access useAuth hook
 */
function WebSocketWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <WebSocketProvider isAuthenticated={isAuthenticated} userEmail={user?.email}>
            {children}
        </WebSocketProvider>
    );
}
