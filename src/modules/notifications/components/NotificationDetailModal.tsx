import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Notification } from '@/shared/types/notification';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Archive, 
  Trash2,
  Bell
} from 'lucide-react';

interface NotificationDetailModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
  onMarkAsRead,
  onArchive,
  onDelete,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <Bell className="h-5 w-5 text-warning" />;
      case 'error': return <Bell className="h-5 w-5 text-destructive" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {getTypeIcon(notification.type)}
            <div className="flex-1">
              <DialogTitle className="text-xl">{notification.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getPriorityColor(notification.priority)}>
                  {notification.priority}
                </Badge>
                <Badge variant="outline">{notification.category}</Badge>
                {!notification.read && (
                  <Badge variant="default">Unread</Badge>
                )}
                {notification.archived && (
                  <Badge variant="secondary">Archived</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Message</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Created</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            {notification.readAt && (
              <div>
                <h4 className="text-sm font-medium mb-1">Read</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.readAt), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>

          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Additional Details</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-4 border-t">
            {!notification.read && onMarkAsRead && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            )}

            {notification.link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = notification.link!;
                  onOpenChange(false);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}

            {onArchive && !notification.archived && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onArchive(notification.id);
                  onOpenChange(false);
                }}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDelete(notification.id);
                  onOpenChange(false);
                }}
                className="ml-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
