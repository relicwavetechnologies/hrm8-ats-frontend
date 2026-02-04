import { useState, useEffect } from 'react';
import { HiringTeamMember } from '@/shared/types/job';
import { jobService } from '@/shared/lib/jobService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/hooks/use-toast';
import { UserPlus, Trash2, Mail, Shield, Users } from 'lucide-react';
import { AddHiringTeamDialog } from '../AddHiringTeamDialog';
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

interface HiringTeamTabProps {
  jobId: string;
}

export function HiringTeamTab({ jobId }: HiringTeamTabProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<HiringTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const ROLES = [
    { value: 'admin', label: 'Admin', icon: Shield },
    { value: 'shortlisting', label: 'Shortlisting', icon: Users },
    { value: 'member', label: 'Member', icon: Users },
  ] as const;

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await jobService.getHiringTeam(jobId);
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch hiring team:', error);
      // Fallback: rely on JobDetail's job.hiringTeam if this fails? 
      // Ideally getHiringTeam returns the array.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchTeam();
    }
  }, [jobId]);

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      // Optimistic update
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: role as any } : m));
      
      const res = await jobService.updateTeamMemberRole(jobId, memberId, role.toUpperCase());
      if (!res.success) {
        throw new Error(res.error);
      }
      toast({ title: 'Role Updated', description: 'Team member role has been updated.' });
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
      fetchTeam(); // Revert
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;
    try {
      setMembers(prev => prev.filter(m => m.id !== removingMemberId)); // Optimistic
      await jobService.removeTeamMember(jobId, removingMemberId);
      toast({ title: 'Member Removed', description: 'Team member has been removed.' });
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({ title: 'Error', description: 'Failed to remove member.', variant: 'destructive' });
      fetchTeam();
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleResendInvite = async (memberId: string) => {
    try {
      const res = await jobService.resendInvite(jobId, memberId);
      if (res.success) {
        toast({ title: 'Invite Resent', description: 'Invitation email has been sent again.' });
      } else {
        throw new Error(res.error || 'Failed to resend invite');
      }
    } catch (error) {
       console.error('Failed to resend invite:', error);
       toast({ title: 'Error', description: 'Failed to resend invite.', variant: 'destructive' });
    }
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
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hiring Team</h2>
          <p className="text-muted-foreground mt-1">Manage who has access to this job and candidates.</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="rounded-full px-6">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-muted/5">
          <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Invite your colleagues to collaborate on this job. They'll be able to review applications and leave comments.
          </p>
          <Button variant="outline" onClick={() => setShowAddDialog(true)}>Add First Member</Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="divide-y">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm">{member.name}</span>
                       <Badge 
                         variant={member.status?.toLowerCase().includes('pending') ? 'outline' : 'secondary'} 
                         className={`text-[10px] px-1.5 h-5 rounded-md font-normal ${
                           member.status?.toLowerCase().includes('pending') 
                             ? 'text-amber-600 border-amber-200 bg-amber-50' 
                             : 'text-green-600 bg-green-50'
                         }`}
                       >
                         {member.status === 'ACTIVE' || member.status === 'active' ? 'Active' : 'Pending'}
                       </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1.5" />
                      {member.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="text-xs text-muted-foreground mr-2 group-hover:block hidden">Role:</span>
                    <Select 
                      defaultValue={member.role?.toLowerCase() || 'member'} 
                      onValueChange={(val) => handleUpdateRole(member.id, val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[130px] border-transparent hover:border-input focus:ring-0 bg-transparent hover:bg-background transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center text-xs">
                              <role.icon className="h-3 w-3 mr-2 opacity-70" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    {member.status?.toLowerCase().includes('pending') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full"
                        onClick={() => handleResendInvite(member.id)}
                        title="Resend Invitation"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full" 
                      onClick={() => setRemovingMemberId(member.id)}
                      title="Remove Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddHiringTeamDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onAdd={() => fetchTeam()} 
        jobId={jobId}
      />

      <AlertDialog open={!!removingMemberId} onOpenChange={(open) => !open && setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? They will lose access to this job.
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
