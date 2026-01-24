/**
 * Unified Auth Adapter Hook
 * Provides a consistent interface across all dashboard auth contexts
 */

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateAuth } from "@/contexts/CandidateAuthContext";
import { useConsultantAuth } from "@/contexts/ConsultantAuthContext";
import { useHrm8Auth } from "@/contexts/Hrm8AuthContext";
import type { AuthAdapter, DashboardType } from "@/shared/types/dashboard";

/**
 * Hook that provides a unified auth interface for any dashboard type.
 * Automatically maps to the correct auth context based on dashboard type.
 *
 * @param dashboardType - The type of dashboard to get auth for
 * @returns AuthAdapter - Unified interface with user, isAuthenticated, isLoading, logout, and getEmail
 *
 * @example
 * ```tsx
 * const auth = useAuthAdapter("candidate");
 * console.log(auth.user); // Candidate object
 * console.log(auth.isAuthenticated); // boolean
 * await auth.logout(); // Logs out candidate
 * ```
 */
export function useAuthAdapter(dashboardType: DashboardType): AuthAdapter {
  // Note: All hooks must be called unconditionally due to React's rules of hooks.
  // We call all auth hooks but only use the data from the relevant one.
  const mainAuth = useAuth();
  const candidateAuth = useCandidateAuth();
  const consultantAuth = useConsultantAuth();
  const hrm8Auth = useHrm8Auth();

  return useMemo(() => {
    switch (dashboardType) {
      case "candidate":
        return {
          user: candidateAuth.candidate,
          isAuthenticated: candidateAuth.isAuthenticated,
          isLoading: candidateAuth.isLoading,
          logout: candidateAuth.logout,
          getEmail: () => candidateAuth.candidate?.email,
        };

      case "consultant":
      case "sales-agent":
        return {
          user: consultantAuth.consultant,
          isAuthenticated: consultantAuth.isAuthenticated,
          isLoading: consultantAuth.isLoading,
          logout: consultantAuth.logout,
          getEmail: () => consultantAuth.consultant?.email,
        };

      case "hrm8":
        return {
          user: hrm8Auth.hrm8User,
          isAuthenticated: hrm8Auth.isAuthenticated,
          isLoading: hrm8Auth.isLoading,
          logout: hrm8Auth.logout,
          getEmail: () => hrm8Auth.hrm8User?.email,
        };

      case "main":
      default:
        return {
          user: mainAuth.user,
          isAuthenticated: mainAuth.isAuthenticated,
          isLoading: mainAuth.isLoading,
          logout: mainAuth.logout,
          getEmail: () => mainAuth.user?.email,
        };
    }
  }, [dashboardType, mainAuth, candidateAuth, consultantAuth, hrm8Auth]);
}

/**
 * Type-safe auth adapter variants for each dashboard type.
 * These provide better type inference for the user object.
 */
export function useCandidateAuthAdapter() {
  return useAuthAdapter("candidate");
}

export function useConsultantAuthAdapter() {
  return useAuthAdapter("consultant");
}

export function useHrm8AuthAdapter() {
  return useAuthAdapter("hrm8");
}

export function useMainAuthAdapter() {
  return useAuthAdapter("main");
}
