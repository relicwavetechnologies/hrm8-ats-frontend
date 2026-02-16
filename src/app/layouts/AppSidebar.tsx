import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import { Home, LayoutGrid, Users, Briefcase, FileText, BarChart3, Calendar, Settings, HelpCircle, Clock, Building2, UserCog, Mail, DollarSign, FileBarChart, Shield, Ticket, Heart, UsersRound, UserCheck, Target, Plug, CalendarDays, ClipboardList, Wallet, Gift, Receipt, FolderOpen, DollarSignIcon, UserMinus, GraduationCap, TrendingUp, User, Crown, CalendarClock, BarChart2, MessageSquare, Handshake, UserSquare, Server, Bell, Map, CircleDollarSign, LineChart, FileCheck, FileSignature, ShieldCheck, PieChart, MailPlus, Inbox, Award, HeartHandshake, Banknote, Settings2, ScrollText, UserRound, ChevronDown, ClipboardCheck, UserRoundCog } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarSeparator, useSidebar } from "@/shared/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Badge } from "@/shared/components/ui/badge";

import { cn } from "@/shared/lib/utils";
import { SidebarFooterContent } from "./SidebarFooterContent";
import { useRecentRecords } from "@/shared/hooks/useRecentRecords";
import { useSidebarSections } from "@/shared/hooks/useSidebarSections";
import { FeedbackNotificationBadge } from "@/modules/performance/components/FeedbackNotificationBadge";
import { formatDistanceToNow } from "date-fns";
import { usePermissions } from "@/shared/hooks/usePermissions";

// MAIN NAVIGATION
const mainNavItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboards", url: "/dashboard/overview", icon: LayoutGrid },
];

// ATS (Applicant Tracking System) Section
const atsNavItems = [
  {
    title: "Jobs",
    url: "/ats/jobs",
    icon: Briefcase,
    isActive: true,
  },
  { title: "Job Templates", url: "/ats/job-templates", icon: FileText },
  {
    title: "Candidates",
    url: "/candidates",
    icon: Users,
  },
  { title: "Applications", url: "/applications", icon: FileCheck },
  { title: "Requisitions", url: "/requisitions", icon: ClipboardList },
  {
    title: "Interviews",
    url: "/interviews",
    icon: CalendarClock,
    badge: FeedbackNotificationBadge,
    subItems: [
      { title: "All Interviews", url: "/interviews" },
      { title: "Schedule", url: "/interviews/schedule" },
      { title: "Collaborative Feedback", url: "/collaborative-feedback" },
    ]
  },
  {
    title: "Offers",
    url: "/offers",
    icon: FileSignature,
    subItems: [
      { title: "All Offers", url: "/offers" },
      { title: "Management", url: "/offers/manage" },
    ]
  },
  {
    title: "AI Interviews",
    url: "/ai-interviews",
    icon: MessageSquare,
    subItems: [
      { title: "All Interviews", url: "/ai-interviews" },
      { title: "Schedule New", url: "/ai-interviews/schedule" },
      { title: "Reports", url: "/ai-interviews/reports" },
      { title: "Analytics", url: "/ai-interviews/analytics" },
    ]
  },
  {
    title: "Assessments",
    url: "/assessments",
    icon: ClipboardCheck,
    subItems: [
      { title: "All Assessments", url: "/assessments" },
      { title: "Templates", url: "/assessment-templates" },
      { title: "Question Bank", url: "/question-bank" },
      { title: "Analytics", url: "/assessment-analytics" },
    ]
  },
  { title: "Background Checks", url: "/background-checks", icon: ShieldCheck },
  { title: "Careers Page", url: "/ats/careers-page", icon: Building2 },
  { title: "Email Templates", url: "/email-templates", icon: MailPlus },
  { title: "Inbox", url: "/messages", icon: Inbox },
];



// OPERATIONS Section
const operationsNavItems = [
  { title: "Employers", url: "/employers", icon: Building2 },
  { title: "Consultants", url: "/consultants", icon: Handshake },
  { title: "Recruitment Services", url: "/recruitment-services", icon: Target },
  {
    title: "RPO",
    url: "/rpo",
    icon: UserRound,
    subItems: [
      { title: "Overview", url: "/rpo" },
      { title: "Contracts", url: "/rpo/contracts" },
      { title: "Consultants", url: "/rpo/consultants" },
      { title: "Performance", url: "/rpo/performance" },
      { title: "Renewals", url: "/rpo/renewals" },
      { title: "Tasks & Allocation", url: "/rpo/tasks" },
      { title: "Revenue Forecast", url: "/rpo/forecast" },
    ]
  },
  { title: "Analytics", url: "/analytics", icon: PieChart },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Internal Jobs", url: "/internal-jobs", icon: UserSquare },
  { title: "Import/Export", url: "/import-export", icon: FileBarChart },
];

// HR MANAGEMENT Section
const hrManagementNavItems = [
  {
    title: "Employees",
    url: "/employees",
    icon: UserCheck,
    subItems: [
      { title: "Employees", url: "/employees" },
      { title: "Analytics", url: "/employees/analytics" },
      { title: "Org Chart", url: "/employees/org-chart" },
    ]
  },
  { title: "Company Profile", url: "/company-profile", icon: UserCog },
  { title: "Performance", url: "/performance", icon: Award },
  { title: "Talent Development", url: "/talent-development", icon: GraduationCap },
  { title: "Leave Management", url: "/leave", icon: CalendarDays },
  { title: "Time & Attendance", url: "/attendance", icon: Clock },
  { title: "Payroll", url: "/payroll", icon: Wallet },
  { title: "Benefits", url: "/benefits", icon: Gift },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Compensation", url: "/compensation", icon: DollarSignIcon },
  { title: "Documents", url: "/documents", icon: FolderOpen },
  { title: "Offboarding", url: "/offboarding", icon: UserMinus },
  { title: "Self-Service", url: "/ess", icon: User },
  { title: "Compliance", url: "/compliance", icon: ScrollText },
  { title: "Employee Relations", url: "/employee-relations", icon: MessageSquare },
  { title: "Role Management", url: "/role-management", icon: Crown },
  { title: "Accrual Policies", url: "/accrual-policies", icon: CalendarClock },
  { title: "Workforce Planning", url: "/workforce-planning", icon: BarChart2 },
  { title: "Benefits Admin", url: "/benefits-admin", icon: HeartHandshake },
];

// MANAGEMENT Section
const managementNavItems = [
  { title: "Users", url: "/users", icon: UsersRound },
  { title: "Finance", url: "/finance", icon: Banknote },
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "Reports", url: "/reports", icon: FileBarChart },
];

// INTEGRATIONS Section
const integrationsNavItems = [
  { title: "Advanced Analytics", url: "/advanced-analytics", icon: BarChart2 },
  { title: "Recruitment Integration", url: "/recruitment-integration", icon: Users },
  { title: "Enhanced Learning", url: "/enhanced-learning", icon: GraduationCap },
  { title: "Integrations", url: "/integrations", icon: Plug },
];

// SYSTEM Section
const systemNavItems = [
  { title: "Company Profile", url: "/company-profile", icon: Building2 },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Admin Settings", url: "/admin-settings", icon: Settings2 },
  { title: "Support Tickets", url: "/support-tickets", icon: Ticket },
  { title: "System Monitoring", url: "/system-monitoring", icon: Server },
  { title: "Notification Settings", url: "/notification-preferences", icon: Bell },
];
export function AppSidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { records: recentRecords, clearRecentRecords } = useRecentRecords();
  const { user } = usePermissions();
  const { sections, toggleSection } = useSidebarSections();
  const [isHovering, setIsHovering] = useState(false);

  // Check module access
  const hasATS = user.modules.atsEnabled;
  const hasHRMS = user.modules.hrmsEnabled;

  // Compute visual state: show expanded when permanently open OR temporarily hovering
  const isExpanded = open || (!open && isHovering);

  const isActive = (path: string) => {
    // Exact match first
    if (location.pathname === path) return true;

    // For parent routes, check if current path starts with the route
    // But exclude dashboard routes from prefix matching to avoid conflicts
    if (!path.startsWith('/dashboard')) {
      return location.pathname.startsWith(path + '/');
    }

    return false;
  };

  return <Sidebar
    collapsible="icon"
    data-hover-expand={!open && isHovering}
    onMouseEnter={() => !open && setIsHovering(true)}
    onMouseLeave={() => !open && setIsHovering(false)}
  >
    <SidebarHeader className="border-b border-sidebar-border p-4 bg-gradient-to-b from-sidebar-accent/30 to-transparent">
      <NavLink
        to="/home"
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
              style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)' }}
            />
            <img
              src={logoDark}
              alt="HRM8"
              className="h-8 hidden dark:block opacity-100"
              style={{ filter: 'brightness(0) saturate(100%) invert(1)' }}
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
    </SidebarHeader>

    <SidebarContent>
      {/* MAIN NAVIGATION */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  className={cn(
                    "relative transition-all duration-200",
                    "hover:bg-sidebar-accent/50",
                    isActive(item.url) && [
                      "bg-primary/10",
                      "text-primary",
                      "font-medium",
                      isExpanded && "border-l-4 border-primary"
                    ]
                  )}
                >
                  <NavLink to={item.url} className="flex items-center gap-3 w-full">
                    <item.icon className={cn(
                      "h-5 w-5 transition-all",
                      !isExpanded && "mx-auto"
                    )} />
                    {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      {/* ATS Section - Only show if ATS module is enabled */}
      {hasATS && (
        <>
          <Collapsible open={sections.ats} onOpenChange={() => toggleSection('ats')}>
            <SidebarGroup>
              {isExpanded && (
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/30 rounded-sm transition-colors flex items-center justify-between group">
                    <span>Recruitment (ATS)</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {atsNavItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          className={cn(
                            "relative transition-all duration-200",
                            "hover:bg-sidebar-accent/50",
                            isActive(item.url) && [
                              "bg-primary/10",
                              "text-primary",
                              "font-medium",
                              isExpanded && "border-l-4 border-primary"
                            ]
                          )}
                        >
                          <NavLink to={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className={cn(
                              "h-5 w-5 transition-all",
                              !isExpanded && "mx-auto"
                            )} />
                            {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <SidebarSeparator />
        </>
      )}



      {/* OPERATIONS Section - Hidden */}
      {false && (
        <>
          <Collapsible open={sections.operations} onOpenChange={() => toggleSection('operations')}>
            <SidebarGroup>
              {isExpanded && (
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/30 rounded-sm transition-colors flex items-center justify-between group">
                    <span>Operations</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {operationsNavItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          className={cn(
                            "relative transition-all duration-200",
                            "hover:bg-sidebar-accent/50",
                            isActive(item.url) && [
                              "bg-primary/10",
                              "text-primary",
                              "font-medium",
                              isExpanded && "border-l-4 border-primary"
                            ]
                          )}
                        >
                          <NavLink to={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className={cn(
                              "h-5 w-5 transition-all",
                              !isExpanded && "mx-auto"
                            )} />
                            {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <SidebarSeparator />
        </>
      )}

      {/* HR MANAGEMENT Section - Only show if HRMS module is enabled */}
      {hasHRMS && (
        <>
          <Collapsible open={sections.hrManagement} onOpenChange={() => toggleSection('hrManagement')}>
            <SidebarGroup>
              {isExpanded && (
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/30 rounded-sm transition-colors flex items-center justify-between group">
                    <span>HR Management</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {hrManagementNavItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          className={cn(
                            "relative transition-all duration-200",
                            "hover:bg-sidebar-accent/50",
                            isActive(item.url) && [
                              "bg-primary/10",
                              "text-primary",
                              "font-medium",
                              isExpanded && "border-l-4 border-primary"
                            ]
                          )}
                        >
                          <NavLink to={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className={cn(
                              "h-5 w-5 transition-all",
                              !isExpanded && "mx-auto"
                            )} />
                            {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
          <SidebarSeparator />
        </>
      )}

      {/* MANAGEMENT Section */}
      <Collapsible open={sections.management} onOpenChange={() => toggleSection('management')}>
        <SidebarGroup>
          {isExpanded && (
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/30 rounded-sm transition-colors flex items-center justify-between group">
                <span>Management</span>
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementNavItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={cn(
                        "relative transition-all duration-200",
                        "hover:bg-sidebar-accent/50",
                        isActive(item.url) && [
                          "bg-primary/10",
                          "text-primary",
                          "font-medium",
                          isExpanded && "border-l-4 border-primary"
                        ]
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={cn(
                          "h-5 w-5 transition-all",
                          !isExpanded && "mx-auto"
                        )} />
                        {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <SidebarSeparator />

      {/* INTEGRATIONS & INTELLIGENCE Section */}
      <Collapsible open={sections.integrations} onOpenChange={() => toggleSection('integrations')}>
        <SidebarGroup>
          {isExpanded && (
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/30 rounded-sm transition-colors flex items-center justify-between group">
                <span>Integration & Intelligence</span>
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {integrationsNavItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={cn(
                        "relative transition-all duration-200",
                        "hover:bg-sidebar-accent/50",
                        isActive(item.url) && [
                          "bg-primary/10",
                          "text-primary",
                          "font-medium",
                          isExpanded && "border-l-4 border-primary"
                        ]
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={cn(
                          "h-5 w-5 transition-all",
                          !isExpanded && "mx-auto"
                        )} />
                        {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* SYSTEM Section */}
      <Collapsible open={sections.system} onOpenChange={() => toggleSection('system')}>
        <SidebarGroup>
          {isExpanded && (
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-sidebar-accent/30 rounded-sm transition-colors flex items-center justify-between group">
                <span>System</span>
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemNavItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className={cn(
                        "relative transition-all duration-200",
                        "hover:bg-sidebar-accent/50",
                        isActive(item.url) && [
                          "bg-primary/10",
                          "text-primary",
                          "font-medium",
                          isExpanded && "border-l-4 border-primary"
                        ]
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={cn(
                          "h-5 w-5 transition-all",
                          !isExpanded && "mx-auto"
                        )} />
                        {isExpanded && <span className="transition-opacity duration-200">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      {/* Recent Records Section */}
      {recentRecords.length > 0 && (
        <>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="transition-opacity duration-200">Recent</span>
              <button
                onClick={clearRecentRecords}
                className="ml-auto text-[10px] hover:text-foreground transition-colors"
                title="Clear recent items"
              >
                Clear
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentRecords.map((record) => {
                  const Icon =
                    record.type === 'candidate' ? Users :
                      record.type === 'job' ? Briefcase :
                        Building2;

                  const typeLabel =
                    record.type === 'candidate' ? 'Candidate' :
                      record.type === 'job' ? 'Job' :
                        'Employer';

                  return (
                    <SidebarMenuItem key={`recent-${record.id}`}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === record.url}
                        className={cn(
                          "transition-all duration-200 hover:bg-sidebar-accent/40",
                          location.pathname === record.url && "bg-primary/10 text-primary"
                        )}
                      >
                        <NavLink to={record.url} className="flex items-center gap-2 w-full">
                          <Icon className={cn(
                            "h-4 w-4",
                            !isExpanded && "mx-auto"
                          )} />
                          {isExpanded && (
                            <div className="flex-1 min-w-0 transition-opacity duration-200">
                              <div className="text-sm font-medium truncate">
                                {record.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {typeLabel}
                              </div>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}
    </SidebarContent>

    <SidebarFooter className="border-t border-sidebar-border p-3 bg-gradient-to-t from-sidebar-accent/30 to-transparent">
      <SidebarFooterContent />
    </SidebarFooter>
  </Sidebar>;
}