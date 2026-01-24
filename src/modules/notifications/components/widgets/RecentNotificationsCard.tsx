import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, MessageSquare, DollarSign, Users, Plug, AlertTriangle, FileText, Calendar, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { NotificationCategory } from "@/shared/types/notification";

interface RecentNotificationsCardProps {
  userId: string;
  maxItems?: number;
}

const getCategoryIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'system': return AlertTriangle;
    case 'approval': return Clock;
    case 'expiry': return Calendar;
    case 'document': return FileText;
    case 'payroll': return DollarSign;
    case 'attendance': return Users;
    default: return Bell;
  }
};

const getCategoryColor = (category: NotificationCategory) => {
  switch (category) {
    case 'system': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'approval': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'expiry': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'document': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'payroll': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'attendance': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
    default: return 'bg-primary/10 text-primary';
  }
};

const getPriorityBorderColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'border-l-destructive';
    case 'high': return 'border-l-orange-500';
    case 'medium': return 'border-l-yellow-500';
    case 'low': return 'border-l-blue-500';
    default: return 'border-l-muted';
  }
};

export function RecentNotificationsCard({ userId, maxItems = 5 }: RecentNotificationsCardProps) {
  const navigate = useNavigate();
  const { notifications, markAsRead, deleteNotification, stats } = useNotifications(userId);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const recentNotifications = notifications.slice(0, maxItems);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read && !processingIds.has(notification.id)) {
      setProcessingIds(prev => new Set(prev).add(notification.id));
      markAsRead(notification.id);
      setTimeout(() => {
        setProcessingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }, 500);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!processingIds.has(notificationId)) {
      setProcessingIds(prev => new Set(prev).add(notificationId));
      markAsRead(notificationId);
      setTimeout(() => {
        setProcessingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }, 500);
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </span>
          {stats.unread > 0 && (
            <Badge variant="secondary" className="ml-2">
              {stats.unread} unread
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">All caught up! 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifications.map((notification) => {
              const CategoryIcon = getCategoryIcon(notification.category);
              const categoryColor = getCategoryColor(notification.category);
              const borderColor = getPriorityBorderColor(notification.priority);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 rounded-lg border-l-4 hover:bg-muted/50 cursor-pointer transition-all group",
                    borderColor,
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0", categoryColor)}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium leading-tight line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDelete(e, notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-4" 
          onClick={() => navigate('/notifications')}
        >
          View All Notifications
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
