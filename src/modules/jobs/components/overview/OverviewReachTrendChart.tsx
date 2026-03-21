import { useMemo } from "react";

import type { JobCareerMetrics } from "@/shared/types/job";

type OverviewReachTrendChartProps = {
  career: JobCareerMetrics;
  totalAtsApplies: number;
};

type Point = {
  x: number;
  y: number;
};

function buildPath(points: Point[]) {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function buildArea(points: Point[], baseY: number) {
  if (points.length === 0) return "";
  return `${buildPath(points)} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
}

export function OverviewReachTrendChart({ career, totalAtsApplies }: OverviewReachTrendChartProps) {
  const labels = career.trend.labels || [];
  const views = career.trend.views || [];
  const applies = career.trend.applies || [];
  const hasValues = views.some((value) => value > 0) || applies.some((value) => value > 0);

  const { areaPath, viewPath, applyPath, xLabels } = useMemo(() => {
    const width = 540;
    const height = 220;
    const paddingX = 24;
    const paddingTop = 16;
    const paddingBottom = 28;
    const maxValue = Math.max(...views, ...applies, 1);
    const step = labels.length > 1 ? (width - paddingX * 2) / (labels.length - 1) : 0;
    const plotHeight = height - paddingTop - paddingBottom;
    const baseY = height - paddingBottom;

    const toY = (value: number) => baseY - (value / maxValue) * plotHeight;
    const pointsFor = (series: number[]) =>
      series.map((value, index) => ({
        x: paddingX + step * index,
        y: toY(value),
      }));

    const viewPoints = pointsFor(views);
    const applyPoints = pointsFor(applies);

    return {
      areaPath: buildArea(viewPoints, baseY),
      viewPath: buildPath(viewPoints),
      applyPath: buildPath(applyPoints),
      xLabels: [
        { value: labels[0], x: paddingX },
        { value: labels[Math.floor(labels.length / 2)], x: paddingX + step * Math.floor(labels.length / 2) },
        { value: labels[labels.length - 1], x: paddingX + step * Math.max(labels.length - 1, 0) },
      ].filter((item) => Boolean(item.value)),
    };
  }, [applies, labels, views]);

  if (!hasValues) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No trend data yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Views and ATS applies will appear here once the job starts getting traffic.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-muted/[0.14] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Career views</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{career.views}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/[0.14] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Apply clicks</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{career.applyClicks}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/[0.14] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">ATS applies</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{totalAtsApplies}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/[0.06]">
        <svg viewBox="0 0 540 220" className="h-[190px] w-full">
          <defs>
            <linearGradient id="overview-views-area" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a9d8f" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#2a9d8f" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {[48, 96, 144].map((y) => (
            <line key={y} x1="24" y1={y} x2="516" y2={y} stroke="rgba(100,116,139,0.18)" strokeDasharray="4 6" />
          ))}

          {areaPath ? <path d={areaPath} fill="url(#overview-views-area)" /> : null}
          {viewPath ? (
            <path
              d={viewPath}
              fill="none"
              stroke="#1f8f76"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {applyPath ? (
            <path
              d={applyPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {xLabels.map((item) => (
            <text
              key={`${item.value}-${item.x}`}
              x={item.x}
              y="208"
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
            >
              {item.value}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1f8f76]" />
          Views
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
          ATS applies
        </div>
      </div>
    </div>
  );
}
