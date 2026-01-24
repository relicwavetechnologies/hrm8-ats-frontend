import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Clock, Send, PlayCircle, CheckCircle, XCircle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  type: string;
  candidateName: string;
  timestamp: string;
  assessmentId: string;
  assessmentType: string;
}

interface RecentActivityTimelineProps {
  activities: Activity[];
}

const activityConfig: Record<string, { 
  icon: typeof Clock; 
  label: string; 
  color: string;
  badgeVariant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
}> = {
  'assessment-invited': {
    icon: Send,
    label: 'Invited to Assessment',
    color: 'text-blue-600 dark:text-blue-400',
    badgeVariant: 'default'
  },
  'assessment-started': {
    icon: PlayCircle,
    label: 'Started Assessment',
    color: 'text-purple-600 dark:text-purple-400',
    badgeVariant: 'secondary'
  },
  'assessment-completed': {
    icon: CheckCircle,
    label: 'Completed Assessment',
    color: 'text-green-600 dark:text-green-400',
    badgeVariant: 'success'
  },
  'assessment-expired': {
    icon: XCircle,
    label: 'Assessment Expired',
    color: 'text-red-600 dark:text-red-400',
    badgeVariant: 'destructive'
  },
  'reminder-sent': {
    icon: Bell,
    label: 'Reminder Sent',
    color: 'text-orange-600 dark:text-orange-400',
    badgeVariant: 'warning'
  }
};

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card className="transition-[background,border-color,box-shadow,color] duration-500">
        <CardHeader>
          <CardTitle className="transition-colors duration-500">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground transition-colors duration-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader>
        <CardTitle className="transition-colors duration-500">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <div key={index} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-[background,border-color,box-shadow,color] duration-500`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium transition-colors duration-500">{activity.candidateName}</p>
                    <Badge variant={config.badgeVariant} className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize transition-colors duration-500">
                    {activity.assessmentType.replace('-', ' ')} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
