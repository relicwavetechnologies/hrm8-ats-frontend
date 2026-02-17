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
import { Layers, Plus, ArrowRight, Loader2, Video, FileCheck, Settings2, GripVertical, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { RoundConfigDrawer } from '@/modules/applications/components/RoundConfigDrawer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FIXED_ROUNDS = {
  NEW: { key: 'NEW', name: 'New', description: 'Entry point - all applications start here', color: 'bg-blue-50 dark:bg-blue-950/30', order: 1 },
  OFFER: { key: 'OFFER', name: 'Offer', description: 'Ready to extend job offer', color: 'bg-green-50 dark:bg-green-950/30', order: 999 },
  HIRED: { key: 'HIRED', name: 'Hired', description: 'Candidate accepted the offer', color: 'bg-emerald-50 dark:bg-emerald-950/30', order: 1000 },
  REJECTED: { key: 'REJECTED', name: 'Rejected', description: 'Application was not successful', color: 'bg-red-50 dark:bg-red-950/30', order: 1001 },
} as const;

// Sortable Round Item Component
interface SortableRoundItemProps {
  round: JobRound;
  roles: JobRole[];
  isSimple: boolean;
  onDelete: (roundId: string) => void;
  onConfigure?: (round: JobRound) => void;
  isDeleting: boolean;
}

function SortableRoundItem({ round, roles, isSimple, onDelete, onConfigure, isDeleting }: SortableRoundItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: round.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1">
        {round.type === 'INTERVIEW' ? (
          <Video className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <FileCheck className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{round.name}</p>
          <p className="text-xs text-muted-foreground">
            {round.type === 'INTERVIEW' && round.assignedRoleId
              ? `Interview · Role: ${roles.find((x) => x.id === round.assignedRoleId)?.name ?? round.assignedRoleId}`
              : round.type}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isSimple && onConfigure && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConfigure(round)}
            className="gap-1"
          >
            <Settings2 className="h-4 w-4" />
            Configure
          </Button>
        )}
        <Badge variant={round.type === 'INTERVIEW' ? 'default' : 'secondary'}>
          {round.type}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(round.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface SetupRoundsCardProps {
  jobId: string;
  roles: JobRole[];
  rounds: JobRound[];
  onRoundsChange: (rounds: JobRound[]) => void;
  onContinue: () => void;
  onBack: () => void;
  setupType?: 'simple' | 'advanced';
  jobTitle?: string;
}

export function SetupRoundsCard({
  jobId,
  roles,
  rounds,
  onRoundsChange,
  onContinue,
  onBack,
  setupType,
  jobTitle,
}: SetupRoundsCardProps) {
  const isSimple = setupType === 'simple';
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allRounds, setAllRounds] = useState<JobRound[]>([]);
  const [configRound, setConfigRound] = useState<JobRound | null>(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  /** Simple only: when true = interview round (with role), when false = CUSTOM round (manual) */
  const [interviewKind, setInterviewKind] = useState(true);
  const [type, setType] = useState<JobRoundType>(isSimple ? 'INTERVIEW' : 'ASSESSMENT');
  const [assignedRoleId, setAssignedRoleId] = useState<string>('');
  /** Advanced only */
  const [syncPermissions, setSyncPermissions] = useState(true);
  const [autoMoveOnPass, setAutoMoveOnPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await jobRoundService.getJobRounds(jobId);
        if (cancelled) return;
        if (res.success && res.data?.rounds) {
          const list = res.data.rounds as JobRound[];
          setAllRounds(list);
          onRoundsChange(list.filter((r: JobRound) => !r.isFixed));
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
        ...(!isSimple && { syncPermissions, autoMoveOnPass }),
      });
      if (res.success && res.data?.round) {
        onRoundsChange([...rounds, res.data.round]);
        setName('');
        setType(isSimple ? 'INTERVIEW' : 'ASSESSMENT');
        setInterviewKind(true);
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

  const refetchRounds = async () => {
    try {
      const res = await jobRoundService.getJobRounds(jobId);
      if (res.success && res.data?.rounds) {
        const list = res.data.rounds as JobRound[];
        setAllRounds(list);
        onRoundsChange(list.filter((r) => !r.isFixed));
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    setDeletingRoundId(roundId);
    try {
      const res = await jobRoundService.deleteRound(jobId, roundId);
      if (res.success) {
        const updatedRounds = rounds.filter((r) => r.id !== roundId);
        onRoundsChange(updatedRounds);
        toast({ title: 'Round deleted', description: `"${round.name}" has been removed.` });
      } else {
        throw new Error(res.error || 'Failed to delete round');
      }
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to delete round',
        variant: 'destructive',
      });
    } finally {
      setDeletingRoundId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = customRounds.findIndex((r) => r.id === active.id);
    const newIndex = customRounds.findIndex((r) => r.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedRounds = arrayMove(customRounds, oldIndex, newIndex);

    // Update local state immediately for smooth UX
    onRoundsChange(reorderedRounds);

    // Update order in backend
    try {
      // Update each round's order based on new position
      const updates = reorderedRounds.map((round, index) => {
        const newOrder = index + 2; // Start from 2 (NEW is 1, custom rounds are 2+)
        return jobRoundService.updateRound(jobId, round.id, { order: newOrder });
      });

      await Promise.all(updates);
      toast({ title: 'Order updated', description: 'Round sequence saved.' });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to save round order. Please try again.',
        variant: 'destructive',
      });
      // Reload rounds to restore correct order
      refetchRounds();
    }
  };

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
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium uppercase text-muted-foreground">Your Pipeline</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setName('');
              setAssignedRoleId('');
              if (isSimple) {
                setInterviewKind(true);
                setType('INTERVIEW');
              } else {
                setType('ASSESSMENT');
                setSyncPermissions(true);
                setAutoMoveOnPass(false);
              }
              setDialogOpen(true);
            }}
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Add round
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Candidates flow through these stages. Drag custom rounds to reorder them.
        </p>

        <div className="space-y-2">
          {/* 1. NEW - Fixed entry point */}
          <div className={`flex gap-3 p-3 rounded-lg ${FIXED_ROUNDS.NEW.color} border-2 border-dashed`}>
            <div className="flex items-center gap-3 flex-1">
              <Badge variant="outline" className="shrink-0">START</Badge>
              <div>
                <p className="font-medium text-sm">{FIXED_ROUNDS.NEW.name}</p>
                <p className="text-xs text-muted-foreground">{FIXED_ROUNDS.NEW.description}</p>
              </div>
            </div>
          </div>

          {/* 2. Custom Rounds - Draggable */}
          {customRounds.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No custom rounds yet. Click "Add round" to create your interview or assessment stages.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={customRounds.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {customRounds.map((r) => (
                    <SortableRoundItem
                      key={r.id}
                      round={r}
                      roles={roles}
                      isSimple={isSimple}
                      onDelete={handleDeleteRound}
                      onConfigure={!isSimple ? (round) => { setConfigRound(round); setConfigDrawerOpen(true); } : undefined}
                      isDeleting={deletingRoundId === r.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* 3. OFFER - Fixed */}
          <div className={`flex gap-3 p-3 rounded-lg ${FIXED_ROUNDS.OFFER.color} border-2 border-dashed`}>
            <div className="flex items-center gap-3 flex-1">
              <Badge variant="outline" className="shrink-0">FIXED</Badge>
              <div>
                <p className="font-medium text-sm">{FIXED_ROUNDS.OFFER.name}</p>
                <p className="text-xs text-muted-foreground">{FIXED_ROUNDS.OFFER.description}</p>
              </div>
            </div>
          </div>

          {/* 4. HIRED - Fixed */}
          <div className={`flex gap-3 p-3 rounded-lg ${FIXED_ROUNDS.HIRED.color} border-2 border-dashed`}>
            <div className="flex items-center gap-3 flex-1">
              <Badge variant="outline" className="shrink-0">FIXED</Badge>
              <div>
                <p className="font-medium text-sm">{FIXED_ROUNDS.HIRED.name}</p>
                <p className="text-xs text-muted-foreground">{FIXED_ROUNDS.HIRED.description}</p>
              </div>
            </div>
          </div>

          {/* 5. REJECTED - Fixed */}
          <div className={`flex gap-3 p-3 rounded-lg ${FIXED_ROUNDS.REJECTED.color} border-2 border-dashed`}>
            <div className="flex items-center gap-3 flex-1">
              <Badge variant="outline" className="shrink-0">FIXED</Badge>
              <div>
                <p className="font-medium text-sm">{FIXED_ROUNDS.REJECTED.name}</p>
                <p className="text-xs text-muted-foreground">{FIXED_ROUNDS.REJECTED.description}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add round</DialogTitle>
            <DialogDescription>
              {isSimple
                ? 'Add a round. Tick "Interview round" to assign a role and auto-assign interviewers; leave unchecked for a normal stage.'
                : type === 'INTERVIEW'
                  ? 'Create an interview round. Optionally assign a role to auto-assign interviewers.'
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
            {isSimple ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="interview-kind"
                  checked={interviewKind}
                  onCheckedChange={(checked) => {
                    const on = checked === true;
                    setInterviewKind(on);
                    setType(on ? 'INTERVIEW' : 'CUSTOM');
                    if (!on) setAssignedRoleId('');
                  }}
                />
                <Label htmlFor="interview-kind" className="text-sm font-normal cursor-pointer">
                  This is an interview round (assign role to auto-add interviewers)
                </Label>
              </div>
            ) : (
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
            )}
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
            {!isSimple && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sync-permissions"
                    checked={syncPermissions}
                    onCheckedChange={(c) => setSyncPermissions(c === true)}
                  />
                  <Label htmlFor="sync-permissions" className="text-sm font-normal cursor-pointer">
                    All hiring team roles can move / manage in this round
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-move"
                    checked={autoMoveOnPass}
                    onCheckedChange={(c) => setAutoMoveOnPass(c === true)}
                  />
                  <Label htmlFor="auto-move" className="text-sm font-normal cursor-pointer">
                    Auto-move on pass (trigger when candidate passes this round)
                  </Label>
                </div>
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

      <RoundConfigDrawer
        open={configDrawerOpen}
        onOpenChange={(open) => {
          setConfigDrawerOpen(open);
          if (!open) setConfigRound(null);
        }}
        jobId={jobId}
        round={configRound}
        roles={roles}
        jobTitle={jobTitle}
        onSuccess={refetchRounds}
      />
    </div>
  );
}
