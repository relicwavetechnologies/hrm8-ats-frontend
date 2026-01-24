import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Users, Eye, Edit3, MessageSquare, Star, FileCheck } from 'lucide-react';
import { FeedbackPresence } from '@/shared/hooks/useFeedbackPresence';

interface FeedbackLiveCollaborationProps {
  activeUsers: FeedbackPresence[];
  currentUserId: string;
}

const FeedbackLiveCollaboration: React.FC<FeedbackLiveCollaborationProps> = ({ 
  activeUsers,
  currentUserId 
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return status === 'editing' ? 'bg-primary' : 'bg-muted';
  };

  const getSectionIcon = (section?: string) => {
    switch (section) {
      case 'ratings':
        return <Star className="h-3 w-3 mr-1" />;
      case 'comments':
        return <MessageSquare className="h-3 w-3 mr-1" />;
      case 'decision':
        return <FileCheck className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getSectionLabel = (section?: string) => {
    if (!section) return '';
    return ` · ${section.charAt(0).toUpperCase() + section.slice(1)}`;
  };

  const getTimeSinceActive = (lastActive: Date) => {
    const seconds = Math.floor((Date.now() - lastActive.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Active Team Members ({activeUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeUsers.map(user => (
            <div 
              key={user.userId} 
              className={`flex items-center justify-between p-2 rounded-lg border ${
                user.userId === currentUserId ? 'bg-accent/50 border-primary/50' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className={getStatusColor(user.status)}>
                    {getInitials(user.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium truncate">
                      {user.userName}
                      {user.userId === currentUserId && ' (You)'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.userRole} · {getTimeSinceActive(user.lastActive)}
                  </p>
                </div>
              </div>
              <Badge 
                variant={user.status === 'editing' ? 'default' : 'secondary'}
                className="flex-shrink-0 ml-2"
              >
                {user.status === 'editing' ? (
                  <>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editing
                    {user.section && getSectionLabel(user.section)}
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Viewing
                  </>
                )}
              </Badge>
            </div>
          ))}
        </div>
        
        {activeUsers.filter(u => u.status === 'editing').length > 0 && (
          <div className="mt-3 p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {activeUsers.filter(u => u.status === 'editing' && u.userId !== currentUserId).length > 0
                ? '💡 Others are editing. Changes will sync in real-time.'
                : '💡 Your changes are visible to all team members.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackLiveCollaboration;
