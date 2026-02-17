/**
 * Hiring Team Tab - Drawer-based UX for Team & Role Management
 * Provides smooth interactions for adding members and creating roles
 */
import { useState, useEffect } from 'react';
import { HiringTeamMember, JobRole } from '@/shared/types/job';
import { jobService } from '@/shared/lib/jobService';
import { getEmployees as getEmployeesFromApi } from '@/modules/employees/apiService';
import { getEmployees as getEmployeesFromStorage } from '@/shared/lib/employeeStorage';
import { userService, CompanyUser } from '@/shared/lib/userService';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useToast } from '@/shared/hooks/use-toast';
import {
  UserPlus,
  Trash2,
  Mail,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  ChevronsUpDown,
  UserCheck,
  X,
  Plus,
  Briefcase,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/shared/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

interface HiringTeamTabProps {
  jobId: string;
}

const DEFAULT_PERMISSIONS = {
  canViewApplications: true,
  canShortlist: false,
  canScheduleInterviews: false,
  canMakeOffers: false,
};

export function HiringTeamTab({ jobId }: HiringTeamTabProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<HiringTeamMember[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);

  // Drawer states
  const [addMemberDrawerOpen, setAddMemberDrawerOpen] = useState(false);
  const [createRoleDrawerOpen, setCreateRoleDrawerOpen] = useState(false);

  // Add member states
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [selectedCompanyUserId, setSelectedCompanyUserId] = useState<string | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addMemberTab, setAddMemberTab] = useState<'company' | 'email'>('company');

  // Create role states
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        jobService.getHiringTeam(jobId),
        jobService.getJobRoles(jobId),
      ]);

      if (!teamRes.success || !rolesRes.success) {
        const msg = teamRes.error ?? rolesRes.error ?? 'Request failed';
        setLoadError(msg);
        return;
      }

      const membersRaw = teamRes.data;
      if (Array.isArray(membersRaw)) {
        const membersList = (membersRaw as any[]).map((m: any) => ({
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
        setMembers(membersList);
      }

      const rolesList = (rolesRes.data as { roles?: JobRole[] })?.roles ?? [];
      setRoles(rolesList);

      // Load company users
      try {
        const toCompanyUser = (e: {
          id: string;
          email: string;
          firstName?: string;
          lastName?: string;
          createdAt?: string;
        }) => ({
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
            companyUsersList.forEach((u) =>
              byEmail.set(u.email.toLowerCase(), { ...u, role: u.role || 'MEMBER', status: u.status || 'active' })
            );
          } catch {
            // continue
          }
        }

        const storageEmployees = getEmployeesFromStorage();
        storageEmployees.forEach((e) => {
          const key = (e.email || '').toLowerCase();
          if (!key) return;
          if (!byEmail.has(key))
            byEmail.set(
              key,
              toCompanyUser({
                id: e.id,
                email: e.email,
                firstName: e.firstName,
                lastName: e.lastName,
                createdAt: e.createdAt,
              })
            );
        });

        setCompanyUsers(Array.from(byEmail.values()));
      } catch {
        setCompanyUsers([]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load team';
      setLoadError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId]);

  const isInTeam = (email: string, userId?: string) =>
    members.some((m) => m.email?.toLowerCase() === email?.toLowerCase() || m.userId === userId);

  const handleInvite = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setInviting(true);
    try {
      const res = await jobService.inviteTeamMember(jobId, {
        email: newEmail.trim(),
        name: newName.trim() || undefined,
        role: 'MEMBER',
      });
      if (res.success) {
        await loadData();
        setNewEmail('');
        setNewName('');
        setAddMemberDrawerOpen(false);
        toast({ title: 'Invitation sent', description: `${newEmail} has been added to the team.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to invite', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleAddCompanyUser = async (companyUser: CompanyUser) => {
    if (isInTeam(companyUser.email, companyUser.id)) {
      toast({ title: 'Already in team', description: 'This person is already a team member.', variant: 'destructive' });
      return;
    }

    setAddingUserId(companyUser.id);
    try {
      const res = await jobService.inviteTeamMember(jobId, {
        email: companyUser.email,
        name: companyUser.name || undefined,
        role: 'MEMBER',
      });
      if (res.success) {
        await loadData();
        toast({ title: 'Team member added', description: `${companyUser.name || companyUser.email} has been added.` });
        setSelectedCompanyUserId(null);
        setCompanySearchOpen(false);
        setAddMemberDrawerOpen(false);
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add', variant: 'destructive' });
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;
    const member = members.find((m) => m.id === removingMemberId);
    if (!member) return;

    try {
      const res = await jobService.removeTeamMember(jobId, removingMemberId);
      if (res.success) {
        setMembers(members.filter((m) => m.id !== removingMemberId));
        toast({ title: 'Member removed', description: `${member.name || member.email} has been removed from the team.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  const toggleMemberRole = async (member: HiringTeamMember, roleId: string) => {
    const current = member.roles ?? [];
    const next = current.includes(roleId) ? current.filter((r) => r !== roleId) : [...current, roleId];

    setUpdatingMemberId(member.id);
    try {
      const res = await jobService.updateTeamMemberRoles(jobId, member.id, next);
      if (res.success) {
        setMembers(members.map((m) => (m.id === member.id ? { ...m, roles: next } : m)));
        toast({ title: 'Roles updated', description: 'Member roles have been saved.' });
      } else throw new Error(res.error);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to update roles',
        variant: 'destructive',
      });
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleBatchAssign = async (roleId: string) => {
    const roleName = roles.find((r) => r.id === roleId)?.name || 'role';

    const updates: Promise<any>[] = [];
    const updatedMembers = members.map((member) => {
      const current = member.roles ?? [];
      if (!current.includes(roleId)) {
        const next = [...current, roleId];
        updates.push(jobService.updateTeamMemberRoles(jobId, member.id, next));
        return { ...member, roles: next };
      }
      return member;
    });

    if (updates.length === 0) {
      toast({
        title: 'No changes needed',
        description: `Everyone already has the ${roleName} role.`,
      });
      return;
    }

    try {
      await Promise.all(updates);
      setMembers(updatedMembers);
      toast({
        title: 'Batch assignment complete',
        description: `Assigned ${roleName} to ${updates.length} member(s).`,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to assign roles',
        variant: 'destructive',
      });
    }
  };

  const handleCreateRole = async () => {
    const name = newRoleName.trim();
    if (!name) {
      toast({ title: 'Invalid role name', description: 'Please enter a role name.', variant: 'destructive' });
      return;
    }

    if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: 'Duplicate role', description: 'A role with this name already exists.', variant: 'destructive' });
      return;
    }

    if (roles.length >= 20) {
      toast({ title: 'Maximum roles reached', description: 'You can have up to 20 roles per job.', variant: 'destructive' });
      return;
    }

    setCreatingRole(true);
    try {
      const res = await jobService.createJobRole(jobId, { name });
      if (res.success && res.data?.role) {
        setRoles([...roles, res.data.role]);
        setNewRoleName('');
        setCreateRoleDrawerOpen(false);
        toast({ title: 'Role created', description: `${name} has been added to the roles.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to create role', variant: 'destructive' });
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    if (role.isDefault) {
      toast({ title: 'Cannot delete', description: 'Default roles cannot be deleted.', variant: 'destructive' });
      return;
    }

    try {
      const res = await jobService.deleteJobRole(jobId, roleId);
      if (res.success) {
        setRoles(roles.filter((r) => r.id !== roleId));
        // Remove role from all members
        const updatedMembers = members.map((m) => ({
          ...m,
          roles: (m.roles ?? []).filter((r) => r !== roleId),
        }));
        setMembers(updatedMembers);
        toast({ title: 'Role deleted', description: `${role.name} has been removed.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to delete role', variant: 'destructive' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && !loadError) {
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto py-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">Could not load team data</p>
          </div>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => loadData()} className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Validation
  const hiringManagerRole = roles.find((r) => r.name === 'Hiring Manager');
  const hasHiringManager = hiringManagerRole
    ? members.some((m) => (m.roles ?? []).includes(hiringManagerRole.id))
    : true;

  const availableCompanyUsers = companyUsers.filter((cu) => !isInTeam(cu.email, cu.id));

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hiring Team</h2>
          <p className="text-muted-foreground mt-1">Manage team members and assign per-job roles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCreateRoleDrawerOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
          <Button onClick={() => setAddMemberDrawerOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Roles Overview */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs font-medium uppercase text-muted-foreground">Job Roles</Label>
          </div>
          <Badge variant="secondary" className="text-xs">
            {roles.length} / 20
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
              <span className="text-sm font-medium">{role.name}</span>
              {role.isDefault && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">
                  Default
                </Badge>
              )}
              {!role.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteRole(role.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {roles.length === 0 && <p className="text-sm text-muted-foreground">No roles created yet.</p>}
        </div>
      </Card>

      {/* Role Assignment Matrix */}
      {members.length > 0 && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase text-muted-foreground">
              Team & Role Assignment ({members.length} member{members.length !== 1 ? 's' : ''})
            </Label>

            {/* Batch Operations */}
            {roles.length > 0 && (
              <div className="flex items-center gap-2">
                {roles.slice(0, 3).map((role) => (
                  <Button
                    key={role.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchAssign(role.id)}
                    className="gap-1 text-xs"
                  >
                    <UserCheck className="h-3 w-3" />
                    All as {role.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-sm text-muted-foreground">Team Member</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center p-3 font-medium text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-1">
                        <span>{role.name}</span>
                        {role.isDefault && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            Default
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className={cn(
                      'border-b last:border-0 hover:bg-muted/30 transition-colors',
                      updatingMemberId === member.id && 'opacity-50'
                    )}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(member.name || member.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{member.name || member.email}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            {member.status === 'pending_invite' && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {roles.map((role) => (
                      <td key={role.id} className="p-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={(member.roles ?? []).includes(role.id)}
                            onCheckedChange={() => toggleMemberRole(member, role.id)}
                            disabled={updatingMemberId === member.id}
                            aria-label={`Assign ${role.name} to ${member.name || member.email}`}
                          />
                        </div>
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRemovingMemberId(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Validation Messages */}
          {!hasHiringManager && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Recommended: Assign a Hiring Manager</p>
                <p className="text-sm text-muted-foreground mt-1">
                  At least one team member should have the <strong>Hiring Manager</strong> role.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-xl bg-muted/5">
          <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Add your first team member to start collaborating. They'll be able to review applications and help manage this job.
          </p>
          <Button onClick={() => setAddMemberDrawerOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add First Member
          </Button>
        </div>
      )}

      {/* Add Team Member Drawer */}
      <Sheet open={addMemberDrawerOpen} onOpenChange={setAddMemberDrawerOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Team Member</SheetTitle>
            <SheetDescription>Add colleagues from your company or invite by email.</SheetDescription>
          </SheetHeader>

          <Tabs value={addMemberTab} onValueChange={(v) => setAddMemberTab(v as 'company' | 'email')} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company" className="gap-2">
                <Users className="h-4 w-4" />
                From Company
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Invite by Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="mt-6 space-y-4">
              {availableCompanyUsers.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg bg-muted/5">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {companyUsers.length === 0
                      ? 'No employees found in your company.'
                      : 'All company employees are already on the team.'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Try inviting by email instead.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-2">Select a colleague</Label>
                    <p className="text-xs text-muted-foreground mb-3">Search and add employees from your company.</p>
                  </div>
                  <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={companySearchOpen}
                        className="w-full justify-between font-normal h-auto py-3"
                      >
                        <span className={cn(!selectedCompanyUserId && 'text-muted-foreground')}>
                          {selectedCompanyUserId
                            ? (() => {
                                const u = availableCompanyUsers.find((c) => c.id === selectedCompanyUserId);
                                return u ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-[10px]">{getInitials(u.name || u.email)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                      <p className="text-sm font-medium">{u.name || u.email}</p>
                                      <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                  </div>
                                ) : (
                                  'Select colleague...'
                                );
                              })()
                            : 'Search for a colleague...'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command shouldFilter={true}>
                        <CommandInput placeholder="Search by name or email..." />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>No colleagues found.</CommandEmpty>
                          <CommandGroup>
                            {availableCompanyUsers.map((cu) => {
                              const displayName = cu.name || cu.email;
                              const searchValue = `${cu.id} ${displayName} ${cu.email}`.trim();
                              return (
                                <CommandItem
                                  key={cu.id}
                                  value={searchValue}
                                  onSelect={() => {
                                    setSelectedCompanyUserId(cu.id);
                                    setCompanySearchOpen(false);
                                  }}
                                  className="gap-2"
                                >
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">{getInitials(displayName)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{cu.email}</p>
                                  </div>
                                  <Check className={cn('h-4 w-4', selectedCompanyUserId === cu.id ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedCompanyUserId && (
                    <Button
                      onClick={() => {
                        const user = availableCompanyUsers.find((u) => u.id === selectedCompanyUserId);
                        if (user) handleAddCompanyUser(user);
                      }}
                      disabled={addingUserId !== null}
                      className="w-full gap-2"
                    >
                      {addingUserId ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Add to Team
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="email" className="mt-6 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2">Invite by email</Label>
                <p className="text-xs text-muted-foreground mb-3">Send an invitation to someone not in your company list.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="invite-email" className="text-sm">
                    Email address *
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1.5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInvite();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-name" className="text-sm">
                    Name (optional)
                  </Label>
                  <Input
                    id="invite-name"
                    placeholder="Full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1.5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInvite();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleInvite} disabled={inviting || !newEmail.includes('@')} className="w-full gap-2">
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Create Role Drawer */}
      <Sheet open={createRoleDrawerOpen} onOpenChange={setCreateRoleDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Custom Role</SheetTitle>
            <SheetDescription>Add a custom role for this job. Maximum 20 roles per job.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="role-name" className="text-sm font-medium">
                Role name *
              </Label>
              <Input
                id="role-name"
                placeholder="e.g., Technical Reviewer, Panel Member"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="mt-1.5"
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateRole();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1.5">Choose a descriptive name for the role.</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <Label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">Default Roles (Cannot be deleted)</Label>
              <div className="flex flex-wrap gap-2">
                {roles
                  .filter((r) => r.isDefault)
                  .map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.name}
                    </Badge>
                  ))}
              </div>
            </div>

            {roles.filter((r) => !r.isDefault).length > 0 && (
              <div>
                <Label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">Custom Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {roles
                    .filter((r) => !r.isDefault)
                    .map((role) => (
                      <Badge key={role.id} variant="outline">
                        {role.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button onClick={handleCreateRole} disabled={creatingRole || !newRoleName.trim()} className="w-full gap-2">
              {creatingRole ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating role...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Role
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMemberId} onOpenChange={(open) => !open && setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? They will lose access to this job and all assigned roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
