import { ArrowUpRight, ExternalLink } from "lucide-react";

import { BoardBrandBadge } from "@/shared/components/ui/board-brand-badge";
import { Button } from "@/shared/components/ui/button";
import type { JobOverviewDistributionBoard } from "@/shared/types/job";

type OverviewBoardPerformanceChartProps = {
  boards: JobOverviewDistributionBoard[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function OverviewBoardPerformanceChart({ boards }: OverviewBoardPerformanceChartProps) {
  const maxClicks = Math.max(...boards.map((board) => board.clicks), 1);

  if (boards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No board activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Launch or refresh JobTarget distribution to surface board-level performance here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {boards.map((board) => (
        <div key={`${board.siteName}-${board.viewUrl || "row"}`} className="rounded-xl border border-border/60 bg-muted/[0.12] px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <BoardBrandBadge siteName={board.siteName} size="sm" />
                {board.status ? (
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {board.status.replaceAll("_", " ")}
                  </span>
                ) : null}
              </div>
              <div className="h-2 w-full max-w-[240px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#2b6cb0,#7fb3ff)]"
                  style={{ width: `${Math.max((board.clicks / maxClicks) * 100, board.clicks > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>

            {board.viewUrl ? (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                <a href={board.viewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-background/90 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Clicks</p>
              <p className="mt-1 text-base font-semibold">{board.clicks}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/90 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Applies</p>
              <p className="mt-1 text-base font-semibold">{board.applies}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/90 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Spend</p>
              <p className="mt-1 text-base font-semibold">{formatMoney(board.spend)}</p>
            </div>
          </div>

          {board.easyApply ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
              <ArrowUpRight className="h-3 w-3" />
              Easy Apply
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
