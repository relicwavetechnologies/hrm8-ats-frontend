import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';

interface InterviewProgressProps {
  current: number;
  total: number;
  showLabels?: boolean;
}

export function InterviewProgress({ current, total, showLabels = true }: InterviewProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Interview Progress</span>
          <Badge variant="outline">
            Question {current} of {total}
          </Badge>
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
