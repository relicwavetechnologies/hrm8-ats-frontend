import { Badge } from "@/shared/components/ui/badge";
import type { LeaveStatus } from "@/shared/types/leave";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const variants: Record<LeaveStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'pending': { label: 'Pending', variant: 'secondary' },
    'approved': { label: 'Approved', variant: 'default' },
    'rejected': { label: 'Rejected', variant: 'destructive' },
    'cancelled': { label: 'Cancelled', variant: 'outline' },
  };

  const { label, variant } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
