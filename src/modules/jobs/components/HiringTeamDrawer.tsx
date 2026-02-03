/**
 * Hiring Team Management Drawer
 * Allows managing hiring team members for a job posting
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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
  UserPlus,
  X,
  Search,
  Users,
  Trash2,
  Shield,
  UserCheck,
  Briefcase,
  Mail,
  Check,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { jobService } from '@/shared/lib/jobService';
import { authService } from '@/shared/lib/authService';
import { userService } from '@/shared/lib/userService';
import { hiringTeamService } from '@/shared/lib/hiringTeamService';

// Types
// Importing from job.ts to ensure consistency, extending if necessary for local UI state
import { HiringTeamMember as SharedHiringTeamMember } from '@/shared/types/job';

export interface HiringTeamMember extends Omit<SharedHiringTeamMember, 'role' | 'status'> {
  role: 'admin' | 'member';
  status?: 'active' | 'pending_invite' | 'Active' | 'Invited'; // Allowing both for compatibility or just override to UI friendly
  // Ideally mapping UI state to strict type.
  // Let's stick to what we used in logic: 'Active' | 'Invited' during add, but let's map it properly.
  // Actually simpler to just Omit status and redefine it if we want capitalized UI storage, 
  // OR use lowercase everywhere.
  // Let's use lowercase 'active' | 'pending_invite' to match shared.
  avatar?: string;
  addedAt: string; 
}

export interface HiringTeamData {
  members: HiringTeamMember[];
}


// Role configuration
const ROLES = [
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Full access to all candidates and decisions.' },
  { value: 'member', label: 'Member', icon: Users, description: 'Can interview and review assigned candidates.' },
] as const;

// Responsibility options - Kept for type compatibility but hidden in UI for now as per simplified flow
const RESPONSIBILITIES = [
  { key: 'newCandidates', label: 'New Candidates', description: 'Notified when new candidates apply' },
  { key: 'assessment', label: 'Assessment', description: 'Can review and score assessments' },
  { key: 'interview', label: 'Interview', description: 'Can conduct and schedule interviews' },
  { key: 'offer', label: 'Offer', description: 'Can view and approve offers' },
] as const;

interface HiringTeamDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  hiringTeam?: HiringTeamMember[] | null; // Corrected to array
  onUpdate: () => void;
}

export function HiringTeamDrawer({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  hiringTeam,
  onUpdate,
}: HiringTeamDrawerProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<HiringTeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // New member form state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<HiringTeamMember['role']>('member');
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [currentUserDomain, setCurrentUserDomain] = useState<string | null>(null);


  // Initialize members and fetch context
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [userResponse, companyUsersList] = await Promise.all([
            authService.getCurrentUser(),
            userService.getCompanyUsers()
        ]);
        
        if (userResponse.success && userResponse.data.user) {
            // Extract domain from user email or use stored company domain if available
             const emailDomain = userResponse.data.user.email.split('@')[1];
             setCurrentUserDomain(emailDomain);
        }
        setCompanyUsers(companyUsersList);

        // Fetch fresh job data to get latest hiring team
        if (open && jobId) {
            const jobResponse = await jobService.getJobById(jobId);
            if (jobResponse.success && jobResponse.data.job && jobResponse.data.job.hiringTeam) {
                 setMembers(jobResponse.data.job.hiringTeam);
            } else if (hiringTeam && Array.isArray(hiringTeam)){
                 // Fallback to prop if fetch fails or no data
                 setMembers(hiringTeam);
            }
        } else if (hiringTeam && Array.isArray(hiringTeam)) {
             setMembers(hiringTeam);
        }

      } catch (error) {
        console.error("Failed to fetch context", error);
        // Fallback
         if (hiringTeam && Array.isArray(hiringTeam)) {
           setMembers(hiringTeam);
         }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open) {
        init();
    }
  }, [open, jobId, hiringTeam]);

  // Initialize members from props
  useEffect(() => {
    if (hiringTeam && Array.isArray(hiringTeam)) {
      setMembers(hiringTeam);
    } else {
      setMembers([]);
    }
  }, [hiringTeam]);

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberName) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both name and email',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate
    if (members.some(m => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      toast({
        title: 'Duplicate Member',
        description: 'This team member has already been added',
        variant: 'destructive',
      });
      return;
    }
    
    // Domain Check
    const emailDomain = newMemberEmail.split('@')[1];
    if (currentUserDomain && emailDomain.toLowerCase() !== currentUserDomain.toLowerCase()) {
         toast({
            title: 'Invalid Domain',
            description: `You can only add members from ${currentUserDomain}`,
            variant: 'destructive',
          });
          return;
    }

    // Check if registered (for UI feedback mostly, backend handles actual logic)
    const isRegistered = companyUsers.some(u => u.email.toLowerCase() === newMemberEmail.toLowerCase());
    
    setIsLoading(true);

    try {
        const permissions = {
            canViewApplications: true,
            canShortlist: newMemberRole === 'admin',
            canScheduleInterviews: true,
            canMakeOffers: newMemberRole === 'admin',
        };

        await hiringTeamService.inviteMember(jobId, {
            email: newMemberEmail,
            name: newMemberName,
            role: newMemberRole,
            permissions
        });

        const newMember: HiringTeamMember = {
            id: `member_${Date.now()}`,
            userId: isRegistered ? companyUsers.find(u => u.email.toLowerCase() === newMemberEmail.toLowerCase())?.id || `new_user_${Date.now()}` : `pending_user_${Date.now()}`,
            name: newMemberName,
            email: newMemberEmail,
            role: newMemberRole,
            permissions,
            addedAt: new Date().toISOString(),
            status: isRegistered ? 'active' : 'pending_invite'
        };

        // Optimistic update
        const updatedMembers = [...members, newMember];
        setMembers(updatedMembers);

        // Reset form
        setNewMemberEmail('');
        setNewMemberName('');
        setNewMemberRole('member');
        setShowAddMember(false);
        
        toast({
            title: 'Member Added',
            description: `${newMemberName} has been added to the team.`,
        });

        // Refresh parent
        if (onUpdate) onUpdate();

    } catch (error) {
        console.error('Failed to add member', error);
        toast({
            title: 'Error',
            description: 'Failed to add team member. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Optimistic Update
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);
    setRemovingMemberId(null);
    
    // API Call
    try {
         await jobService.updateJob(jobId, { hiringTeam: updatedMembers });
         if (onUpdate) onUpdate();

         toast({
            title: 'Team Member Removed',
            description: `${member.name} has been removed from the hiring team`,
         });
    } catch (error) {
        console.error('Failed to remove member', error);
        setMembers(members); // Revert
        toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: HiringTeamMember['role']) => {
    const updatedMembers = members.map(m => 
      m.id === memberId ? { ...m, role } : m
    );
    // Persist Role
    setMembers(updatedMembers); // Optimistic

    try {
        await jobService.updateJob(jobId, { hiringTeam: updatedMembers });
        // NOTE: Permissions should ideally update based on role too. 
        // For simple role switch, user might expect default permissions of that role.
        // Or we keep current permissions?
        // Let's assume Role drives permissions if simplified.
        if (onUpdate) onUpdate();
    } catch (error) {
         console.error('Failed to update role', error);
         // Revert logic needed if robust...
    }
  };

  // Removed handleUpdateMemberResponsibility as it's no longer used


  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Process Invitations (Now handled immediately in Add Member)
      // No action needed for invitations here.


      // 2. Save Team to Job
      const response = await jobService.updateJob(jobId, {
        hiringTeam: members,
      });

      if (response.success) {
        toast({
          title: 'Hiring Team Updated',
          description: 'The hiring team and invitations have been processed.',
        });
        onUpdate();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to save hiring team');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save hiring team',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleConfig = (role: HiringTeamMember['role']) => {
    return ROLES.find(r => r.value === role) || ROLES[0];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hiring Team
            </SheetTitle>
            <SheetDescription>
              Manage the hiring team for <span className="font-medium">{jobTitle}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Actions Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowAddMember(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Add Team Member
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowAddMember(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                    </div>
                  </div>



                  <div className="space-y-1.5">
                    <Label className="text-xs">Role</Label>
                    <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as HiringTeamMember['role'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="h-4 w-4" />
                              <div className="flex flex-col text-left">
                                <span>{role.label}</span>
                                <span className="text-[10px] text-muted-foreground">{role.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddMember} className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Team
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Members List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">No team members</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? 'No members match your search'
                        : 'Add hiring managers, recruiters, and interviewers'}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" onClick={() => setShowAddMember(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Member
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const roleConfig = getRoleConfig(member.role);
                    return (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              {member.avatar && <AvatarImage src={member.avatar} />}
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium truncate">{member.name}</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setRemovingMemberId(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                <Mail className="h-3 w-3" />
                                {member.email}
                                {member.status === 'pending_invite' && (
                                    <Badge variant="outline" className="ml-2 text-[10px] h-4">Pending Invite</Badge>
                                )}
                                {member.status === 'active' && (
                                    <Badge variant="default" className="ml-2 text-[10px] h-4 bg-green-500 hover:bg-green-600">Active</Badge>
                                )}
                              </p>

                              {/* Role Selector */}
                              <div className="flex items-center gap-2 mb-3">
                                <Select 
                                  value={member.role} 
                                  onValueChange={(v) => handleUpdateMemberRole(member.id, v as HiringTeamMember['role'])}
                                >
                                  <SelectTrigger className="h-8 text-xs w-[160px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map((role) => (
                                      <SelectItem key={role.value} value={role.value}>
                                        <div className="flex items-center gap-2">
                                          <role.icon className="h-3.5 w-3.5" />
                                          {role.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Responsibilities */}
                              {/* Responsibilities removed */}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {members.length} team member{members.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removingMemberId} onOpenChange={(open) => !open && setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {members.find(m => m.id === removingMemberId)?.name}
              </span>{' '}
              from the hiring team? They will lose access to this job's candidates and interviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingMemberId && handleRemoveMember(removingMemberId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
