/**
 * Candidate Authentication Context
 * Manages authentication state for candidates
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { candidateAuthService, Candidate } from '@/shared/lib/candidateAuthService';
import { useToast } from '@/shared/hooks/use-toast';

interface CandidateAuthContextType {
    candidate: Candidate | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    refreshCandidate: () => Promise<void>;
}

const CandidateAuthContext = createContext<CandidateAuthContextType | undefined>(undefined);

export function CandidateAuthProvider({ children }: { children: ReactNode }) {
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Check if candidate is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await candidateAuthService.getCurrentCandidate();
            if (response.success && response.data) {
                setCandidate(response.data.candidate);
            } else {
                setCandidate(null);
            }
        } catch (error) {
            console.error('[CandidateAuthContext] Auth check exception:', error);
            setCandidate(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: any) => {
        try {
            setIsLoading(true);
            const response = await candidateAuthService.login(credentials);

            if (response.success && response.data) {
                setCandidate(response.data.candidate);
                toast({
                    title: 'Welcome back!',
                    description: `Logged in as ${response.data.candidate.firstName}`,
                });
                return { success: true };
            }

            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await candidateAuthService.logout();
            setCandidate(null);
            navigate('/candidate/login');
            toast({
                title: 'Logged out',
                description: 'Successfully logged out',
            });
        } catch (error) {
            setCandidate(null);
            navigate('/candidate/login');
        }
    };

    const register = async (data: any) => {
        try {
            setIsLoading(true);
            const response = await candidateAuthService.register(data);
            if (response.success) {
                toast({
                    title: 'Registration successful',
                    description: response.data?.message || 'Account created successfully',
                });
                // Auto login or redirect to login? usually redirect or require verification
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: 'Registration failed' };
        } finally {
            setIsLoading(false);
        }
    }

    const refreshCandidate = async () => {
        await checkAuth();
    }

    return (
        <CandidateAuthContext.Provider
            value={{
                candidate,
                isLoading,
                isAuthenticated: !!candidate,
                login,
                logout,
                register,
                refreshCandidate
            }}
        >
            {children}
        </CandidateAuthContext.Provider>
    );
}

export function useCandidateAuth() {
    const context = useContext(CandidateAuthContext);
    if (context === undefined) {
        throw new Error('useCandidateAuth must be used within a CandidateAuthProvider');
    }
    return context;
}
