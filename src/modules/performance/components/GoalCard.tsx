import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { GoalStatusBadge, GoalPriorityBadge } from "./GoalBadges";
import { GoalProgressUpdateDialog } from "./GoalProgressUpdateDialog";
import { GoalCompletionDialog } from "./GoalCompletionDialog";
import type { PerformanceGoal } from "@/shared/types/performance";
import { format } from "date-fns";
import { Calendar, Target, TrendingUp, Edit, RefreshCw, CheckCircle2 } from "lucide-react";

interface GoalCardProps {
  goal: PerformanceGoal;
  onEdit?: (goal: PerformanceGoal) => void;
  onProgressUpdate?: () => void;
}

export function GoalCard({ goal, onEdit, onProgressUpdate }: GoalCardProps) {
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  
  const canComplete = goal.status === 'in-progress' || goal.status === 'on-hold';
  const isCompleted = goal.status === 'completed';

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <GoalPriorityBadge priority={goal.priority} />
            </div>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <GoalStatusBadge status={goal.status} />
            {canComplete && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setCompletionDialogOpen(true)}
                className="gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </Button>
            )}
            {!isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProgressDialogOpen(true)}
                title="Update Progress"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              Start Date
            </p>
            <p className="font-medium">{format(new Date(goal.startDate), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1 mb-1">
              <Target className="h-3 w-3" />
              Target Date
            </p>
            <p className="font-medium">{format(new Date(goal.targetDate), "MMM d, yyyy")}</p>
          </div>
        </div>

        {goal.kpis && goal.kpis.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold mb-3 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Key Performance Indicators
            </p>
            <div className="space-y-3">
              {goal.kpis.map((kpi) => (
                <div key={kpi.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{kpi.name}</span>
                    <span className="font-medium">
                      {kpi.current} / {kpi.target} {kpi.unit}
                    </span>
                  </div>
                  <Progress value={(kpi.current / kpi.target) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {goal.category}
          </Badge>
          {goal.completedDate && (
            <Badge variant="default" className="text-xs">
              Completed {format(new Date(goal.completedDate), "MMM d, yyyy")}
            </Badge>
          )}
        </div>
      </CardContent>
      </Card>

      <GoalProgressUpdateDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        goal={goal}
        onSuccess={onProgressUpdate}
      />

      <GoalCompletionDialog
        goal={goal}
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        onComplete={onProgressUpdate}
      />
    </>
  );
}
