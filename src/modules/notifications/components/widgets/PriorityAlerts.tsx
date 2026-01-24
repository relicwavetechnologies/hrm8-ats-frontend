import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PriorityAlertsProps {
  userId: string;
  maxItems?: number;
}

export function PriorityAlerts({ userId, maxItems = 5 }: PriorityAlertsProps) {
  const { notifications, markAsRead } = useNotifications(userId);
  const navigate = useNavigate();

  const priorityAlerts = notifications
    .filter(n => n.priority === 'critical' || n.priority === 'high')
    .slice(0, maxItems);

  const handleClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (priorityAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No urgent alerts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Priority Alerts ({priorityAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {priorityAlerts.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border-l-2 border-destructive"
              onClick={() => handleClick(notification)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                  <Badge variant="destructive" className="text-xs">
                    {notification.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
