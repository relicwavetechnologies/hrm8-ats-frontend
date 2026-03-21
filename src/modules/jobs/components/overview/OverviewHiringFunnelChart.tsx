import type { JobOverviewFunnel } from "@/shared/types/job";

import { cn } from "@/shared/lib/utils";

type OverviewHiringFunnelChartProps = {
  funnel: JobOverviewFunnel;
};

function percent(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

const STAGE_COLORS = ["bg-[#d8efe8]", "bg-[#cfe3f3]", "bg-[#f5edd3]", "bg-[#dfe2fb]"];

export function OverviewHiringFunnelChart({ funnel }: OverviewHiringFunnelChartProps) {
  const maxStageCount = Math.max(...funnel.stages.map((stage) => stage.count), 1);
  const maxRoundCount = Math.max(...funnel.rounds.map((round) => round.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {funnel.stages.map((stage, index) => (
          <div key={stage.key} className="rounded-xl border border-border/60 bg-muted/[0.14] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{stage.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{stage.count}</p>
              </div>
              <div className="rounded-full border border-border/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {percent(stage.count, funnel.totalApplicants)}%
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", STAGE_COLORS[index % STAGE_COLORS.length])}
                style={{ width: `${Math.max((stage.count / maxStageCount) * 100, stage.count > 0 ? 10 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Round occupancy</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {funnel.shortlisted} shortlisted out of {funnel.totalApplicants} total applicants
            </p>
          </div>
          <div className="rounded-full border border-border/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {funnel.rounds.length} rounds configured
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {funnel.rounds.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 px-3 py-5 text-center text-sm text-muted-foreground">
              No rounds configured yet.
            </div>
          ) : (
            funnel.rounds.map((round, index) => (
              <div key={round.roundId} className="grid grid-cols-[minmax(0,150px)_1fr_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{round.label}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {round.fixedKey ? round.fixedKey.replaceAll("_", " ") : `Round ${index + 1}`}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#1f8f76,#7bc8b0)]"
                    style={{ width: `${Math.max((round.count / maxRoundCount) * 100, round.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <div className="rounded-full border border-border/50 px-2.5 py-1 text-xs font-medium text-foreground">
                  {round.count}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
