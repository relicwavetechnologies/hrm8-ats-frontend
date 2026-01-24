/**
 * Consultant 360 Layout
 * Uses the unified DashboardShell with Consultant 360-specific configuration
 */

import { DashboardShell } from "./unified/DashboardShell";
import { consultant360DashboardConfig } from "@/config/dashboardConfigs";
import { useAuthAdapter } from "@/shared/hooks/useAuthAdapter";

export function Consultant360Layout() {
    const auth = useAuthAdapter("consultant");
    return <DashboardShell config={consultant360DashboardConfig} auth={auth} />;
}
