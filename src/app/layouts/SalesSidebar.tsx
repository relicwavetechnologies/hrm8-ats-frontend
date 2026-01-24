import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Building2,
  ArrowRightLeft,
  Settings,
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
import { cn } from "@/shared/lib/utils";
import { useConsultantAuth } from "@/app/providers/AuthContext";
import { ConsultantSidebarFooter } from "./ConsultantSidebarFooter";

const menuItems = [
  { path: "/sales-agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sales-agent/pipeline", label: "Pipeline", icon: DollarSign },
  { path: "/sales-agent/leads", label: "Leads", icon: Users },
  { path: "/sales-agent/companies", label: "My Clients", icon: Building2 },
  { path: "/sales-agent/commissions", label: "Commissions", icon: DollarSign },
  { path: "/sales-agent/settings", label: "Settings", icon: Settings },
];

export function SalesSidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { consultant } = useConsultantAuth();
  const [isHovering, setIsHovering] = useState(false);

  const isExpanded = open || (!open && isHovering);

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
          to="/sales-agent/dashboard"
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
        {isExpanded && consultant && (
          <p className="text-xs text-muted-foreground mt-2 px-2">
            Sales Partner Portal
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
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
        {/* Portal Switcher for 360 Consultants */}
        {consultant?.role === 'CONSULTANT_360' && (
          <SidebarGroup className="p-0 mb-2">
            <SidebarMenuButton
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-center shadow-md transition-all duration-200"
            >
              <NavLink to="/consultant/dashboard" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                {isExpanded && <span>Switch to Consultant</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarGroup>
        )}
        <ConsultantSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
