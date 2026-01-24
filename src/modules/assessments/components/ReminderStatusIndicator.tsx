import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ReminderStatusIndicatorProps {
  remindersSent: number;
  lastReminderDate?: string;
  invitedDate: string;
  status: string;
  className?: string;
}

export function ReminderStatusIndicator({
  remindersSent,
  lastReminderDate,
  invitedDate,
  status,
  className,
}: ReminderStatusIndicatorProps) {
  const now = new Date();
  const lastContactDate = lastReminderDate
    ? new Date(lastReminderDate)
    : new Date(invitedDate);
  
  const daysSinceLastContact = Math.floor(
    (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Don't show for completed or cancelled assessments
  if (['completed', 'expired', 'cancelled'].includes(status)) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <CheckCircle2 className="h-3 w-3" />
        No reminders needed
      </Badge>
    );
  }

  // Overdue (10+ days)
  if (daysSinceLastContact >= 10) {
    return (
      <Badge variant="destructive" className={cn("gap-1", className)}>
        <AlertCircle className="h-3 w-3" />
        Overdue ({remindersSent} reminder{remindersSent !== 1 ? 's' : ''} sent)
      </Badge>
    );
  }

  // Due for reminder (3+ days)
  if (daysSinceLastContact >= 3) {
    return (
      <Badge variant="warning" className={cn("gap-1", className)}>
        <Clock className="h-3 w-3" />
        Reminder due ({remindersSent} sent)
      </Badge>
    );
  }

  // Recent contact
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      <CheckCircle2 className="h-3 w-3" />
      {remindersSent > 0 ? `${remindersSent} reminder${remindersSent !== 1 ? 's' : ''} sent` : 'Recently invited'}
    </Badge>
  );
}
