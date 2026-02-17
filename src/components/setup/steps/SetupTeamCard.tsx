/**
 * Step 2: Add/Invite Team Members
 * Add team members without role assignment (roles are assigned in Step 3).
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Users,
  Check,
  ChevronsUpDown,
  X,
  ArrowLeft,
} from 'lucide-react';
import { HiringTeamMember } from '@/shared/types/job';
import { jobService } from '@/shared/lib/jobService';
import { getEmployees as getEmployeesFromApi } from '@/modules/employees/apiService';
import { getEmployees as getEmployeesFromStorage } from '@/shared/lib/employeeStorage';
import { userService, CompanyUser } from '@/shared/lib/userService';
import { useToast } from '@/shared/hooks/use-toast';
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

interface SetupTeamCardProps {
  jobId: string;
  team: HiringTeamMember[];
  onTeamChange: (team: HiringTeamMember[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function SetupTeamCard({
  jobId,
  team,
  onTeamChange,
  onContinue,
  onBack,
}: SetupTeamCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [selectedCompanyUserId, setSelectedCompanyUserId] = useState<string | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Load current team
      const teamRes = await jobService.getHiringTeam(jobId);
      if (!teamRes.success) {
        const msg = teamRes.error ?? 'Failed to load team';
        const isUnauth = typeof msg === 'string' && (msg.includes('401') || msg.toLowerCase().includes('unauthorized'));
        setLoadError(isUnauth ? 'Please sign in to continue.' : msg);
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
              toCompanyUser({ id: e.id, email: e.email, firstName: e.firstName, lastName: e.lastName, createdAt: e.createdAt })
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
  }, [jobId, onTeamChange, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isInTeam = (email: string, userId?: string) =>
    team.some((m) => m.email?.toLowerCase() === email?.toLowerCase() || m.userId === userId);

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
        toast({ title: 'Invited', description: `${invitedEmail} added to team.` });
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to invite', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleAddCompanyUser = async (companyUser: CompanyUser) => {
    if (isInTeam(companyUser.email, companyUser.id)) return;
    setAddingUserId(companyUser.id);
    try {
      const res = await jobService.inviteTeamMember(jobId, {
        email: companyUser.email,
        name: companyUser.name || undefined,
        role: 'MEMBER',
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
        setAddDropdownOpen(false);
      } else throw new Error(res.error);
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add', variant: 'destructive' });
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = team.find((m) => m.id === memberId);
    if (!member) return;

    setRemovingMemberId(memberId);
    try {
      const res = await jobService.removeTeamMember(jobId, memberId);
      if (res.success) {
        onTeamChange(team.filter((m) => m.id !== memberId));
        toast({ title: 'Removed', description: `${member.name || member.email} removed from team.` });
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
            <p className="font-medium">Could not load team</p>
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

  const canContinue = team.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div>
        <h3 className="text-xl font-bold">Add Team Members</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Add people to your hiring team. You'll assign their roles in the next step.
        </p>
      </div>

      {/* Add from Company */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium uppercase text-muted-foreground">Add from Company</Label>
        </div>
        <p className="text-sm text-muted-foreground">Select colleagues to add to the hiring team.</p>
        {companyUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No employees found. Use the email invitation form below to add team members.
          </p>
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
                                handleAddCompanyUser(cu);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 shrink-0',
                                  selectedCompanyUserId === cu.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
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
          </div>
        )}
      </Card>

      {/* Current Team */}
      {team.length > 0 && (
        <Card className="p-5 space-y-4">
          <Label className="text-xs font-medium uppercase text-muted-foreground">Current Team ({team.length})</Label>
          <div className="space-y-2">
            {team.map((member) => (
              <div
                key={member.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  removingMemberId === member.id && 'opacity-50'
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{(member.name || member.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name || member.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                {member.status === 'pending_invite' && (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMemberId === member.id}
                  className="shrink-0"
                >
                  {removingMemberId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invite by Email */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Label className="text-xs font-medium uppercase text-muted-foreground">Invite by Email</Label>
        </div>
        <p className="text-sm text-muted-foreground">Invite someone not in your company list.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="email@company.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInvite();
              }
            }}
          />
          <Input
            placeholder="Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="sm:w-40"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleInvite();
              }
            }}
          />
          <Button onClick={handleInvite} disabled={inviting || !newEmail.includes('@')} size="sm" className="shrink-0">
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
            Invite
          </Button>
        </div>
      </Card>

      {/* Validation Message */}
      {!canContinue && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Add at least one team member to continue.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onContinue} className="gap-2 flex-1" size="lg" disabled={!canContinue}>
          Continue to Assign Roles <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
