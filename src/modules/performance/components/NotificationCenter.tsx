import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Bell, Check, MessageSquare, UserPlus, ThumbsUp, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'mention' | 'feedback_request' | 'feedback_submitted' | 'vote_cast' | 'deadline';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'mention',
    title: 'Sarah Johnson mentioned you',
    message: 'Sarah mentioned you in a comment on John Smith\'s feedback',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    priority: 'medium',
  },
  {
    id: 'notif-2',
    type: 'feedback_request',
    title: 'New feedback request',
    message: 'You have been asked to provide feedback for Jane Doe',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-3',
    type: 'feedback_submitted',
    title: 'Mike Chen submitted feedback',
    message: 'Mike Chen submitted feedback for John Smith',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    priority: 'low',
  },
  {
    id: 'notif-4',
    type: 'deadline',
    title: 'Feedback deadline approaching',
    message: 'Feedback for Jane Doe is due in 2 hours',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    priority: 'high',
  },
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="h-4 w-4" />;
      case 'feedback_request':
        return <UserPlus className="h-4 w-4" />;
      case 'feedback_submitted':
        return <Check className="h-4 w-4" />;
      case 'vote_cast':
        return <ThumbsUp className="h-4 w-4" />;
      case 'deadline':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>Stay updated on feedback activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.read ? 'bg-background' : 'bg-accent/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full ${getPriorityColor(notification.priority)} flex items-center justify-center text-white`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        {!notification.read && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="h-7 text-xs">
                              View details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
