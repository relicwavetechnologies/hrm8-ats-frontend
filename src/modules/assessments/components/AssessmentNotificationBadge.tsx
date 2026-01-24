import { Bell } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useState, useEffect } from 'react';
import { getPendingAssessments, getExpiringAssessments } from '@/shared/lib/mockAssessmentStorage';

export function AssessmentNotificationBadge() {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const updateNotifications = () => {
      const pending = getPendingAssessments();
      const expiring = getExpiringAssessments();
      setNotificationCount(pending.length + expiring.length);
    };

    updateNotifications();
    const interval = setInterval(updateNotifications, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (notificationCount === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {notificationCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm transition-colors duration-500">Assessment Notifications</h4>
          <p className="text-sm text-muted-foreground transition-colors duration-500">
            {notificationCount} assessment{notificationCount !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
