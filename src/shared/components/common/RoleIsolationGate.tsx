/**
 * Role Isolation Gate
 * Prevents users from accessing portals not meant for their role
 */

import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useCandidateAuth } from '@/app/providers/AuthContext' // TODO: Remove candidate auth;
import { useHrm8Auth } from '@/app/providers/AuthContext' // TODO: Remove hrm8 auth;

type BlockedRole = 'recruiter' | 'candidate' | 'consultant' | 'hrm8';

interface RoleIsolationGateProps {
  children: ReactNode;
  blockRole: BlockedRole;
  redirectTo: string;
}

export function RoleIsolationGate({ children, blockRole, redirectTo }: RoleIsolationGateProps) {
  const navigate = useNavigate();
  const { isAuthenticated: isRecruiterAuthenticated, isLoading: recruiterLoading } = useAuth();
  const { isAuthenticated: isCandidateAuthenticated, isLoading: candidateLoading } = useCandidateAuth();
  const { isAuthenticated: isHrm8Authenticated, isLoading: hrm8Loading } = useHrm8Auth();

  useEffect(() => {
    // Wait for auth checks to complete
    if (recruiterLoading || candidateLoading || hrm8Loading) {
      return;
    }

    // Check if user has the blocked role and redirect if they do
    if (blockRole === 'recruiter' && isRecruiterAuthenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (blockRole === 'candidate' && isCandidateAuthenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (blockRole === 'hrm8' && isHrm8Authenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // TODO: Add checks for consultant when that context is implemented
  }, [blockRole, redirectTo, navigate, isRecruiterAuthenticated, isCandidateAuthenticated, isHrm8Authenticated, recruiterLoading, candidateLoading, hrm8Loading]);

  // Show loading while checking auth
  if (recruiterLoading || candidateLoading || hrm8Loading) {
    return null; // Or a loading spinner
  }

  // If user has blocked role, don't render children (redirect will happen)
  if (blockRole === 'recruiter' && isRecruiterAuthenticated) {
    return null;
  }

  if (blockRole === 'candidate' && isCandidateAuthenticated) {
    return null;
  }

  if (blockRole === 'hrm8' && isHrm8Authenticated) {
    return null;
  }

  // Render children if user doesn't have the blocked role
  return <>{children}</>;
}
