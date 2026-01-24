import { useMemo } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { getSupportTickets, getRecruitmentQueue } from '@/data/mockPlatformData';

export function PlatformNotificationBadge() {
  const notificationCount = useMemo(() => {
    const tickets = getSupportTickets();
    const services = getRecruitmentQueue();
    
    const criticalTickets = tickets.filter(t => t.priority === 'critical' || t.priority === 'high').length;
    const pendingServices = services.filter(s => s.status === 'pending').length;
    
    return criticalTickets + pendingServices;
  }, []);

  if (notificationCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center px-1.5">
      {notificationCount > 99 ? '99+' : notificationCount}
    </Badge>
  );
}
