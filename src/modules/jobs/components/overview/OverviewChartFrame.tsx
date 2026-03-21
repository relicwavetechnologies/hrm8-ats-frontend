import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type OverviewChartFrameProps = {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function OverviewChartFrame({
  title,
  description,
  aside,
  children,
  className,
  contentClassName,
}: OverviewChartFrameProps) {
  return (
    <Card className={cn("overflow-hidden border-border/70 bg-background shadow-none", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-border/60 px-4 py-2.5">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-sm font-semibold tracking-tight">{title}</CardTitle>
          {description ? <CardDescription className="line-clamp-2 text-[11px]">{description}</CardDescription> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </CardHeader>
      <CardContent className={cn("px-4 py-3.5", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
