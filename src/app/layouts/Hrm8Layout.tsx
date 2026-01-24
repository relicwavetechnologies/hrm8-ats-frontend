/**
 * HRM8 Layout
 * Uses the unified DashboardShell with HRM8-specific configuration
 */

import { DashboardShell } from "./unified/DashboardShell";
import { hrm8DashboardConfig } from "@/config/dashboardConfigs";
import { useAuthAdapter } from "@/shared/hooks/useAuthAdapter";

export function Hrm8Layout() {
  const auth = useAuthAdapter("hrm8");
  return <DashboardShell config={hrm8DashboardConfig} auth={auth} />;
}


































