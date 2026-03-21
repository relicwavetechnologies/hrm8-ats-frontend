import type { JobOverviewSourceBreakdownEntry } from "@/shared/types/job";

const SOURCE_COLORS = ["#1f8f76", "#2b6cb0", "#d4a017", "#7c83fd", "#e07a5f", "#64748b"];

type OverviewSourceMixChartProps = {
  total: number;
  breakdown: JobOverviewSourceBreakdownEntry[];
};

export function OverviewSourceMixChart({ total, breakdown }: OverviewSourceMixChartProps) {
  const items = breakdown.filter((entry) => entry.count > 0).slice(0, 6);
  const hasData = total > 0 && items.length > 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No application source data yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Once applications arrive, this chart will split HRM8, JobTarget, manual, and talent sources.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[156px_minmax(0,1fr)] lg:items-center">
      <div className="mx-auto">
        <svg viewBox="0 0 120 120" className="h-[128px] w-[128px]">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="14" />
          {items.map((item, index) => {
            const fraction = item.count / total;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={item.source}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-currentOffset}
                transform="rotate(-90 60 60)"
              />
            );
            currentOffset += dash;
            return circle;
          })}
          <text x="60" y="56" textAnchor="middle" fontSize="12" fill="#64748b">
            Total applies
          </text>
          <text x="60" y="74" textAnchor="middle" fontSize="24" fontWeight="700" fill="#0f172a">
            {total}
          </text>
        </svg>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.source} className="rounded-xl border border-border/60 bg-muted/[0.14] px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }}
                />
                <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
              </div>
              <div className="shrink-0 text-sm font-semibold text-foreground">{item.count}</div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{item.percent}% of total</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(item.percent, item.count > 0 ? 8 : 0)}%`,
                    backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
