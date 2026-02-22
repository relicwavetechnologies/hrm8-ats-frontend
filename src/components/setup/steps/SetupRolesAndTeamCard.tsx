/**
 * Step 3 (Simple flow): Define job roles and hiring team with role assignment.
 * Fetches roles + team from API, allows adding members with roles and updating role assignments.
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Mail, ArrowRight, Loader2, AlertCircle, RefreshCw, UserPlus, Users, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { JobRole, HiringTeamMember } from '@/shared/types/job';
import { jobService } from '@/shared/lib/jobService';
import { getEmployees as getEmployeesFromApi } from '@/modules/employees/apiService';
import { getEmployees as getEmployeesFromStorage } from '@/shared/lib/employeeStorage';
import { userService, CompanyUser } from '@/shared/lib/userService';
import { useToast } from '@/shared/hooks/use-toast';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';

const DEFAULT_PERMISSIONS = {
  canViewApplications: true,
  canShortlist: false,
  canScheduleInterviews: false,
  canMakeOffers: false,
};

/** Simple row: add to team only. Roles are assigned in the Hiring team section below. */
function CompanyUserAddRow({
  companyUser,
  onAdd,
  adding,
}: {
  companyUser: CompanyUser;
  onAdd: (user: CompanyUser, roleIds: string[]) => Promise<void>;
  adding: boolean;
}) {
  return (
    <Button
      size="sm"
      variant="default"
      className="gap-1"
      disabled={adding}
      onClick={() => onAdd(companyUser, [])}
    >
      {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
      Add to team
    </Button>
  );
}

interface SetupRolesAndTeamCardProps {
  jobId: string;
  roles: JobRole[];
  team: HiringTeamMember[];
  onTeamChange: (team: HiringTeamMember[]) => void;
  onRolesLoaded?: (roles: JobRole[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function SetupRolesAndTeamCard({
  jobId,
  roles,
  team,
  onTeamChange,
  onRolesLoaded,
  onContinue,
  onBack,
}: SetupRolesAndTeamCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [selectedCompanyUserId, setSelectedCompanyUserId] = useState<string | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        jobService.getHiringTeam(jobId),
        jobService.getJobRoles(jobId),
      ]);
      if (!teamRes.success || !rolesRes.success) {
        const msg = teamRes.error ?? rolesRes.error ?? 'Request failed';
        const isUnauth = typeof msg === 'string' && (msg.includes('401') || msg.toLowerCase().includes('unauthorized'));
        setLoadError(isUnauth ? 'Please sign in to continue. Setup requires an active session.' : msg);
        return;
      }
      const membersRaw = teamRes.data;
      if (Array.isArray(membersRaw)) {
        const members = (membersRaw as any[]).map((m: any) => ({
          id: m.id,
          userId: m.userId,
          email: m.email,
          name: m.name ?? m.email?.split('@')[0] ?? '',
          role: (m.role ?? 'MEMBER').toLowerCase(),
          roles: m.roles ?? [],
          roleDetails: m.roleDetails,
          permissions: m.permissions ?? DEFAULT_PERMISSIONS,
          status: (m.status ?? 'PENDING').toLowerCase().replace('pending', 'pending_invite'),
          invitedAt: m.invitedAt,
        })) as HiringTeamMember[];
        onTeamChange(members);
      }
      const rolesList = (rolesRes.data as { roles?: JobRole[] })?.roles;
      if (rolesList?.length && onRolesLoaded) {
        onRolesLoaded(rolesList);
      }
      try {
        const toCompanyUser = (e: { id: string; email: string; firstName?: string; lastName?: string; createdAt?: string }) => ({
          id: e.id,
          email: e.email,
          name: `${(e.firstName || '').trim()} ${(e.lastName || '').trim()}`.trim() || e.email,
          role: 'MEMBER',
          status: 'active',
          createdAt: e.createdAt || new Date().toISOString(),
        });
        const byEmail = new Map<string, CompanyUser>();
        try {
          const apiEmployees = await getEmployeesFromApi();
          apiEmployees.forEach((e) => byEmail.set(e.email.toLowerCase(), toCompanyUser(e)));
        } catch {
          try {
            const companyUsersList = await userService.getCompanyUsers();
            companyUsersList.forEach((u) => byEmail.set(u.email.toLowerCase(), { ...u, role: u.role || 'MEMBER', status: u.status || 'active' }));
          } catch {
            // continue
          }
        }
        const storageEmployees = getEmployeesFromStorage();
        storageEmployees.forEach((e) => {
          const key = (e.email || '').toLowerCase();
          if (!key) return;
          if (!byEmail.has(key)) byEmail.set(key, toCompanyUser({ id: e.id, email: e.email, firstName: e.firstName, lastName: e.lastName, createdAt: e.createdAt }));
        });
        setCompanyUsers(Array.from(byEmail.values()));
      } catch {
        setCompanyUsers([]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load team or roles';
      setLoadError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [jobId, onTeamChange, onRolesLoaded, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    setInviting(true);
    try {
      const res = await jobService.inviteTeamMember(jobId, {
        email: newEmail.trim(),
        name: newName.trim() || undefined,
        role: 'MEMBER',
      });
      if (res.success) {
        const invitedEmail = newEmail;
        const teamRes = await jobService.getHiringTeam(jobId);
        if (teamRes.success && Array.isArray(teamRes.data)) {
          const members = (teamRes.data as any[]).map((m: any) => ({
            id: m.id,
            userId: m.userId,
            email: m.email,
            name: m.name ?? m.email?.split('@')[0] ?? '',
            role: (m.role ?? 'MEMBER').toLowerCase(),
            roles: m.roles ?? [],
            roleDetails: m.roleDetails,
            permissions: m.permissions ?? DEFAULT_PERMISSIONS,
            status: (m.status ?? 'PENDING').toLowerCase().replace('pending', 'pending_invite'),
            invitedAt: m.invitedAt,
          })) as HiringTeamMember[];
          onTeamChange(members);
        }
        setNewEmail('');
        setNewName('');
        toast({ title: 'Invited', description: `${invitedEmail} added. Assign roles above.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to invite', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateMemberRoles = async (memberId: string, roleIds: string[]) => {
    setUpdatingMemberId(memberId);
    try {
      const res = await jobService.updateTeamMemberRoles(jobId, memberId, roleIds);
      if (res.success) {
        onTeamChange(team.map((m) => (m.id === memberId ? { ...m, roles: roleIds } : m)));
        toast({ title: 'Roles updated', description: 'Member roles saved.' });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to update roles', variant: 'destructive' });
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const toggleMemberRole = (member: HiringTeamMember, roleId: string) => {
    const current = member.roles ?? [];
    const next = current.includes(roleId) ? current.filter((r) => r !== roleId) : [...current, roleId];
    handleUpdateMemberRoles(member.id, next);
  };

  const handleCreateRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;
    setCreatingRole(true);
    try {
      const res = await jobService.createJobRole(jobId, { name });
      if (res.success && res.data?.role) {
        const rolesRes = await jobService.getJobRoles(jobId);
        if (rolesRes.success && rolesRes.data?.roles && onRolesLoaded) {
          onRolesLoaded(rolesRes.data.roles);
        }
        setNewRoleName('');
        toast({ title: 'Role added', description: `"${name}" is now available to assign.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add role', variant: 'destructive' });
    } finally {
      setCreatingRole(false);
    }
  };

  const isInTeam = (email: string, userId?: string) =>
    team.some((m) => m.email?.toLowerCase() === email?.toLowerCase() || m.userId === userId);

  const getTeamMember = (email: string, userId?: string) =>
    team.find((m) => m.email?.toLowerCase() === email?.toLowerCase() || m.userId === userId);

  const handleAddCompanyUser = async (companyUser: CompanyUser, roleIds: string[]) => {
    if (isInTeam(companyUser.email, companyUser.id)) return;
    setAddingUserId(companyUser.id);
    try {
      const res = await jobService.inviteTeamMember(jobId, {
        email: companyUser.email,
        name: companyUser.name || undefined,
        role: 'MEMBER',
        roles: roleIds.length ? roleIds : undefined,
      });
      if (res.success) {
        const teamRes = await jobService.getHiringTeam(jobId);
        if (teamRes.success && Array.isArray(teamRes.data)) {
          const members = (teamRes.data as any[]).map((m: any) => ({
            id: m.id,
            userId: m.userId,
            email: m.email,
            name: m.name ?? m.email?.split('@')[0] ?? '',
            role: (m.role ?? 'MEMBER').toLowerCase(),
            roles: m.roles ?? [],
            roleDetails: m.roleDetails,
            permissions: m.permissions ?? DEFAULT_PERMISSIONS,
            status: (m.status ?? 'PENDING').toLowerCase().replace('pending', 'pending_invite'),
            invitedAt: m.invitedAt,
          })) as HiringTeamMember[];
          onTeamChange(members);
        }
        toast({ title: 'Added', description: `${companyUser.name || companyUser.email} added to the hiring team.` });
        setSelectedCompanyUserId(null);
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add', variant: 'destructive' });
    } finally {
      setAddingUserId(null);
    }
  };

  if (loading && !loadError) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6 max-w-xl">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">Could not load roles and team</p>
          </div>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => loadData()} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="ghost" size="sm" onClick={onBack}>
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div>
        <h3 className="text-xl font-bold">Roles &amp; team</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Assign job roles to your hiring team. In Simple flow, rounds can auto-assign everyone with a chosen role as interviewers.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Job roles</Label>
        <p className="text-sm text-muted-foreground">Default roles are created with the job. Add custom roles below, then assign them to team members in the Hiring team section.</p>
        <div className="flex flex-wrap items-center gap-2">
          {roles.map((r) => (
            <Badge key={r.id} variant="secondary" className="font-normal">
              {r.name}
            </Badge>
          ))}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Input
              placeholder="Custom role name"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="h-9 max-w-[180px]"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateRole())}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1 shrink-0"
              disabled={!newRoleName.trim() || creatingRole}
              onClick={handleCreateRole}
            >
              {creatingRole ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add role
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium uppercase text-muted-foreground">Add from company</Label>
        </div>
        <p className="text-sm text-muted-foreground">Choose a colleague to add to the hiring team. After adding, assign roles in the &quot;Hiring team (assigned roles)&quot; section below.</p>
        {companyUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No employees found. Ensure your company has users (e.g. from the Employees page), or invite by email below.</p>
        ) : (
          <div className="space-y-3">
            <Popover open={addDropdownOpen} onOpenChange={setAddDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={addDropdownOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className={cn(!selectedCompanyUserId && 'text-muted-foreground truncate')}>
                    {selectedCompanyUserId
                      ? (() => {
                          const u = companyUsers.find((c) => c.id === selectedCompanyUserId);
                          return u ? `${u.name || u.email} (${u.email})` : 'Select colleague...';
                        })()
                      : 'Select a colleague to add...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0" align="start">
                <Command shouldFilter={true} className="rounded-lg border-0">
                  <CommandInput placeholder="Search by name or email..." />
                  <CommandList className="max-h-[280px] min-h-[120px]">
                    <CommandEmpty>
                      {companyUsers.some((cu) => !isInTeam(cu.email, cu.id))
                        ? 'No match. Try searching by name or email.'
                        : 'Everyone is already on the team.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {companyUsers
                        .filter((cu) => !isInTeam(cu.email, cu.id))
                        .map((cu) => {
                          const displayName = cu.name || cu.email;
                          const searchValue = `${cu.id} ${displayName} ${cu.email}`.trim();
                          return (
                            <CommandItem
                              key={cu.id}
                              value={searchValue}
                              onSelect={() => {
                                setSelectedCompanyUserId(cu.id);
                                setAddDropdownOpen(false);
                              }}
                            >
                              <Check className={cn('mr-2 h-4 w-4 shrink-0', selectedCompanyUserId === cu.id ? 'opacity-100' : 'opacity-0')} />
                              <span className="truncate">{displayName}</span>
                              <span className="ml-1 text-muted-foreground truncate">({cu.email})</span>
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCompanyUserId && (() => {
              const cu = companyUsers.find((c) => c.id === selectedCompanyUserId);
              if (!cu || isInTeam(cu.email, cu.id)) return null;
              return (
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{(cu.name || cu.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cu.name || cu.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{cu.email}</p>
                  </div>
                  <CompanyUserAddRow
                    companyUser={cu}
                    onAdd={handleAddCompanyUser}
                    adding={addingUserId === cu.id}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCompanyUserId(null)}>
                    Cancel
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Hiring team (assigned roles)</Label>
        <div className="space-y-3">
          {team.map((member) => (
            <div
              key={member.id}
              className={cn(
                'flex flex-wrap items-center gap-3 p-3 rounded-lg border',
                updatingMemberId === member.id && 'opacity-70'
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback>{(member.name || member.email).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name || member.email}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Label key={role.id} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={(member.roles ?? []).includes(role.id)}
                      onCheckedChange={() => toggleMemberRole(member, role.id)}
                      disabled={updatingMemberId === member.id}
                    />
                    <span className="text-xs">{role.name}</span>
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <Label className="text-xs font-medium uppercase text-muted-foreground">Invite by email</Label>
          <p className="text-sm text-muted-foreground">Invite someone not in your company list. You can assign roles above after they&apos;re added.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="email@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:w-40"
            />
            <Button onClick={handleInvite} disabled={inviting || !newEmail.includes('@')} size="sm" className="shrink-0">
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
              Invite
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} className="gap-2 flex-1" size="lg">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
