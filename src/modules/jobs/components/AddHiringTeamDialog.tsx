import { useState, useEffect } from "react";
import { HiringTeamMember } from "@/shared/types/job";
import { userService, CompanyUser } from "@/shared/lib/userService";
import { hiringTeamService } from "@/shared/lib/hiringTeamService";
import { toast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/app/providers/AuthContext";
import { extractEmailDomain, doDomainsBelongToSameOrg } from "@/shared/lib/utils/domain";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { ComboboxWithAdd } from "@/shared/components/ui/combobox-with-add";

interface AddHiringTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (member: HiringTeamMember) => void;
  editMember?: HiringTeamMember | null;
  currentUserId?: string;
  jobId?: string | null;
}

export function AddHiringTeamDialog({
  open,
  onOpenChange,
  onAdd,
  editMember,
  currentUserId = 'current-user',
  jobId,
}: AddHiringTeamDialogProps) {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [role, setRole] = useState<HiringTeamMember['role']>('member');
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'existing' | 'invite'>('existing');

  // Helper to get permissions based on role
  const getPermissionsForRole = (r: HiringTeamMember['role']) => {
    switch (r) {
      case 'admin':
        return {
          canViewApplications: true,
          canShortlist: true,
          canScheduleInterviews: true,
          canMakeOffers: true,
        };
      case 'shortlisting':
        return {
          canViewApplications: true,
          canShortlist: true,
          canScheduleInterviews: false,
          canMakeOffers: false,
        };
      case 'member':
      default:
        return {
          canViewApplications: true,
          canShortlist: false,
          canScheduleInterviews: false,
          canMakeOffers: false,
        };
    }
  };

  // Get company domain from current user's email
  const companyDomain = user?.email ? extractEmailDomain(user.email) : '';

  // Fetch company users when dialog opens
  useEffect(() => {
    if (open && !loadingUsers) {
      setLoadingUsers(true);
      userService
        .getCompanyUsers()
        .then((users) => {
          // Filter out the current user from the list
          const filteredUsers = currentUserId 
            ? users.filter(user => user.id !== currentUserId)
            : users;
          setCompanyUsers(filteredUsers);
        })
        .catch((error) => {
          console.error('Failed to fetch company users:', error);
          toast({
            title: 'Error',
            description: 'Failed to load company users',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [open, currentUserId]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editMember) {
      if (editMember.userId) {
        // Existing user - switch to existing tab
        setActiveTab('existing');
        const user = companyUsers.find(u => u.id === editMember.userId);
        if (user) {
          setSelectedUserId(`${user.name} (${user.email})`);
        }
        // Clear invite fields
        setInviteEmail('');
        setInviteName('');
      } else {
        // Invited user - switch to invite tab
        setActiveTab('invite');
        setInviteEmail(editMember.email);
        setInviteName(editMember.name);
        // Clear existing user selection
        setSelectedUserId('');
      }
      // Normalize role to lowercase for UI matching
      const normalizedRole = editMember.role.toLowerCase() as HiringTeamMember['role'];
      // Map legacy roles if necessary, or default to member
      const mappedRole = ['admin', 'shortlisting', 'member'].includes(normalizedRole) 
        ? normalizedRole 
        : 'member';
      
      setRole(mappedRole);
    } else {
      // Not editing - reset form
      resetForm();
      setActiveTab('existing');
    }
  }, [editMember, companyUsers]);

  const resetForm = () => {
    setSelectedUserId('');
    setInviteEmail('');
    setInviteName('');
    setRole('member');
    setEmailError('');
  };

  const handleAddExisting = () => {
    const permissions = getPermissionsForRole(role);

    // When editing, use the original user data
    if (editMember && editMember.userId) {
      const user = companyUsers.find((u) => u.id === editMember.userId);
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive',
        });
        return;
      }

      // Preserve original user data, only update role and permissions
      const member: HiringTeamMember = {
        id: editMember.id,
        userId: editMember.userId, // Preserve original userId
        email: editMember.email, // Preserve original email
        name: editMember.name, // Preserve original name
        role,
        permissions,
        status: editMember.status,
        addedBy: editMember.addedBy,
        invitedAt: editMember.invitedAt,
      };

      onAdd(member);
      resetForm();
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      });
      return;
    }

    // For new members, require user selection
    const selectedLabel = selectedUserId;
    const user = companyUsers.find((u) => `${u.name} (${u.email})` === selectedLabel);
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    const member: HiringTeamMember = {
      id: `member-${Date.now()}`,
      userId: user.id,
      email: user.email,
      name: user.name,
      role,
      permissions,
      status: 'active',
      addedBy: currentUserId,
    };

    onAdd(member);
    resetForm();
    onOpenChange(false);
  };

  // Validate email domain on change
  useEffect(() => {
    if (!inviteEmail || !companyDomain) {
      setEmailError('');
      return;
    }

    try {
      const inviteeDomain = extractEmailDomain(inviteEmail);
      const domainsMatch = doDomainsBelongToSameOrg(inviteeDomain, companyDomain);
      
      if (!domainsMatch) {
        setEmailError(`Email must be from your company domain (${companyDomain})`);
      } else {
        setEmailError('');
      }
    } catch (error) {
      setEmailError('Invalid email format');
    }
  }, [inviteEmail, companyDomain]);

  const handleInviteNew = async () => {
    if (!inviteEmail || !inviteName) return;

    // Validate domain before sending
    if (emailError) {
      toast({
        title: 'Invalid Email Domain',
        description: emailError,
        variant: 'destructive',
      });
      return;
    }

    if (!companyDomain) {
      toast({
        title: 'Error',
        description: 'Unable to determine company domain',
        variant: 'destructive',
      });
      return;
    }

    const permissions = getPermissionsForRole(role);

    // If editing an existing invited member, just update local state
    // Preserve original email/name, only update role and permissions
    if (editMember && editMember.status === 'pending_invite') {
    const member: HiringTeamMember = {
        id: editMember.id,
        email: editMember.email, // Preserve original email
        name: editMember.name, // Preserve original name
        role,
        permissions,
        status: editMember.status,
        invitedAt: editMember.invitedAt,
        addedBy: editMember.addedBy,
      };

      onAdd(member);
      resetForm();
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      });
      return;
    }

    // For new invitations, need jobId
    if (!jobId) {
      toast({
        title: 'Error',
        description: 'Job must be saved before inviting team members',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Send invitation via API only for new invites
      await hiringTeamService.inviteMember(jobId, {
      email: inviteEmail,
      name: inviteName,
      role: role.toUpperCase() as any,
      permissions,
      });

      // Add to local state
      const member: HiringTeamMember = {
        id: editMember?.id || `member-${Date.now()}`,
        email: editMember?.email || inviteEmail, // Preserve original email when editing
        name: editMember?.name || inviteName, // Preserve original name when editing
        role,
        permissions,
      status: editMember?.status || 'pending_invite',
      invitedAt: editMember?.invitedAt || new Date().toISOString(),
      addedBy: editMember?.addedBy || currentUserId,
    };

    onAdd(member);
    resetForm();
    onOpenChange(false);
      
      toast({
        title: 'Success',
        description: editMember ? 'Team member updated successfully' : 'Invitation sent successfully',
      });
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const userOptions = companyUsers.map((user) => `${user.name} (${user.email})`);

  // Shared Role Selection UI
  const RoleSelection = () => (
    <div className="space-y-3">
      <Label>Role</Label>
      <RadioGroup value={role} onValueChange={(value) => setRole(value as HiringTeamMember['role'])}>
        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" key="role-admin">
          <RadioGroupItem value="admin" id="role-admin" className="mt-1" />
          <Label htmlFor="role-admin" className="cursor-pointer font-normal grid gap-1">
            <span className="font-semibold">Admin</span>
            <span className="text-xs text-muted-foreground">Full access to manage job, team, and candidates</span>
          </Label>
        </div>
        
        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" key="role-shortlisting">
          <RadioGroupItem value="shortlisting" id="role-shortlist" className="mt-1" />
          <Label htmlFor="role-shortlist" className="cursor-pointer font-normal grid gap-1">
            <span className="font-semibold">Shortlisting</span>
            <span className="text-xs text-muted-foreground">Can view applications and shortlist candidates</span>
          </Label>
        </div>
        
        <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" key="role-member">
          <RadioGroupItem value="member" id="role-member" className="mt-1" />
          <Label htmlFor="role-member" className="cursor-pointer font-normal grid gap-1">
            <span className="font-semibold">Member</span>
            <span className="text-xs text-muted-foreground">View applications only</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          <DialogDescription>
            {editMember ? 'Update team member role' : 'Add members to the hiring team'}
          </DialogDescription>
        </DialogHeader>

        {editMember ? (
          // When editing, show content directly without tabs
          <div className="space-y-6 pt-4">
            {editMember.userId ? (
              // Editing existing user
              <div className="space-y-2">
                <Label>User</Label>
                <div className="p-3 border rounded-lg bg-muted">
                  <p className="font-medium">{editMember.name}</p>
                  <p className="text-sm text-muted-foreground">{editMember.email}</p>
                </div>
              </div>
            ) : (
              // Editing invited user
              <>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="p-3 border rounded-lg bg-muted">
                    <p className="font-medium">{editMember.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="p-3 border rounded-lg bg-muted">
                    <p className="font-medium">{editMember.name}</p>
                  </div>
                </div>
              </>
            )}

            <RoleSelection />

            {/* Update Button */}
            <Button
              onClick={editMember.userId ? handleAddExisting : handleInviteNew}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Team Member'}
            </Button>
          </div>
        ) : (
          // When adding new, show tabs
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'existing' | 'invite')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Users</TabsTrigger>
            <TabsTrigger value="invite">Invite New User</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <ComboboxWithAdd
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                options={userOptions}
                placeholder="Search users..."
                emptyText="No users found"
                disabled={!!editMember} // Disable when editing
              />
            </div>

            <RoleSelection />

            <Button
              onClick={handleAddExisting}
              disabled={!selectedUserId || loadingUsers}
              className="w-full"
            >
              {loadingUsers ? 'Loading...' : editMember ? 'Update Team Member' : 'Add Team Member'}
            </Button>
          </TabsContent>

          <TabsContent value="invite" className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder={`user@${companyDomain || 'company.com'}`}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={emailError ? 'border-destructive' : ''}
                  disabled={!!editMember} // Disable when editing
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-name">Full Name</Label>
                <Input
                  id="invite-name"
                  placeholder="John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  disabled={!!editMember} // Disable when editing
                />
              </div>
            </div>

            <RoleSelection />

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              User will receive an email invitation to join the platform and this hiring team.
            </div>

            <Button
              onClick={handleInviteNew}
              disabled={!inviteEmail || !inviteName || loading || !jobId || !!emailError}
              className="w-full"
            >
              {loading ? 'Sending...' : editMember ? 'Update Member' : 'Send Invite'}
            </Button>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
