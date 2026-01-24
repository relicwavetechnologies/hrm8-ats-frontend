import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface UnreadNotificationsListProps {
  userId: string;
  maxItems?: number;
}

export function UnreadNotificationsList({ userId, maxItems = 5 }: UnreadNotificationsListProps) {
  const { unreadNotifications, markAsRead } = useNotifications(userId);
  const navigate = useNavigate();

  const topUnread = unreadNotifications.slice(0, maxItems);

  const handleClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (topUnread.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unread Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Unread Notifications ({unreadNotifications.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topUnread.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleClick(notification)}
            >
              <Bell className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
