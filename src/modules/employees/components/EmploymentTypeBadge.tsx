import { Badge } from "@/shared/components/ui/badge";
import type { EmploymentType } from "@/shared/types/employee";

interface EmploymentTypeBadgeProps {
  type: EmploymentType;
}

export function EmploymentTypeBadge({ type }: EmploymentTypeBadgeProps) {
  const config: Record<EmploymentType, { label: string; variant: "default" | "teal" | "purple" | "coral" | "orange" }> = {
    'full-time': { label: 'Full-Time', variant: 'teal' },
    'part-time': { label: 'Part-Time', variant: 'purple' },
    'contract': { label: 'Contract', variant: 'coral' },
    'intern': { label: 'Intern', variant: 'orange' },
    'casual': { label: 'Casual', variant: 'default' },
  };

  const { label, variant } = config[type];

  return <Badge variant={variant}>{label}</Badge>;
}
