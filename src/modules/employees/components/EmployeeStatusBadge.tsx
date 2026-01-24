import { Badge } from "@/shared/components/ui/badge";
import type { EmployeeStatus } from "@/shared/types/employee";

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const variants: Record<EmployeeStatus, { label: string; variant: "success" | "orange" | "coral" | "neutral" | "destructive" }> = {
    'active': { label: 'Active', variant: 'success' },
    'on-leave': { label: 'On Leave', variant: 'orange' },
    'notice-period': { label: 'Notice Period', variant: 'coral' },
    'inactive': { label: 'Inactive', variant: 'neutral' },
    'terminated': { label: 'Terminated', variant: 'destructive' },
  };

  const { label, variant } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
