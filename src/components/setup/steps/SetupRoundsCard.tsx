/**
 * Step 4 (Simple flow): Configure ATS rounds. For INTERVIEW rounds, assign a job role
 * so all team members with that role are auto-assigned as interviewers.
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Layers, Plus, ArrowRight, Loader2, Video, FileCheck } from 'lucide-react';
import { JobRole } from '@/shared/types/job';
import { jobRoundService, JobRound, JobRoundType } from '@/shared/lib/jobRoundService';
import { useToast } from '@/shared/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';

const FIXED_ROUNDS_PREREQ = [
  { key: 'NEW', name: 'New', description: 'New applications land here. You move them manually to the next round.', color: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'OFFER', name: 'Offer', description: 'Ready to extend an offer. Manual step in Simple flow.', color: 'bg-green-50 dark:bg-green-950/30' },
  { key: 'HIRED', name: 'Hired', description: 'Candidate accepted. Final stage.', color: 'bg-emerald-50 dark:bg-emerald-950/30' },
] as const;

interface SetupRoundsCardProps {
  jobId: string;
  roles: JobRole[];
  rounds: JobRound[];
  onRoundsChange: (rounds: JobRound[]) => void;
  onContinue: () => void;
  onBack: () => void;
  setupType?: 'simple' | 'advanced';
}

export function SetupRoundsCard({
  jobId,
  roles,
  rounds,
  onRoundsChange,
  onContinue,
  onBack,
  setupType,
}: SetupRoundsCardProps) {
  const isSimple = setupType === 'simple';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<JobRoundType>(isSimple ? 'INTERVIEW' : 'ASSESSMENT');
  const [assignedRoleId, setAssignedRoleId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await jobRoundService.getJobRounds(jobId);
        if (cancelled) return;
        if (res.success && res.data?.rounds) {
          const list = res.data.rounds.filter((r: JobRound) => !r.isFixed);
          onRoundsChange(list);
        }
      } catch (e) {
        if (!cancelled) toast({ title: 'Error', description: 'Failed to load rounds', variant: 'destructive' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [jobId, onRoundsChange, toast]);

  const handleAddRound = async () => {
    if (!name.trim()) return;
    if (isSimple && type === 'INTERVIEW' && roles.length > 0 && !assignedRoleId) {
      toast({ title: 'Select a role', description: 'In Simple flow, interview rounds require a role for auto-assigning interviewers.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await jobRoundService.createRound(jobId, {
        name: name.trim(),
        type,
        assignedRoleId: type === 'INTERVIEW' && assignedRoleId ? assignedRoleId : undefined,
      });
      if (res.success && res.data?.round) {
        onRoundsChange([...rounds, res.data.round]);
        setName('');
        setType(isSimple ? 'INTERVIEW' : 'ASSESSMENT');
        setAssignedRoleId('');
        setDialogOpen(false);
        toast({ title: 'Round created', description: `"${name.trim()}" added.${type === 'INTERVIEW' && assignedRoleId ? ' Interviewers assigned by role.' : ''}` });
      } else throw new Error(res.error ?? 'Failed to create round');
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to create round', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const customRounds = rounds.filter((r) => !r.isFixed);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div>
        <h3 className="text-xl font-bold">Rounds</h3>
        <p className="text-muted-foreground text-sm mt-1">
          {isSimple
            ? 'Your pipeline includes New, Offer, and Hired. Add interview rounds below and assign a role so your team is auto-assigned as interviewers.'
            : 'Add pipeline rounds. For interview rounds, pick a role to auto-assign interviewers; assessments are available in Advanced flow.'}
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <Label className="text-xs font-medium uppercase text-muted-foreground">Pipeline overview</Label>
        <p className="text-sm text-muted-foreground">Your pipeline always includes these stages:</p>
        <ul className="space-y-2">
          {FIXED_ROUNDS_PREREQ.map((r) => (
            <li key={r.key} className={`flex gap-3 p-3 rounded-lg ${r.color}`}>
              <span className="font-medium text-sm shrink-0">{r.name}</span>
              <span className="text-sm text-muted-foreground">{r.description}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium uppercase text-muted-foreground">Custom rounds</Label>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add round
          </Button>
        </div>
        <div className="space-y-2">
          {customRounds.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No custom rounds yet. Add one to get started.</p>
          ) : (
            customRounds.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                {r.type === 'INTERVIEW' ? (
                  <Video className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <FileCheck className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.type === 'INTERVIEW' && r.assignedRoleId
                      ? `Interview · Role: ${roles.find((x) => x.id === r.assignedRoleId)?.name ?? r.assignedRoleId}`
                      : r.type}
                  </p>
                </div>
                <Badge variant={r.type === 'INTERVIEW' ? 'default' : 'secondary'} className="shrink-0">
                  {r.type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add round</DialogTitle>
            <DialogDescription>
              {type === 'INTERVIEW'
                ? (isSimple ? 'Add an interview round. Choose a role to auto-assign interviewers.' : 'Create an interview round. Optionally assign a role to auto-assign interviewers.')
                : 'Create an assessment round. No interviewer role assignment.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Round name</Label>
              <Input
                placeholder="e.g. Technical Interview, Final Round"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as JobRoundType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'INTERVIEW' && roles.length > 0 && (
              <div className="space-y-2">
                <Label>{isSimple ? 'Assign interviewers by role (required)' : 'Auto-assign interviewers by role'}</Label>
                <Select value={assignedRoleId || '_none_'} onValueChange={(v) => setAssignedRoleId(v === '_none_' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isSimple ? 'Select a role' : 'Optional: select a role'} />
                  </SelectTrigger>
                  <SelectContent>
                    {!isSimple && <SelectItem value="_none_">No auto-assign</SelectItem>}
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRound}
              disabled={submitting || !name.trim() || (isSimple && type === 'INTERVIEW' && roles.length > 0 && !assignedRoleId)}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create round
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
