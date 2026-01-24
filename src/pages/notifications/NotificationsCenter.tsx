import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Bell, CheckCheck, Trash2, Settings, AlertCircle, UserPlus, FileText, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'application' | 'employee' | 'job' | 'performance' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Application Received',
      message: 'John Smith applied for Senior Developer position',
      type: 'info',
      category: 'application',
      timestamp: '2024-01-15T10:30:00',
      read: false,
      actionUrl: '/candidates/1'
    },
    {
      id: '2',
      title: 'Performance Review Due',
      message: 'Q4 performance reviews are due in 3 days',
      type: 'warning',
      category: 'performance',
      timestamp: '2024-01-15T09:00:00',
      read: false
    },
    {
      id: '3',
      title: 'New Employee Onboarded',
      message: 'Sarah Johnson has completed onboarding process',
      type: 'success',
      category: 'employee',
      timestamp: '2024-01-14T16:45:00',
      read: true
    },
    {
      id: '4',
      title: 'Job Posting Expiring Soon',
      message: 'Frontend Developer position expires in 2 days',
      type: 'warning',
      category: 'job',
      timestamp: '2024-01-14T14:20:00',
      read: false
    },
    {
      id: '5',
      title: 'System Maintenance Scheduled',
      message: 'Planned maintenance on Saturday 2 AM - 4 AM EST',
      type: 'info',
      category: 'system',
      timestamp: '2024-01-13T11:00:00',
      read: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/10 text-emerald-500';
      case 'warning': return 'bg-amber-500/10 text-amber-500';
      case 'error': return 'bg-red-500/10 text-red-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'application': return <FileText className="h-4 w-4" />;
      case 'employee': return <UserPlus className="h-4 w-4" />;
      case 'job': return <Calendar className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.category === activeTab);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with important alerts and messages</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="text-base font-semibold flex items-center justify-between">
              <div className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle className="text-base font-semibold">All Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">{unreadCount} New</Badge>
                )}
              </div>
            </div>
            <CardDescription>View and manage your notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="application">Applications</TabsTrigger>
                <TabsTrigger value="employee">Employees</TabsTrigger>
                <TabsTrigger value="job">Jobs</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications to display</p>
                    </div>
                  ) : (
                    filteredNotifications.map(notification => (
                      <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                              {getCategoryIcon(notification.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold">{notification.title}</h4>
                                <div className="flex gap-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <CheckCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                <Badge variant="outline" className="capitalize">{notification.category}</Badge>
                                {notification.actionUrl && (
                                  <Button variant="link" size="sm" className="h-auto p-0">
                                    View Details →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
