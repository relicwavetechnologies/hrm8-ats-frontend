import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import {
  UsersRound,
  UserPlus,
  Search,
  RefreshCw,
  Briefcase,
  Shield,
  UserCheck,
  MoreVertical,
  Clock,
} from "lucide-react";
import { SignupRequestsList } from "@/modules/settings/components/SignupRequestsList";
import { userService, CompanyUser } from "@/shared/lib/userService";
import { jobService } from "@/shared/lib/jobService";
import type { Job } from "@/shared/types/job";
import { cn } from "@/shared/lib/utils";

interface UserJobAssignment {
  jobId: string;
  jobTitle: string;
  status: string;
  roles: string[];
}

interface UserManagementRow extends CompanyUser {
  currentJobs: UserJobAssignment[];
  openJobs: UserJobAssignment[];
  activeJobsCount: number;
  pendingJobsCount: number;
  latestJobTouch?: string;
}

function MiniBarChart({ data }: { data: Array<{ label: string; value: number; tone: string }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[88px_1fr_28px] items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{item.label}</span>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className={cn("h-full rounded", item.tone)} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="text-[11px] text-right text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function MiniDonut({ values }: { values: Array<{ value: number; color: string }> }) {
  const total = Math.max(values.reduce((sum, item) => sum + item.value, 0), 1);
  let cursor = 0;
  const segments = values.map((item) => {
    const start = (cursor / total) * 360;
    cursor += item.value;
    const end = (cursor / total) * 360;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return (
    <div
      className="h-16 w-16 rounded-full"
      style={{ background: `conic-gradient(${segments.join(", ")})` }}
    >
      <div className="m-2 h-12 w-12 rounded-full bg-background border" />
    </div>
  );
}

const normalize = (value?: string | null) => (value || "").toLowerCase().trim();

const normalizeUserStatus = (status?: string) => {
  const s = normalize(status);
  if (s === "active" || s === "verified") return "ACTIVE";
  if (s === "pending" || s === "invited") return "PENDING";
  if (s === "inactive" || s === "disabled") return "INACTIVE";
  return (status || "UNKNOWN").toUpperCase();
};

const statusBadgeClass = (status?: string) => {
  const s = normalizeUserStatus(status);
  if (s === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "INACTIVE") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
};

const roleBadgeClass = (role?: string) => {
  const r = normalize(role);
  if (r.includes("admin")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (r.includes("manager")) return "bg-violet-50 text-violet-700 border-violet-200";
  if (r.includes("recruiter")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const compactDate = (date?: string) => {
  if (!date) return "-";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "-";
  }
};

const parseMemberRoles = (member: any, roleNameById?: Record<string, string>): string[] => {
  const roleDetails = Array.isArray(member?.roleDetails)
    ? member.roleDetails.map((item: any) => String(item?.name || "")).filter(Boolean)
    : [];

  const multiRoles = Array.isArray(member?.roles)
    ? member.roles
      .map((item: any) => {
        const key = String(item || "");
        if (!key) return "";
        return roleNameById?.[key] || key;
      })
      .filter(Boolean)
    : [];

  const singleRole = member?.role ? [String(member.role)] : [];

  const merged = [...roleDetails, ...multiRoles, ...singleRole].filter(Boolean);
  return Array.from(new Set(merged));
};

const jobStatusLabel = (status?: string) => String(status || "unknown").replace(/_/g, " ").toUpperCase();

export default function Users() {
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "PENDING" | "INACTIVE">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const [rows, setRows] = useState<UserManagementRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserManagementRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [users, jobsResponse] = await Promise.all([
          userService.getCompanyUsers(),
          jobService.getJobs({ includeArchived: true, page: 1, limit: 300 }),
        ]);

        const jobs = jobsResponse.data?.jobs || [];
        const openJobs = jobs.filter((job) => normalize(String(job.status)).includes("open"));

        const openJobDeepDataSettled = await Promise.allSettled(
          openJobs.map(async (job) => {
            const [teamRes, rolesRes] = await Promise.all([
              jobService.getHiringTeam(job.id),
              jobService.getJobRoles(job.id),
            ]);

            const teamMembers = teamRes.success && Array.isArray(teamRes.data) ? teamRes.data : [];
            const roles = rolesRes.success ? ((rolesRes.data as { roles?: Array<{ id: string; name: string }> })?.roles || []) : [];
            const roleNameById = roles.reduce<Record<string, string>>((acc, role) => {
              acc[String(role.id)] = String(role.name);
              return acc;
            }, {});

            return {
              jobId: job.id,
              teamMembers,
              roleNameById,
            };
          }),
        );

        const openJobTeamById = new Map<
          string,
          { teamMembers: any[]; roleNameById: Record<string, string> }
        >();
        openJobDeepDataSettled.forEach((result, index) => {
          if (result.status === "fulfilled") {
            openJobTeamById.set(openJobs[index].id, result.value);
          }
        });

        const mapped: UserManagementRow[] = users.map((user) => {
          const userEmail = normalize(user.email);
          const userId = normalize(user.id);
          const userName = normalize(user.name);

          const currentJobs: UserJobAssignment[] = [];

          jobs.forEach((job: Job) => {
            const openJobDeep = openJobTeamById.get(job.id);
            const team = openJobDeep
              ? openJobDeep.teamMembers
              : (Array.isArray(job.hiringTeam) ? job.hiringTeam : []);
            const roleNameById = openJobDeep?.roleNameById || {};

            team.forEach((member: any) => {
              const memberEmail = normalize(member?.email);
              const memberUserId = normalize(member?.userId);
              const memberName = normalize(member?.name);

              const isMatch =
                (memberEmail && memberEmail === userEmail) ||
                (memberUserId && memberUserId === userId) ||
                (memberName && memberName === userName);

              if (!isMatch) return;

              currentJobs.push({
                jobId: job.id,
                jobTitle: job.title,
                status: jobStatusLabel(job.status),
                roles: parseMemberRoles(member, roleNameById),
              });
            });

            const consultantName = normalize(job.assignedConsultantName || "");
            if (consultantName && consultantName === userName) {
              currentJobs.push({
                jobId: job.id,
                jobTitle: job.title,
                status: jobStatusLabel(job.status),
                roles: ["Assigned Consultant"],
              });
            }
          });

          const dedupedJobs = Array.from(
            new Map(
              currentJobs.map((job) => [
                `${job.jobId}::${job.roles.join(",")}`,
                job,
              ]),
            ).values(),
          );

          const activeJobsCount = dedupedJobs.filter((job) => job.status === "OPEN").length;
          const pendingJobsCount = dedupedJobs.filter((job) => job.status === "DRAFT" || job.status === "ON HOLD").length;
          const openJobsForUser = dedupedJobs.filter((job) => job.status === "OPEN");

          return {
            ...user,
            status: normalizeUserStatus(user.status),
            currentJobs: dedupedJobs,
            openJobs: openJobsForUser,
            activeJobsCount,
            pendingJobsCount,
            latestJobTouch: dedupedJobs.length ? user.lastLoginAt || user.createdAt : user.lastLoginAt,
          };
        });

        setRows(mapped);
      } catch (error) {
        console.error("[Users] Failed to load data", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshKey]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      if (row.role) set.add(row.role);
      row.currentJobs.forEach((job) => job.roles.forEach((role) => set.add(role)));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = normalize(search);

    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        normalize(row.name).includes(q) ||
        normalize(row.email).includes(q) ||
        normalize(row.role).includes(q) ||
        row.currentJobs.some((job) => normalize(job.jobTitle).includes(q) || job.roles.some((role) => normalize(role).includes(q)));

      const normalizedStatus = normalizeUserStatus(row.status);
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        normalize(row.role) === normalize(roleFilter) ||
        row.currentJobs.some((job) => job.roles.some((role) => normalize(role) === normalize(roleFilter)));

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [rows, search, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    return {
      totalUsers: rows.length,
      activeUsers: rows.filter((row) => normalizeUserStatus(row.status) === "ACTIVE").length,
      usersOnJobs: rows.filter((row) => row.currentJobs.length > 0).length,
      totalAssignments: rows.reduce((sum, row) => sum + row.currentJobs.length, 0),
    };
  }, [rows]);

  const selectedJobStatusBreakdown = useMemo(() => {
    if (!selectedUser) return [];
    const countMap = selectedUser.currentJobs.reduce<Record<string, number>>((acc, job) => {
      const key = job.status || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(countMap).map(([label, value], index) => ({
      label,
      value,
      tone:
        index % 5 === 0
          ? "bg-blue-500"
          : index % 5 === 1
            ? "bg-emerald-500"
            : index % 5 === 2
              ? "bg-amber-500"
              : index % 5 === 3
                ? "bg-violet-500"
                : "bg-slate-500",
    }));
  }, [selectedUser]);

  const selectedRoleBreakdown = useMemo(() => {
    if (!selectedUser) return [];
    const allRoles = selectedUser.currentJobs.flatMap((job) => job.roles);
    const countMap = allRoles.reduce<Record<string, number>>((acc, role) => {
      const key = role || "Member";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], index) => ({
        label,
        value,
        tone:
          index % 4 === 0
            ? "bg-indigo-500"
            : index % 4 === 1
              ? "bg-cyan-500"
              : index % 4 === 2
                ? "bg-fuchsia-500"
                : "bg-slate-500",
      }));
  }, [selectedUser]);

  return (
    <DashboardPageLayout>
      <div className="p-4 md:p-5 space-y-4">
        <AtsPageHeader
          title="User Management"
          subtitle="Company users, roles, and current job assignments"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </AtsPageHeader>

        <Tabs value={tab} onValueChange={setTab} className="space-y-3">
          <TabsList>
            <TabsTrigger value="active" className="text-xs">
              <UsersRound className="h-3.5 w-3.5 mr-1.5" />
              Active Users
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Access Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Total Users</p><p className="text-lg font-semibold mt-1 leading-none">{stats.totalUsers}</p></CardContent></Card>
              <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Active</p><p className="text-lg font-semibold mt-1 leading-none">{stats.activeUsers}</p></CardContent></Card>
              <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Working on Jobs</p><p className="text-lg font-semibold mt-1 leading-none">{stats.usersOnJobs}</p></CardContent></Card>
              <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Job Assignments</p><p className="text-lg font-semibold mt-1 leading-none">{stats.totalAssignments}</p></CardContent></Card>
            </div>

            <Card className="border-border/80 shadow-none overflow-hidden">
              <CardContent className="p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, email, role, or job"
                      className="h-8 pl-8 text-xs border-border/70"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                        Status: {statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>ACTIVE</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>PENDING</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("INACTIVE")}>INACTIVE</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Shield className="h-3.5 w-3.5 mr-1.5" />
                        Role: {roleFilter === "all" ? "All" : roleFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
                      <DropdownMenuItem onClick={() => setRoleFilter("all")}>All Roles</DropdownMenuItem>
                      {availableRoles.map((role) => (
                        <DropdownMenuItem key={role} onClick={() => setRoleFilter(role)}>
                          {role}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="rounded-md border border-border/70 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/25">
                        <TableHead className="h-8 text-[11px] font-semibold">User</TableHead>
                        <TableHead className="h-8 text-[11px] font-semibold">System Role</TableHead>
                        <TableHead className="h-8 text-[11px] font-semibold">Current Jobs</TableHead>
                        <TableHead className="h-8 text-[11px] font-semibold">Job Roles</TableHead>
                        <TableHead className="h-8 text-[11px] font-semibold">Status</TableHead>
                        <TableHead className="h-8 text-[11px] font-semibold">Last Active</TableHead>
                        <TableHead className="h-8 text-[11px] font-semibold w-[56px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                          <TableRow key={`user-skeleton-${idx}`}>
                            <TableCell colSpan={7} className="h-10"><div className="h-4 w-full rounded bg-muted/60 animate-pulse" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">No users found.</TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row) => {
                          const currentJobs = Array.isArray(row.currentJobs) ? row.currentJobs : [];
                          const allJobRoles = Array.from(new Set(currentJobs.flatMap((job) => (Array.isArray(job.roles) ? job.roles : [])))).slice(0, 3);
                          const remainingRoles = Math.max(
                            Array.from(new Set(currentJobs.flatMap((job) => (Array.isArray(job.roles) ? job.roles : [])))).length - allJobRoles.length,
                            0,
                          );

                          return (
                            <TableRow
                              key={row.id}
                              className="hover:bg-muted/15 border-b border-border/60 cursor-pointer"
                              onClick={() => {
                                setSelectedUser(row);
                                setDrawerOpen(true);
                              }}
                            >
                              <TableCell className="py-2.5">
                                <p className="text-sm font-medium truncate max-w-[200px]">{row.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[220px]">{row.email}</p>
                              </TableCell>

                              <TableCell className="py-2.5">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", roleBadgeClass(row.role))}>
                                  {row.role || "MEMBER"}
                                </Badge>
                              </TableCell>

                              <TableCell className="py-2.5">
                                {currentJobs.length === 0 ? (
                                  <span className="text-xs text-muted-foreground">No active assignments</span>
                                ) : (
                                  <div className="space-y-1">
                                    {currentJobs.slice(0, 2).map((job) => (
                                      <div key={`${row.id}-${job.jobId}`} className="flex items-center gap-1.5">
                                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs truncate max-w-[220px]">{job.jobTitle}</span>
                                        <Badge variant="outline" className="text-[10px] h-4 px-1">{job.status}</Badge>
                                      </div>
                                    ))}
                                    {currentJobs.length > 2 && (
                                      <p className="text-[11px] text-muted-foreground">+{currentJobs.length - 2} more</p>
                                    )}
                                  </div>
                                )}
                              </TableCell>

                              <TableCell className="py-2.5">
                                {allJobRoles.length === 0 ? (
                                  <span className="text-xs text-muted-foreground">-</span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {allJobRoles.map((role) => (
                                      <Badge key={`${row.id}-${role}`} variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                                        {role}
                                      </Badge>
                                    ))}
                                    {remainingRoles > 0 && (
                                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">+{remainingRoles}</Badge>
                                    )}
                                  </div>
                                )}
                              </TableCell>

                              <TableCell className="py-2.5">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", statusBadgeClass(row.status))}>
                                  {normalizeUserStatus(row.status)}
                                </Badge>
                              </TableCell>

                              <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {compactDate(row.lastLoginAt || row.createdAt)}
                                </div>
                              </TableCell>

                              <TableCell className="py-2.5 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled>View User</DropdownMenuItem>
                                    <DropdownMenuItem disabled>Edit Role</DropdownMenuItem>
                                    <DropdownMenuItem disabled>Manage Access</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">Pending Access Requests</h2>
              <p className="text-xs text-muted-foreground">
                Review and approve users who requested to join your company workspace.
              </p>
            </div>
            <SignupRequestsList />
          </TabsContent>
        </Tabs>

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
            {selectedUser ? (() => {
              const selectedCurrentJobs = Array.isArray(selectedUser.currentJobs) ? selectedUser.currentJobs : [];
              const selectedOpenJobs = Array.isArray(selectedUser.openJobs) ? selectedUser.openJobs : [];
              return (
              <div className="h-full flex flex-col">
                <SheetHeader className="px-4 py-3 border-b">
                  <SheetTitle className="text-sm">User Profile Details</SheetTitle>
                </SheetHeader>

                <div className="p-4 space-y-4 overflow-auto">
                  <div className="grid gap-3 md:grid-cols-4">
                    <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Assigned Jobs</p><p className="text-lg font-semibold mt-1 leading-none">{selectedCurrentJobs.length}</p></CardContent></Card>
                    <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Open Jobs</p><p className="text-lg font-semibold mt-1 leading-none">{selectedUser.activeJobsCount}</p></CardContent></Card>
                    <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Pending Jobs</p><p className="text-lg font-semibold mt-1 leading-none">{selectedUser.pendingJobsCount}</p></CardContent></Card>
                    <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Status</p><p className="text-sm font-semibold mt-1">{normalizeUserStatus(selectedUser.status)}</p></CardContent></Card>
                  </div>

                  <Card className="shadow-none border-border/80">
                    <CardContent className="p-3 grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold">User Info</p>
                        <div className="text-xs space-y-1">
                          <p><span className="text-muted-foreground">Name:</span> {selectedUser.name}</p>
                          <p><span className="text-muted-foreground">Email:</span> {selectedUser.email}</p>
                          <p><span className="text-muted-foreground">System Role:</span> {selectedUser.role || "MEMBER"}</p>
                          <p><span className="text-muted-foreground">User ID:</span> {selectedUser.id}</p>
                          <p><span className="text-muted-foreground">Created:</span> {compactDate(selectedUser.createdAt)}</p>
                          <p><span className="text-muted-foreground">Last Login:</span> {compactDate(selectedUser.lastLoginAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold">Assignment Mix (D3-style)</p>
                        <div className="flex items-center gap-3">
                          <MiniDonut
                            values={[
                              { value: selectedUser.activeJobsCount, color: "#16a34a" },
                              { value: selectedUser.pendingJobsCount, color: "#d97706" },
                              {
                                value: Math.max(selectedCurrentJobs.length - selectedUser.activeJobsCount - selectedUser.pendingJobsCount, 0),
                                color: "#64748b",
                              },
                            ]}
                          />
                          <div className="text-[11px] text-muted-foreground space-y-1">
                            <p>Open: {selectedUser.activeJobsCount}</p>
                            <p>Pending: {selectedUser.pendingJobsCount}</p>
                            <p>Other: {Math.max(selectedCurrentJobs.length - selectedUser.activeJobsCount - selectedUser.pendingJobsCount, 0)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="shadow-none border-border/80">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-semibold">Jobs by Status (D3-style)</p>
                        {selectedJobStatusBreakdown.length ? (
                          <MiniBarChart data={selectedJobStatusBreakdown} />
                        ) : (
                          <p className="text-xs text-muted-foreground">No job assignments available.</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="shadow-none border-border/80">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-xs font-semibold">Role Distribution (D3-style)</p>
                        {selectedRoleBreakdown.length ? (
                          <MiniBarChart data={selectedRoleBreakdown} />
                        ) : (
                          <p className="text-xs text-muted-foreground">No role assignments available.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-none border-border/80">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-semibold">Open Jobs (Deep Fetched)</p>
                      <div className="rounded-md border border-border/70 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/25">
                              <TableHead className="h-8 text-[11px] font-semibold">Job</TableHead>
                              <TableHead className="h-8 text-[11px] font-semibold">Status</TableHead>
                              <TableHead className="h-8 text-[11px] font-semibold">Roles</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOpenJobs.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="h-20 text-center text-xs text-muted-foreground">
                                  No open-job assignment found for this user.
                                </TableCell>
                              </TableRow>
                            ) : (
                              selectedOpenJobs.map((job) => (
                                <TableRow key={`${selectedUser.id}-open-${job.jobId}-${(job.roles || []).join(",")}`} className="border-b border-border/60">
                                  <TableCell className="py-2.5">
                                    <p className="text-xs font-medium">{job.jobTitle}</p>
                                    <p className="text-[11px] text-muted-foreground">{job.jobId}</p>
                                  </TableCell>
                                  <TableCell className="py-2.5">
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                      {job.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-2.5">
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(job.roles) && job.roles.length ? (
                                        job.roles.map((role) => (
                                          <Badge key={`${job.jobId}-open-${role}`} variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                                            {role}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-border/80">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-xs font-semibold">Current Job Assignments</p>
                      <div className="rounded-md border border-border/70 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/25">
                              <TableHead className="h-8 text-[11px] font-semibold">Job</TableHead>
                              <TableHead className="h-8 text-[11px] font-semibold">Status</TableHead>
                              <TableHead className="h-8 text-[11px] font-semibold">Roles</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedUser.currentJobs.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="h-20 text-center text-xs text-muted-foreground">
                                  No assigned jobs.
                                </TableCell>
                              </TableRow>
                            ) : (
                              selectedCurrentJobs.map((job) => (
                                <TableRow key={`${selectedUser.id}-${job.jobId}-${(job.roles || []).join(",")}`} className="border-b border-border/60">
                                  <TableCell className="py-2.5">
                                    <p className="text-xs font-medium">{job.jobTitle}</p>
                                    <p className="text-[11px] text-muted-foreground">{job.jobId}</p>
                                  </TableCell>
                                  <TableCell className="py-2.5">
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">{job.status}</Badge>
                                  </TableCell>
                                  <TableCell className="py-2.5">
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(job.roles) && job.roles.length ? (
                                        job.roles.map((role) => (
                                          <Badge key={`${job.jobId}-${role}`} variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                                            {role}
                                          </Badge>
                                        ))
                                      ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              );
            })() : null}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardPageLayout>
  );
}
