import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import {
  LayoutDashboard,
  MapPin,
  Users,
  UserCog,
  Briefcase,
  DollarSign,
  TrendingUp,
  FileText,
  BookOpen,
  LogOut,
  BarChart3,
  Target,
  UserCheck,
  Settings,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useHrm8Auth } from "@/app/providers/AuthContext";
import { Hrm8SidebarFooter } from "./Hrm8SidebarFooter";

const menuItems = [
  { path: "/hrm8/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/hrm8/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
  { path: "/hrm8/regions", label: "Regions", icon: MapPin, adminOnly: true },
  { path: "/hrm8/licensees", label: "Licensees", icon: Users, adminOnly: true },
  { path: "/hrm8/staff", label: "Staff", icon: UserCog },
  { path: "/hrm8/jobs", label: "Job Allocation", icon: Briefcase },
  { path: "/hrm8/job-board", label: "Jobs", icon: Briefcase, adminOnly: true },
  { path: "/hrm8/leads", label: "Leads", icon: Target },
  { path: "/hrm8/sales-pipeline", label: "Pipeline", icon: BarChart3 },
  { path: "/hrm8/commissions", label: "Commissions", icon: DollarSign },
  { path: "/hrm8/withdrawals", label: "Withdrawals", icon: DollarSign },
  { path: "/hrm8/billing/refund-requests", label: "Refund Requests", icon: DollarSign },
  { path: "/hrm8/conversion-requests", label: "Conversion Requests", icon: UserCheck },
  { path: "/hrm8/settlements", label: "Settlements", icon: DollarSign },
  { path: "/hrm8/revenue", label: "Revenue", icon: TrendingUp },
  { path: "/hrm8/revenue-analytics", label: "Revenue Analytics", icon: BarChart3 },
  { path: "/hrm8/attribution", label: "Attribution", icon: UserCheck, adminOnly: true },
  { path: "/hrm8/pricing", label: "Pricing", icon: BookOpen },
  { path: "/hrm8/reports", label: "Reports", icon: FileText },
  { path: "/hrm8/settings", label: "Account Settings", icon: Settings },
  { path: "/hrm8/careers-requests", label: "Careers Requests", icon: UserCheck, adminOnly: true },
  { path: "/hrm8/system-settings", label: "System Settings", icon: Settings, adminOnly: true },
  { path: "/hrm8/audit-logs", label: "Audit Logs", icon: ClipboardList, adminOnly: true },
];

export function Hrm8Sidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { hrm8User } = useHrm8Auth();
  const [isHovering, setIsHovering] = useState(false);

  const isGlobalAdmin = hrm8User?.role === "GLOBAL_ADMIN";
  const isExpanded = open || (!open && isHovering);

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isGlobalAdmin
  );

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path + "/");
  };

  return (
    <Sidebar
      collapsible="icon"
      data-hover-expand={!open && isHovering}
      onMouseEnter={() => !open && setIsHovering(true)}
      onMouseLeave={() => !open && setIsHovering(false)}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-gradient-to-b from-sidebar-accent/30 to-transparent">
        <NavLink
          to="/hrm8/dashboard"
          className={cn(
            "flex items-center transition-all duration-200 hover:opacity-80",
            isExpanded ? "justify-start px-2" : "justify-center"
          )}
        >
          {isExpanded ? (
            <>
              <img
                src={logoLight}
                alt="HRM8"
                className="h-8 block dark:hidden"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)",
                }}
              />
              <img
                src={logoDark}
                alt="HRM8"
                className="h-8 hidden dark:block opacity-100"
                style={{ filter: "brightness(0) saturate(100%) invert(1)" }}
              />
            </>
          ) : (
            <img
              src={iconMark}
              alt="HRM8"
              className="h-8 w-8 opacity-100"
            />
          )}
        </NavLink>
        {isExpanded && hrm8User && (
          <p className="text-xs text-muted-foreground mt-2 px-2">
            {hrm8User.role === "GLOBAL_ADMIN" ? "Global Admin" : "Regional Licensee"}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "relative transition-all duration-200",
                        "hover:bg-sidebar-accent/50",
                        active && [
                          "bg-primary/10",
                          "text-primary",
                          "font-medium",
                          isExpanded && "border-l-4 border-primary",
                        ]
                      )}
                    >
                      <NavLink
                        to={item.path}
                        className="flex items-center gap-3 w-full"
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-all",
                            !isExpanded && "mx-auto"
                          )}
                        />
                        {isExpanded && (
                          <span className="transition-opacity duration-200">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 bg-gradient-to-t from-sidebar-accent/30 to-transparent">
        <Hrm8SidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
