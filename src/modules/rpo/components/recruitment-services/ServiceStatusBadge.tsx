import { Badge } from '@/shared/components/ui/badge';
import type { ServiceStatus } from '@/types/recruitmentService';
import { cn } from '@/shared/lib/utils';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  className?: string;
}

export function ServiceStatusBadge({ status, className }: ServiceStatusBadgeProps) {
  const config = {
    'active': { label: 'Active', variant: 'default' as const },
    'on-hold': { label: 'On Hold', variant: 'secondary' as const },
    'completed': { label: 'Completed', variant: 'outline' as const },
    'cancelled': { label: 'Cancelled', variant: 'destructive' as const }
  };

  const { label, variant } = config[status];

  return (
    <Badge variant={variant} className={cn("whitespace-nowrap", className)}>
      {label}
    </Badge>
  );
}
