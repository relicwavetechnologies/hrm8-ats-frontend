import React, { useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { RefreshCw, X, TrendingUp, Edit3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { FeedbackUpdate } from '@/shared/hooks/useRealtimeFeedback';
import { motion, AnimatePresence } from 'framer-motion';

interface RealtimeUpdateNotificationProps {
  updates: FeedbackUpdate[];
  onRefresh: () => void;
  onDismiss: () => void;
}

export const RealtimeUpdateNotification: React.FC<RealtimeUpdateNotificationProps> = ({
  updates,
  onRefresh,
  onDismiss,
}) => {
  if (updates.length === 0) return null;

  const latestUpdate = updates[updates.length - 1];
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('hire') && !recommendation.includes('no')) {
      return <ThumbsUp className="h-3 w-3" />;
    }
    if (recommendation === 'no-hire' || recommendation === 'strong-no-hire') {
      return <ThumbsDown className="h-3 w-3" />;
    }
    return <TrendingUp className="h-3 w-3" />;
  };

  const getUpdateText = () => {
    if (latestUpdate.type === 'new') {
      return `${latestUpdate.feedback.reviewerName} submitted new feedback`;
    }
    return `${latestUpdate.feedback.reviewerName} updated their feedback`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50 max-w-md"
      >
        <Card className="p-4 shadow-lg border-primary/50 bg-background">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(latestUpdate.feedback.reviewerName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {latestUpdate.type === 'new' ? (
                  <Badge variant="default" className="flex-shrink-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex-shrink-0">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Updated
                  </Badge>
                )}
                {updates.length > 1 && (
                  <Badge variant="outline" className="flex-shrink-0">
                    +{updates.length - 1} more
                  </Badge>
                )}
              </div>
              
              <p className="text-sm font-medium mb-1">{getUpdateText()}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{latestUpdate.feedback.reviewerRole}</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {getRecommendationIcon(latestUpdate.feedback.recommendation)}
                  <span className="ml-1 capitalize">
                    {latestUpdate.feedback.recommendation.replace('-', ' ')}
                  </span>
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="flex-shrink-0 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={onRefresh}
            className="w-full mt-3"
            size="sm"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Refresh to see updates
          </Button>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
