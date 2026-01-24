import { Badge } from '@/shared/components/ui/badge';
import type { ServiceType } from '@/types/recruitmentService';
import { cn } from '@/lib/utils';

interface ServiceTypeBadgeProps {
  type: ServiceType;
  className?: string;
}

export function ServiceTypeBadge({ type, className }: ServiceTypeBadgeProps) {
  const config = {
    'shortlisting': { label: 'Shortlisting', variant: 'default' as const },
    'full-service': { label: 'Full-Service', variant: 'purple' as const },
    'executive-search': { label: 'Executive Search', variant: 'orange' as const },
    'rpo': { label: 'RPO', variant: 'teal' as const }
  };

  const { label, variant } = config[type];

  return (
    <Badge variant={variant} className={cn("whitespace-nowrap", className)}>
      {label}
    </Badge>
  );
}
