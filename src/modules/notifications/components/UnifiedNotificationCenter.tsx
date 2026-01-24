import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Bell, CheckCheck, Trash2, Archive, Download } from 'lucide-react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { NotificationSearch } from './NotificationSearch';
import { NotificationDetailModal } from './NotificationDetailModal';
import { NotificationAnalytics } from './NotificationAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { 
  archiveNotification, 
  bulkMarkAsRead, 
  bulkDelete, 
  bulkArchive 
} from '@/shared/lib/notificationStorage';
import { 
  exportNotificationsToCSV, 
  exportNotificationsToJSON, 
  downloadCSV, 
  downloadJSON 
} from '@/shared/lib/notificationExport';
import { toast } from 'sonner';
import { Notification } from '@/shared/types/notification';

const MOCK_USER_ID = 'user-1';

export function UnifiedNotificationCenter() {
  const {
    notifications,
    stats,
    filters,
    searchQuery,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateFilters,
    updateSearchQuery,
    clearFilters,
    refresh,
  } = useNotifications(MOCK_USER_ID);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkMarkAsRead = () => {
    const count = bulkMarkAsRead(selectedIds);
    toast.success(`Marked ${count} notifications as read`);
    setSelectedIds([]);
    refresh();
  };

  const handleBulkDelete = () => {
    const count = bulkDelete(selectedIds);
    toast.success(`Deleted ${count} notifications`);
    setSelectedIds([]);
    refresh();
  };

  const handleBulkArchive = () => {
    const count = bulkArchive(selectedIds);
    toast.success(`Archived ${count} notifications`);
    setSelectedIds([]);
    refresh();
  };

  const handleExportCSV = () => {
    const csv = exportNotificationsToCSV(notifications);
    downloadCSV(csv, `notifications-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Notifications exported to CSV');
  };

  const handleExportJSON = () => {
    const json = exportNotificationsToJSON(notifications);
    downloadJSON(json, `notifications-${new Date().toISOString().split('T')[0]}.json`);
    toast.success('Notifications exported to JSON');
  };

  const handleNotificationClick = (notification: Notification) => {
    setDetailNotification(notification);
    setDetailModalOpen(true);
  };

  const handleArchive = (id: string) => {
    archiveNotification(id);
    toast.success('Notification archived');
    refresh();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label = '';
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your notifications in one place
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({stats.unread})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>
                    View and manage all your notifications
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationSearch
                onSearch={updateSearchQuery}
                onFilterChange={updateFilters}
                filters={filters}
                searchQuery={searchQuery}
              />

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedIds.length} selected
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBulkMarkAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark as read
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBulkArchive}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-2 opacity-50" />
                  <p>No notifications found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground px-2">
                        {date}
                      </h3>
                      <div className="divide-y border rounded-lg">
                        {dateNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-muted/50 transition-colors ${
                              !notification.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedIds.includes(notification.id)}
                                onCheckedChange={() => handleSelectOne(notification.id)}
                              />
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm leading-tight">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadgeVariant(notification.priority)}`}>
                                        {notification.priority}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                      </span>
                                    </div>
                                  </div>
                                  {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>
                {stats.unread} unread notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.filter(n => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCheck className="h-12 w-12 mb-2 opacity-50" />
                  <p>All caught up!</p>
                </div>
              ) : (
                <div className="divide-y border rounded-lg">
                  {notifications.filter(n => !n.read).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer bg-primary/5"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <NotificationAnalytics notifications={notifications} />
        </TabsContent>
      </Tabs>

      <NotificationDetailModal
        notification={detailNotification}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onMarkAsRead={markAsRead}
        onArchive={handleArchive}
        onDelete={deleteNotification}
      />
    </div>
  );
}
