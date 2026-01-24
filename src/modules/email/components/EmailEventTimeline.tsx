import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EmailEvent } from '@/shared/types/emailTracking';
import { format } from 'date-fns';
import { Mail, CheckCircle, Eye, MousePointerClick, XCircle, AlertCircle } from 'lucide-react';

interface EmailEventTimelineProps {
  events: EmailEvent[];
}

export function EmailEventTimeline({ events }: EmailEventTimelineProps) {
  const getEventIcon = (type: EmailEvent['eventType']) => {
    const icons = {
      sent: Mail,
      delivered: CheckCircle,
      opened: Eye,
      clicked: MousePointerClick,
      bounced: AlertCircle,
      failed: XCircle,
    };
    return icons[type];
  };

  const getEventColor = (type: EmailEvent['eventType']) => {
    const colors = {
      sent: 'text-blue-500',
      delivered: 'text-green-500',
      opened: 'text-purple-500',
      clicked: 'text-orange-500',
      bounced: 'text-yellow-500',
      failed: 'text-red-500',
    };
    return colors[type];
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event) => {
            const Icon = getEventIcon(event.eventType);
            const colorClass = getEventColor(event.eventType);

            return (
              <div key={event.id} className="flex gap-4">
                <div className={`mt-1 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium capitalize">{event.eventType}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.recipientEmail}</p>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No events recorded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
