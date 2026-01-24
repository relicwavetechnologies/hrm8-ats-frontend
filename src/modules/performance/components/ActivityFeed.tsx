import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getActivities } from '@/shared/lib/feedbackActivityService';
import { FeedbackActivity } from '@/shared/types/feedbackActivity';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  ThumbsUp, 
  FileCheck, 
  UserPlus, 
  Edit3,
  Activity as ActivityIcon,
  AtSign
} from 'lucide-react';

interface ActivityFeedProps {
  candidateId?: string;
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ candidateId, limit = 20 }) => {
  const [activities, setActivities] = useState<FeedbackActivity[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadActivities = () => {
      const data = getActivities({
        candidateId,
        type: filter === 'all' ? undefined : filter,
        limit,
      });
      setActivities(data);
    };

    loadActivities();
    
    // Simulate real-time updates
    const interval = setInterval(loadActivities, 10000);
    return () => clearInterval(interval);
  }, [candidateId, filter, limit]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feedback_submitted':
      case 'feedback_updated':
        return <Edit3 className="h-4 w-4" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4" />;
      case 'vote_cast':
        return <ThumbsUp className="h-4 w-4" />;
      case 'decision_recorded':
        return <FileCheck className="h-4 w-4" />;
      case 'feedback_requested':
        return <UserPlus className="h-4 w-4" />;
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'feedback_submitted':
        return 'bg-green-500';
      case 'feedback_updated':
        return 'bg-blue-500';
      case 'comment_added':
        return 'bg-purple-500';
      case 'vote_cast':
        return 'bg-yellow-500';
      case 'decision_recorded':
        return 'bg-red-500';
      case 'feedback_requested':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>Recent feedback and collaboration activities</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="feedback_submitted">Feedback Submitted</SelectItem>
              <SelectItem value="comment_added">Comments</SelectItem>
              <SelectItem value="vote_cast">Votes</SelectItem>
              <SelectItem value="decision_recorded">Decisions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No activities yet</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.userName}</span>{' '}
                          <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.userRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {activity.metadata && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {activity.metadata.oldValue && activity.metadata.newValue && (
                          <p>
                            Changed from <span className="font-mono bg-muted px-1 py-0.5 rounded">{activity.metadata.oldValue}</span> to{' '}
                            <span className="font-mono bg-muted px-1 py-0.5 rounded">{activity.metadata.newValue}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
