/**
 * Step 1: Create Roles
 * Display default roles and allow adding custom roles for the job.
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowRight, Loader2, AlertCircle, RefreshCw, Plus, X } from 'lucide-react';
import { JobRole } from '@/shared/types/job';
import { jobService } from '@/shared/lib/jobService';
import { useToast } from '@/shared/hooks/use-toast';

const MAX_ROLES = 20;

interface SetupRolesCardProps {
  jobId: string;
  roles: JobRole[];
  onRolesChange: (roles: JobRole[]) => void;
  onContinue: () => void;
}

export function SetupRolesCard({
  jobId,
  roles,
  onRolesChange,
  onContinue,
}: SetupRolesCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const loadRoles = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rolesRes = await jobService.getJobRoles(jobId);
      if (!rolesRes.success) {
        const msg = rolesRes.error ?? 'Failed to load roles';
        const isUnauth = typeof msg === 'string' && (msg.includes('401') || msg.toLowerCase().includes('unauthorized'));
        setLoadError(isUnauth ? 'Please sign in to continue.' : msg);
        return;
      }
      const rolesList = (rolesRes.data as { roles?: JobRole[] })?.roles ?? [];
      onRolesChange(rolesList);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load roles';
      setLoadError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [jobId, onRolesChange, toast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleCreateRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;

    // Validation: check for duplicates
    if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      toast({
        title: 'Duplicate role',
        description: 'A role with this name already exists.',
        variant: 'destructive',
      });
      return;
    }

    // Validation: max roles
    if (roles.length >= MAX_ROLES) {
      toast({
        title: 'Maximum roles reached',
        description: `You can only have ${MAX_ROLES} roles per job.`,
        variant: 'destructive',
      });
      return;
    }

    setCreatingRole(true);
    try {
      const res = await jobService.createJobRole(jobId, { name });
      if (res.success && res.data?.role) {
        onRolesChange([...roles, res.data.role]);
        setNewRoleName('');
        toast({ title: 'Role added', description: `"${name}" is now available.` });
      } else {
        throw new Error(res.error || 'Failed to create role');
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to add role',
        variant: 'destructive',
      });
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    // Don't allow deleting default roles
    if (role.isDefault) {
      toast({
        title: 'Cannot delete',
        description: 'Default roles cannot be removed.',
        variant: 'destructive',
      });
      return;
    }

    setDeletingRoleId(roleId);
    try {
      const res = await jobService.deleteJobRole(jobId, roleId);
      if (res.success) {
        onRolesChange(roles.filter((r) => r.id !== roleId));
        toast({ title: 'Role removed', description: `"${role.name}" has been deleted.` });
      } else {
        throw new Error(res.error || 'Failed to delete role');
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete role',
        variant: 'destructive',
      });
    } finally {
      setDeletingRoleId(null);
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
            <p className="font-medium">Could not load roles</p>
          </div>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => loadRoles()} className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const defaultRoles = roles.filter((r) => r.isDefault);
  const customRoles = roles.filter((r) => !r.isDefault);
  const canAddMore = roles.length < MAX_ROLES;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div>
        <h3 className="text-xl font-bold">Create Roles</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Define the roles that will participate in your hiring process. You'll assign these roles to team members in the next step.
        </p>
      </div>

      {/* Default Roles */}
      <Card className="p-5 space-y-4">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Default Roles</Label>
        <p className="text-sm text-muted-foreground">
          These roles are created automatically for every job and cannot be removed.
        </p>
        <div className="flex flex-wrap gap-2">
          {defaultRoles.map((role) => (
            <Badge key={role.id} variant="secondary" className="font-normal px-3 py-1.5">
              {role.name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Custom Roles */}
      <Card className="p-5 space-y-4">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Custom Roles</Label>
        <p className="text-sm text-muted-foreground">
          Add additional roles specific to your hiring process. You can add up to {MAX_ROLES} roles total.
        </p>

        {customRoles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customRoles.map((role) => (
              <Badge
                key={role.id}
                variant="outline"
                className="font-normal px-3 py-1.5 gap-1.5 group"
              >
                {role.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRole(role.id)}
                  disabled={deletingRoleId === role.id}
                  className="ml-1 h-5 w-5 p-0 hover:text-destructive transition-colors disabled:opacity-50"
                  aria-label={`Remove ${role.name}`}
                >
                  {deletingRoleId === role.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {canAddMore && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter role name (e.g., Technical Lead)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateRole();
                }
              }}
              disabled={creatingRole}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-1 shrink-0"
              disabled={!newRoleName.trim() || creatingRole}
              onClick={handleCreateRole}
            >
              {creatingRole ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add Role
            </Button>
          </div>
        )}

        {!canAddMore && (
          <p className="text-xs text-muted-foreground">
            Maximum number of roles ({MAX_ROLES}) reached.
          </p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={onContinue} className="gap-2" size="lg">
          Continue to Add Team <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
