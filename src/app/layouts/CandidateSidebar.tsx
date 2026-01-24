import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Settings,
  Briefcase,
  GraduationCap,
  Bell,
  FolderOpen,
  MessageSquare,
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
import { useCandidateAuth } from "@/app/providers/AuthContext";
import { CandidateSidebarFooter } from "./CandidateSidebarFooter";
// TODO: Candidate portal component - not needed in ATS
// import { NotificationBell } from "@/components/candidate/NotificationBell";
const NotificationBell = () => null; // Placeholder
import { ClipboardCheck } from "lucide-react";

const menuItems = [
  { path: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/candidate/profile", label: "My Profile", icon: User },
  { path: "/candidate/work-history", label: "Work History", icon: Briefcase },
  { path: "/candidate/qualifications", label: "Qualifications", icon: GraduationCap },
  { path: "/candidate/documents", label: "Documents", icon: FolderOpen },
  { path: "/candidate/applications", label: "Applications", icon: FileText },
  { path: "/candidate/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { path: "/candidate/assessments", label: "Assessments", icon: ClipboardCheck },
  { path: "/candidate/messages", label: "Messages", icon: MessageSquare },
];

export function CandidateSidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { candidate } = useCandidateAuth();
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
          to="/candidate/dashboard"
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
        {isExpanded && candidate && (
          <p className="text-xs text-muted-foreground mt-2 px-2">
            {candidate.firstName} {candidate.lastName}
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
        <CandidateSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
































