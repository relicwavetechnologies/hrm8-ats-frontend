/**
 * AnyAuthRedirectGate
 * If the user is authenticated in ANY portal (recruiter, candidate, consultant, HRM8),
 * redirect them to their respective dashboard and prevent rendering auth pages.
 */

import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { useCandidateAuth } from '@/app/AuthProvider' // TODO: Remove candidate auth;
import { useHrm8Auth } from '@/app/AuthProvider' // TODO: Remove hrm8 auth;
import { useConsultantAuth } from '@/app/AuthProvider' // TODO: Remove consultant auth;

interface AnyAuthRedirectGateProps {
  children: ReactNode;
}

export function AnyAuthRedirectGate({ children }: AnyAuthRedirectGateProps) {
  const navigate = useNavigate();

  const { isAuthenticated: isRecruiterAuthenticated, isLoading: recruiterLoading } = useAuth();
  const { isAuthenticated: isCandidateAuthenticated, isLoading: candidateLoading } = useCandidateAuth();
  const { isAuthenticated: isHrm8Authenticated, isLoading: hrm8Loading } = useHrm8Auth();
  const { isAuthenticated: isConsultantAuthenticated, isLoading: consultantLoading, consultant } = useConsultantAuth();

  const isAnyLoading = recruiterLoading || candidateLoading || hrm8Loading || consultantLoading;

  useEffect(() => {
    if (isAnyLoading) {
      return;
    }

    // Decide where to send the user based on which portal they're authenticated in.
    // In normal operation only one of these should be true at a time.
    if (isHrm8Authenticated) {
      navigate('/hrm8/dashboard', { replace: true });
      return;
    }

    if (isConsultantAuthenticated) {
      if (consultant?.role === 'SALES_AGENT') {
        navigate('/sales-agent/dashboard', { replace: true });
      } else {
        navigate('/consultant/dashboard', { replace: true });
      }
      return;
    }

    if (isRecruiterAuthenticated) {
      navigate('/home', { replace: true });
      return;
    }

    if (isCandidateAuthenticated) {
      navigate('/candidate/dashboard', { replace: true });
      return;
    }
  }, [
    isAnyLoading,
    isRecruiterAuthenticated,
    isCandidateAuthenticated,
    isHrm8Authenticated,
    isConsultantAuthenticated,
    navigate,
  ]);

  // While loading or redirecting, don't show auth pages
  if (isAnyLoading) {
    return null;
  }

  if (isHrm8Authenticated || isConsultantAuthenticated || isRecruiterAuthenticated || isCandidateAuthenticated) {
    return null;
  }

  return <>{children}</>;
}































