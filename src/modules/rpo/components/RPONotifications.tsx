import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle2, Info, Calendar, User } from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  priority: 'high' | 'medium' | 'low';
}

interface RPONotificationsProps {
  contractId?: string;
}

export function RPONotifications({ contractId }: RPONotificationsProps) {
  // Mock data - will be replaced with real data later
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Contract Renewal Due',
      message: 'TechCorp RPO contract renewal is due in 15 days. Schedule a renewal discussion.',
      timestamp: '2 hours ago',
      read: false,
      actionLabel: 'Schedule Call',
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      title: 'SLA At Risk',
      message: 'Placement rate is 82%, below the 90% target for HealthCare Solutions contract.',
      timestamp: '5 hours ago',
      read: false,
      actionLabel: 'View Details',
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'New Task Assigned',
      message: 'Sarah Johnson has been assigned 3 new screening tasks for TechCorp contract.',
      timestamp: '1 day ago',
      read: false,
      actionLabel: 'View Tasks',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'success',
      title: 'Placement Completed',
      message: 'Successfully placed Senior Developer for TechCorp. Contract value: $120,000.',
      timestamp: '1 day ago',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'info',
      title: 'Consultant Capacity Update',
      message: 'Michael Chen is now at 85% capacity. Consider adjusting workload distribution.',
      timestamp: '2 days ago',
      read: true,
      actionLabel: 'View Capacity',
      priority: 'medium'
    },
    {
      id: '6',
      type: 'success',
      title: 'Client Satisfaction Survey',
      message: 'TechCorp rated their experience 4.8/5 in the quarterly satisfaction survey.',
      timestamp: '3 days ago',
      read: true,
      priority: 'low'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeBorder = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-l-4 border-l-destructive';
      case 'success':
        return 'border-l-4 border-l-green-600';
      case 'warning':
        return 'border-l-4 border-l-yellow-600';
      default:
        return 'border-l-4 border-l-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>RPO Notifications</CardTitle>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <CardDescription>
          Stay updated on contract status, SLA compliance, and team activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${getTypeBorder(notification.type)} ${!notification.read ? 'bg-muted/50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{notification.timestamp}</span>
                      </div>
                      {notification.actionLabel && (
                        <Button size="sm" variant="outline">
                          {notification.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="ghost" className="w-full mt-4">
          View All Notifications
        </Button>
      </CardContent>
    </Card>
  );
}
