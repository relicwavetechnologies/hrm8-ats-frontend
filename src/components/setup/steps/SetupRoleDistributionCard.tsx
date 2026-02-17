/**
 * Step 3: Distribute Roles to Team
 * Matrix UI for assigning roles to team members via checkboxes.
 */
import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowRight, Loader2, AlertCircle, ArrowLeft, UserCheck } from 'lucide-react';
import { JobRole, HiringTeamMember } from '@/shared/types/job';
import { jobService } from '@/shared/lib/jobService';
import { useToast } from '@/shared/hooks/use-toast';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';

interface SetupRoleDistributionCardProps {
  jobId: string;
  team: HiringTeamMember[];
  roles: JobRole[];
  onTeamChange: (team: HiringTeamMember[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function SetupRoleDistributionCard({
  jobId,
  team,
  roles,
  onTeamChange,
  onContinue,
  onBack,
}: SetupRoleDistributionCardProps) {
  const { toast } = useToast();
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const handleUpdateMemberRoles = async (memberId: string, roleIds: string[]) => {
    setUpdatingMemberId(memberId);
    try {
      const res = await jobService.updateTeamMemberRoles(jobId, memberId, roleIds);
      if (res.success) {
        onTeamChange(team.map((m) => (m.id === memberId ? { ...m, roles: roleIds } : m)));
        toast({ title: 'Roles updated', description: 'Member roles saved.' });
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

  const toggleMemberRole = (member: HiringTeamMember, roleId: string) => {
    const current = member.roles ?? [];
    const next = current.includes(roleId) ? current.filter((r) => r !== roleId) : [...current, roleId];
    handleUpdateMemberRoles(member.id, next);
  };

  const handleBatchAssign = async (roleId: string) => {
    const roleName = roles.find((r) => r.id === roleId)?.name || 'role';

    // Assign this role to all team members who don't have it
    const updates: Promise<any>[] = [];
    const updatedTeam = team.map((member) => {
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
        title: 'No changes',
        description: `Everyone already has the ${roleName} role.`,
      });
      return;
    }

    try {
      await Promise.all(updates);
      onTeamChange(updatedTeam);
      toast({
        title: 'Batch assigned',
        description: `Assigned ${roleName} to ${updates.length} team member(s).`,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to assign roles',
        variant: 'destructive',
      });
    }
  };

  // Validation: at least 1 Hiring Manager
  const hiringManagerRole = roles.find((r) => r.name === 'Hiring Manager');
  const hasHiringManager = hiringManagerRole
    ? team.some((m) => (m.roles ?? []).includes(hiringManagerRole.id))
    : true; // If no Hiring Manager role exists, skip validation

  const canContinue = hasHiringManager;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h3 className="text-xl font-bold">Distribute Roles</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Assign roles to team members. Each member can have multiple roles. At least one person must be assigned as Hiring Manager.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium uppercase text-muted-foreground">Role Assignment Matrix</Label>

          {/* Batch Operations */}
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
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
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
                        <AvatarFallback className="text-xs">
                          {(member.name || member.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.name || member.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {team.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No team members added yet. Go back to add team members first.</p>
          </div>
        )}
      </Card>

      {/* Validation Messages */}
      {!canContinue && team.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Required role missing</p>
            <p className="text-sm text-muted-foreground mt-1">
              At least one team member must be assigned as <strong>Hiring Manager</strong> to continue.
            </p>
          </div>
        </div>
      )}

      {canContinue && team.length > 0 && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-4 flex items-start gap-2">
          <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Role distribution complete</p>
            <p className="text-sm text-muted-foreground mt-1">
              All requirements met. Continue to configure interview rounds.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onContinue} className="gap-2 flex-1" size="lg" disabled={!canContinue}>
          Continue to Configure Rounds <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
