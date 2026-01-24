/**
 * Candidate Layout
 * Uses the unified DashboardShell with candidate-specific configuration
 */

import { DashboardShell } from "./unified/DashboardShell";
import { candidateDashboardConfig } from "@/config/dashboardConfigs";
import { useAuthAdapter } from "@/shared/hooks/useAuthAdapter";

export function CandidateLayout() {
  const auth = useAuthAdapter("candidate");
  return <DashboardShell config={candidateDashboardConfig} auth={auth} />;
}


































