import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle, Clock, Eye, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface PendingActionsCardProps {
  pendingInvitations: number;
  expiringSoon: number;
  needsReview: number;
  lowScores: number;
  onSendInvitations: () => void;
  onViewExpiring: () => void;
  onViewReview: () => void;
  onViewLowScores: () => void;
}

export function PendingActionsCard({
  pendingInvitations,
  expiringSoon,
  needsReview,
  lowScores,
  onSendInvitations,
  onViewExpiring,
  onViewReview,
  onViewLowScores,
}: PendingActionsCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalPending = pendingInvitations + expiringSoon + needsReview + lowScores;

  if (totalPending === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30 transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-base transition-colors duration-500">Pending Actions</CardTitle>
              <CardDescription className="transition-colors duration-500">
                {totalPending} item{totalPending !== 1 ? 's' : ''} requiring attention
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {pendingInvitations > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-background p-3 dark:border-orange-800 transition-[background,border-color,box-shadow,color] duration-500">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Pending Invitations</p>
                  <p className="text-xs text-muted-foreground transition-colors duration-500">
                    {pendingInvitations} assessment{pendingInvitations !== 1 ? 's' : ''} ready to send
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={onSendInvitations}>
                Send
              </Button>
            </div>
          )}

          {expiringSoon > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-background p-3 dark:border-orange-800 transition-[background,border-color,box-shadow,color] duration-500">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Expiring Soon</p>
                  <p className="text-xs text-muted-foreground transition-colors duration-500">
                    {expiringSoon} assessment{expiringSoon !== 1 ? 's' : ''} expiring within 3 days
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={onViewExpiring}>
                View
              </Button>
            </div>
          )}

          {needsReview > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-background p-3 dark:border-orange-800 transition-[background,border-color,box-shadow,color] duration-500">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Needs Review</p>
                  <p className="text-xs text-muted-foreground transition-colors duration-500">
                    {needsReview} assessment{needsReview !== 1 ? 's' : ''} requiring manual review
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={onViewReview}>
                Review
              </Button>
            </div>
          )}

          {lowScores > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-background p-3 dark:border-orange-800 transition-[background,border-color,box-shadow,color] duration-500">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium transition-colors duration-500">Low Scores</p>
                  <p className="text-xs text-muted-foreground transition-colors duration-500">
                    {lowScores} candidate{lowScores !== 1 ? 's' : ''} with scores below 50%
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={onViewLowScores}>
                View
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
