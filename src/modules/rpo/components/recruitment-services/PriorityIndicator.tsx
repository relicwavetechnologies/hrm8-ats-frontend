import { Badge } from '@/shared/components/ui/badge';
import type { ServicePriority } from '@/types/recruitmentService';
import { AlertCircle, Circle, MinusCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface PriorityIndicatorProps {
  priority: ServicePriority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityIndicator({ priority, showLabel = false, className }: PriorityIndicatorProps) {
  const config = {
    'high': { 
      label: 'High Priority', 
      icon: AlertCircle,
      className: 'text-destructive'
    },
    'medium': { 
      label: 'Medium Priority', 
      icon: MinusCircle,
      className: 'text-warning'
    },
    'low': { 
      label: 'Low Priority', 
      icon: Circle,
      className: 'text-muted-foreground'
    }
  };

  const { label, icon: Icon, className: colorClass } = config[priority];

  if (showLabel) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <Icon className={cn("h-3 w-3", colorClass)} />
        {label}
      </Badge>
    );
  }

  return <Icon className={cn("h-4 w-4", colorClass, className)} />;
}
