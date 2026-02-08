/**
 * Step 5 (Simple flow): Review summary and finish.
 */
import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { JobRole } from '@/shared/types/job';
import { HiringTeamMember } from '@/shared/types/job';
import { JobRound } from '@/shared/lib/jobRoundService';

interface SetupReviewCardProps {
  managementType: 'self-managed' | 'hrm8-managed' | null;
  setupType: 'simple' | 'advanced' | null;
  roles: JobRole[];
  team: HiringTeamMember[];
  rounds: JobRound[];
  onDone: () => void;
  onBack: () => void;
  saving?: boolean;
}

export function SetupReviewCard({
  managementType,
  setupType,
  roles,
  team,
  rounds,
  onDone,
  onBack,
  saving = false,
}: SetupReviewCardProps) {
  const customRounds = rounds.filter((r) => !r.isFixed);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div>
        <h3 className="text-xl font-bold">Review</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Confirm your setup. You can change team and rounds later from the job detail page.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-32">Management</span>
          <span className="font-medium capitalize">{managementType?.replace('-', ' ') ?? '—'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-32">Flow</span>
          <span className="font-medium capitalize flex items-center gap-1">
            {setupType === 'simple' && <Zap className="h-4 w-4" />}
            {setupType ?? '—'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-32">Job roles</span>
          <span className="font-medium">{roles.length} roles</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-32">Team</span>
          <span className="font-medium">{team.length} members</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground w-32">Rounds</span>
          <span className="font-medium">{customRounds.length} custom rounds</span>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onDone} className="gap-2 flex-1" size="lg" disabled={saving}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          Done
        </Button>
      </div>
    </div>
  );
}
