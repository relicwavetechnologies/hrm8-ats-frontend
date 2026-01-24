import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Trophy, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { savePerformanceGoal } from "@/shared/lib/performanceStorage";
import type { PerformanceGoal, GoalKPI } from "@/shared/types/performance";
import { z } from "zod";

interface GoalCompletionDialogProps {
  goal: PerformanceGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const completionSchema = z.object({
  completionNotes: z.string().trim().min(10, "Completion notes must be at least 10 characters").max(1000, "Notes must be less than 1000 characters"),
  kpis: z.array(z.object({
    id: z.string(),
    current: z.number().min(0, "Value must be positive")
  }))
});

export function GoalCompletionDialog({ goal, open, onOpenChange, onComplete }: GoalCompletionDialogProps) {
  const [completionNotes, setCompletionNotes] = useState("");
  const [kpiValues, setKpiValues] = useState<Record<string, number>>(
    goal.kpis.reduce((acc, kpi) => ({ ...acc, [kpi.id]: kpi.current }), {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateKPIAchievement = (kpi: GoalKPI, currentValue: number): number => {
    if (kpi.target === 0) return 100;
    return Math.min(Math.round((currentValue / kpi.target) * 100), 200); // Cap at 200% for overachievement
  };

  const calculateOverallAchievement = (): number => {
    if (goal.kpis.length === 0) return 100;
    
    const totalAchievement = goal.kpis.reduce((sum, kpi) => {
      const currentValue = kpiValues[kpi.id] || kpi.current;
      return sum + calculateKPIAchievement(kpi, currentValue);
    }, 0);
    
    return Math.round(totalAchievement / goal.kpis.length);
  };

  const overallAchievement = calculateOverallAchievement();

  const handleKPIChange = (kpiId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setKpiValues(prev => ({ ...prev, [kpiId]: numValue }));
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[kpiId];
      return newErrors;
    });
  };

  const handleComplete = () => {
    // Validate input
    const kpiData = goal.kpis.map(kpi => ({
      id: kpi.id,
      current: kpiValues[kpi.id] || kpi.current
    }));

    const validation = completionSchema.safeParse({
      completionNotes,
      kpis: kpiData
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0] === 'completionNotes') {
          newErrors.completionNotes = err.message;
        } else if (err.path[0] === 'kpis' && err.path[2] === 'current') {
          newErrors[kpiData[err.path[1] as number].id] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Update KPIs with final values
    const updatedKPIs: GoalKPI[] = goal.kpis.map(kpi => ({
      ...kpi,
      current: kpiValues[kpi.id] || kpi.current
    }));

    // Create updated goal
    const updatedGoal: PerformanceGoal = {
      ...goal,
      status: 'completed',
      progress: 100,
      completedDate: new Date().toISOString(),
      kpis: updatedKPIs,
      description: `${goal.description}\n\n--- Completion Notes ---\n${completionNotes.trim()}\n\nOverall Achievement: ${overallAchievement}%`,
      updatedAt: new Date().toISOString()
    };

    savePerformanceGoal(updatedGoal);

    toast({
      title: "Goal Completed! 🎉",
      description: `Achievement: ${overallAchievement}% - ${getAchievementMessage(overallAchievement)}`
    });

    onComplete?.();
    onOpenChange(false);
  };

  const getAchievementMessage = (achievement: number): string => {
    if (achievement >= 150) return "Outstanding performance!";
    if (achievement >= 120) return "Exceeded expectations!";
    if (achievement >= 100) return "Target achieved!";
    if (achievement >= 80) return "Good progress!";
    return "Partially achieved";
  };

  const getAchievementColor = (achievement: number): string => {
    if (achievement >= 120) return "text-green-600 dark:text-green-400";
    if (achievement >= 100) return "text-blue-600 dark:text-blue-400";
    if (achievement >= 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Complete Goal
          </DialogTitle>
          <DialogDescription>
            Review your KPI achievements and add completion notes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Goal Summary */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-1">{goal.title}</h4>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </div>

            {/* Overall Achievement Preview */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Achievement</span>
                <Trophy className={`h-5 w-5 ${getAchievementColor(overallAchievement)}`} />
              </div>
              <div className="flex items-end gap-3">
                <div className={`text-4xl font-bold ${getAchievementColor(overallAchievement)}`}>
                  {overallAchievement}%
                </div>
                <div className="text-sm text-muted-foreground pb-1">
                  {getAchievementMessage(overallAchievement)}
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Performance Indicators
              </h4>
              
              {goal.kpis.map((kpi) => {
                const currentValue = kpiValues[kpi.id] || kpi.current;
                const achievement = calculateKPIAchievement(kpi, currentValue);
                
                return (
                  <div key={kpi.id} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Label className="text-base font-medium">{kpi.name}</Label>
                          {kpi.description && (
                            <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                          )}
                        </div>
                        <div className={`text-sm font-semibold ${getAchievementColor(achievement)}`}>
                          {achievement}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Target</Label>
                          <div className="text-sm font-medium">
                            {kpi.target} {kpi.unit}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Final Value *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={currentValue}
                            onChange={(e) => handleKPIChange(kpi.id, e.target.value)}
                            className={errors[kpi.id] ? "border-destructive" : ""}
                            placeholder={`Enter final ${kpi.unit}`}
                          />
                          {errors[kpi.id] && (
                            <p className="text-xs text-destructive mt-1">{errors[kpi.id]}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Achievement bar */}
                    <div className="space-y-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            achievement >= 120 ? 'bg-green-500' :
                            achievement >= 100 ? 'bg-blue-500' :
                            achievement >= 80 ? 'bg-yellow-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(achievement, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>Target: {kpi.target}</span>
                        <span>Current: {currentValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {goal.kpis.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No KPIs defined for this goal</p>
                </div>
              )}
            </div>

            {/* Completion Notes */}
            <div className="space-y-2">
              <Label htmlFor="completion-notes">
                Completion Notes *
                <span className="text-muted-foreground font-normal ml-2">(min 10 characters)</span>
              </Label>
              <Textarea
                id="completion-notes"
                value={completionNotes}
                onChange={(e) => {
                  setCompletionNotes(e.target.value);
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.completionNotes;
                    return newErrors;
                  });
                }}
                placeholder="Describe what you achieved, challenges faced, lessons learned, and any additional context about completing this goal..."
                rows={6}
                className={errors.completionNotes ? "border-destructive" : ""}
                maxLength={1000}
              />
              {errors.completionNotes && (
                <p className="text-sm text-destructive">{errors.completionNotes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {completionNotes.length}/1000 characters
              </p>
            </div>

            {/* Achievement Summary */}
            <div className="p-4 border-2 border-dashed rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Summary
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium">Will be marked as Completed</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completion Date:</span>
                  <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">KPIs Tracked:</span>
                  <span className="ml-2 font-medium">{goal.kpis.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Overall Achievement:</span>
                  <span className={`ml-2 font-bold ${getAchievementColor(overallAchievement)}`}>
                    {overallAchievement}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Complete Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
