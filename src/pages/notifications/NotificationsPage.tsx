/**
 * Notifications Page
 * Displays all notifications for the current user
 * Used across all dashboard types
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
    Bell,
    CheckCheck,
    Mail,
    MailOpen,
    RefreshCw,
    Trash2,
    Clock,
    ExternalLink,
} from 'lucide-react';
import { useUniversalNotifications } from '@/shared/hooks/useUniversalNotifications';
import { formatDistanceToNow } from 'date-fns';

type NotificationFilter = 'all' | 'unread' | 'read';

// Icon mapping for notification types
const TYPE_ICONS: Record<string, React.ElementType> = {
    application: Mail,
    interview: Clock,
    payment: Mail,
    system: Bell,
    default: Bell,
};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const {
        notifications,
        unreadCount,
        isLoading: loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: refreshNotifications
    } = useUniversalNotifications({ limit: 50, showToasts: false });

    // Filter notifications based on selected tab
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true; // 'all'
    });

    // Handle notification click
    const handleNotificationClick = useCallback(async (notification: any) => {
        // Mark as read if not already
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Navigate to actionUrl if available, otherwise to detail page
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        } else {
            navigate(`/notifications/${notification.id}`);
        }
    }, [markAsRead, navigate]);

    // Get priority badge variant
    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'critical': return 'destructive';
            case 'high': return 'default';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <DashboardPageLayout>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </DashboardPageLayout>
        );
    }

    return (
        <DashboardPageLayout>
            <div className="p-6 space-y-6">
                <AtsPageHeader
                    title="Notifications"
                    subtitle={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
                >
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshNotifications}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </AtsPageHeader>

                <Tabs value={filter} onValueChange={(v) => setFilter(v as NotificationFilter)}>
                    <TabsList>
                        <TabsTrigger value="all">
                            All ({notifications.length})
                        </TabsTrigger>
                        <TabsTrigger value="unread">
                            Unread ({unreadCount})
                        </TabsTrigger>
                        <TabsTrigger value="read">
                            Read ({notifications.length - unreadCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Card>
                    <CardContent className="p-0">
                        {filteredNotifications.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-1">No notifications</p>
                                <p className="text-sm">
                                    {filter === 'unread'
                                        ? "You're all caught up!"
                                        : filter === 'read'
                                            ? "No read notifications yet"
                                            : "You don't have any notifications yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredNotifications.map((notification) => {
                                    const Icon = TYPE_ICONS[notification.type] || TYPE_ICONS.default;
                                    const isUnread = !notification.read;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`p-4 flex gap-4 hover:bg-muted/50 cursor-pointer transition-colors ${isUnread ? 'bg-primary/5' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isUnread ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`text-sm font-medium truncate ${isUnread ? 'font-semibold' : ''
                                                                }`}>
                                                                {notification.title}
                                                            </h4>
                                                            {(notification as any).priority && (notification as any).priority !== 'low' && (
                                                                <Badge variant={getPriorityVariant((notification as any).priority)} className="text-[10px] px-1.5 py-0">
                                                                    {(notification as any).priority}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                {notification.createdAt
                                                                    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                                                    : 'Just now'}
                                                            </span>
                                                            {notification.actionUrl && (
                                                                <>
                                                                    <span>•</span>
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    <span>Click to view</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {isUnread && (
                                                            <div className="h-2 w-2 bg-primary rounded-full" />
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardPageLayout>
    );
}
