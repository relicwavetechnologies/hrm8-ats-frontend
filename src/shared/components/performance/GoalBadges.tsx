import { Badge } from "@/shared/components/ui/badge";
import type { GoalStatus, GoalPriority } from "@/types/performance";

interface GoalStatusBadgeProps {
  status: GoalStatus;
}

export function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  const variants: Record<GoalStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'not-started': { label: 'Not Started', variant: 'secondary' },
    'in-progress': { label: 'In Progress', variant: 'default' },
    'completed': { label: 'Completed', variant: 'default' },
    'on-hold': { label: 'On Hold', variant: 'outline' },
    'cancelled': { label: 'Cancelled', variant: 'destructive' },
  };

  const { label, variant } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}

interface GoalPriorityBadgeProps {
  priority: GoalPriority;
}

export function GoalPriorityBadge({ priority }: GoalPriorityBadgeProps) {
  const colors: Record<GoalPriority, string> = {
    'low': 'bg-blue-100 text-blue-800 border-blue-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'high': 'bg-orange-100 text-orange-800 border-orange-200',
    'critical': 'bg-red-100 text-red-800 border-red-200',
  };

  const labels: Record<GoalPriority, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical',
  };

  return (
    <Badge variant="outline" className={colors[priority]}>
      {labels[priority]}
    </Badge>
  );
}
