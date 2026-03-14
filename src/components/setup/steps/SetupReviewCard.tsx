/**
 * Step 5 (Simple flow): Review summary and finish.
 */
import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DistributionScope, GlobalPublishConfig, HiringTeamMember, JobRole } from '@/shared/types/job';
import { JobRound } from '@/shared/lib/jobRoundService';

interface SetupReviewCardProps {
  managementType: 'self-managed' | 'hrm8-managed' | null;
  setupType: 'simple' | 'advanced' | null;
  roles: JobRole[];
  team: HiringTeamMember[];
  rounds: JobRound[];
  distributionScope: DistributionScope;
  globalPublishConfig: GlobalPublishConfig | null;
  onGlobalPublishConfigChange: (config: GlobalPublishConfig) => void;
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
  distributionScope,
  globalPublishConfig,
  onGlobalPublishConfigChange,
  onDone,
  onBack,
  saving = false,
}: SetupReviewCardProps) {
  const customRounds = rounds.filter((r) => !r.isFixed);
  const defaultEasyApplyConfig = {
    enabled: false,
    type: 'full' as const,
    hostedApply: false,
    questionnaireEnabled: false,
  };
  const effectiveGlobalConfig: GlobalPublishConfig = globalPublishConfig || {
    channels: [],
    budgetTier: 'none',
    customBudget: undefined,
    hrm8ServiceRequiresApproval: managementType !== 'self-managed',
    hrm8ServiceApproved: false,
    easyApplyConfig: defaultEasyApplyConfig,
  };
  const easyApplyConfig = effectiveGlobalConfig.easyApplyConfig || defaultEasyApplyConfig;
  const requiresApproval = distributionScope === 'GLOBAL' && managementType === 'hrm8-managed';
  const approvalMissing = requiresApproval && !effectiveGlobalConfig.hrm8ServiceApproved;

  const updateGlobalConfig = (patch: Partial<GlobalPublishConfig>) => {
    const next: GlobalPublishConfig = {
      ...effectiveGlobalConfig,
      ...patch,
      easyApplyConfig: {
        ...defaultEasyApplyConfig,
        ...easyApplyConfig,
        ...(patch.easyApplyConfig || {}),
      },
    };
    onGlobalPublishConfigChange(next);
  };

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

      {distributionScope === 'GLOBAL' && (
        <Card className="p-5 space-y-4 border-primary/30">
          <div>
            <h4 className="text-base font-semibold">Global Distribution Review</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Configure channels, budget, and Easy Apply before launching JobTarget Marketplace.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Channels</p>
            <div className="grid grid-cols-2 gap-2">
              {['indeed', 'linkedin', 'glassdoor', 'ziprecruiter', 'monster', 'seek'].map((channel) => {
                const checked = effectiveGlobalConfig.channels.includes(channel);
                return (
                  <label key={channel} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        const current = effectiveGlobalConfig.channels || [];
                        const channels = next
                          ? Array.from(new Set([...current, channel]))
                          : current.filter((c) => c !== channel);
                        updateGlobalConfig({ channels });
                      }}
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Budget Tier</p>
              <Select
                value={effectiveGlobalConfig.budgetTier || 'none'}
                onValueChange={(value: GlobalPublishConfig['budgetTier']) => updateGlobalConfig({ budgetTier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No external budget</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {effectiveGlobalConfig.budgetTier === 'custom' && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Custom Budget</p>
                <Input
                  type="number"
                  min={0}
                  value={effectiveGlobalConfig.customBudget ?? ''}
                  onChange={(e) => updateGlobalConfig({
                    customBudget: e.target.value ? Number(e.target.value) : undefined,
                  })}
                  placeholder="Enter custom budget"
                />
              </div>
            )}
          </div>

          {requiresApproval && (
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
              <Checkbox
                checked={!!effectiveGlobalConfig.hrm8ServiceApproved}
                onCheckedChange={(next) => updateGlobalConfig({
                  hrm8ServiceRequiresApproval: true,
                  hrm8ServiceApproved: next === true,
                })}
              />
              <span>I approve the HRM8-managed global distribution plan</span>
            </label>
          )}

          <div className="space-y-3 rounded-md border px-3 py-3">
            <p className="text-sm font-medium">Easy Apply (JobTarget)</p>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={!!easyApplyConfig.enabled}
                onCheckedChange={(next) => updateGlobalConfig({
                  easyApplyConfig: {
                    ...easyApplyConfig,
                    enabled: next === true,
                    hostedApply: next === true ? easyApplyConfig.hostedApply : false,
                    questionnaireEnabled: next === true ? easyApplyConfig.questionnaireEnabled : false,
                  },
                })}
              />
              <span>Enable Easy Apply</span>
            </label>

            {easyApplyConfig.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Type</p>
                  <Select
                    value={easyApplyConfig.type}
                    onValueChange={(value: 'basic' | 'full') => updateGlobalConfig({
                      easyApplyConfig: { ...easyApplyConfig, type: value },
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <label className="flex items-center gap-2 text-sm md:mt-8 cursor-pointer">
                  <Checkbox
                    checked={!!easyApplyConfig.hostedApply}
                    onCheckedChange={(next) => updateGlobalConfig({
                      easyApplyConfig: { ...easyApplyConfig, hostedApply: next === true },
                    })}
                  />
                  <span>Hosted Apply</span>
                </label>

                <label className="flex items-center gap-2 text-sm md:mt-8 cursor-pointer">
                  <Checkbox
                    checked={!!easyApplyConfig.questionnaireEnabled}
                    onCheckedChange={(next) => updateGlobalConfig({
                      easyApplyConfig: { ...easyApplyConfig, questionnaireEnabled: next === true },
                    })}
                  />
                  <span>Use HRM8 questions</span>
                </label>
              </div>
            )}
          </div>

          {approvalMissing && (
            <p className="text-xs text-amber-500">
              Approval is required for GLOBAL + HRM8-managed jobs before completing setup.
            </p>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onDone} className="gap-2 flex-1" size="lg" disabled={saving || approvalMissing}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          Done
        </Button>
      </div>
    </div>
  );
}
