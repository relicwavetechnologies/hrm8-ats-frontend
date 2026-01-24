import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { getFeedbackVersions } from '@/shared/lib/feedbackActivityService';
import { FeedbackVersion } from '@/shared/types/feedbackActivity';
import { formatDistanceToNow } from 'date-fns';
import { History, ArrowRight } from 'lucide-react';

interface FeedbackVersionHistoryProps {
  feedbackId: string;
}

export const FeedbackVersionHistory: React.FC<FeedbackVersionHistoryProps> = ({ feedbackId }) => {
  const [versions, setVersions] = useState<FeedbackVersion[]>([]);

  useEffect(() => {
    const data = getFeedbackVersions(feedbackId);
    setVersions(data);
  }, [feedbackId]);

  if (versions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
        <CardDescription>Track changes made to this feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {versions.map((version) => (
              <div key={version.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Version {version.version}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(version.changedAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium mb-2">
                  Changed by {version.changedBy}
                </p>
                <div className="space-y-2">
                  {version.changes.map((change, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-muted-foreground">{change.field}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs line-through">
                          {change.oldValue}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs">
                          {change.newValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
