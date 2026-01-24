import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { getAllFeedback } from '@/shared/lib/collaborativeFeedbackService';

export function FeedbackNotificationBadge() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // In a real app, this would check for feedback requests assigned to the current user
    // For now, we'll show a mock count
    const feedback = getAllFeedback();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentCount = feedback.filter(
      f => new Date(f.submittedAt) > weekAgo
    ).length;
    
    // Mock: Show 5 pending if there's recent activity, otherwise 0
    setPendingCount(recentCount > 0 ? 5 : 0);
  }, []);

  if (pendingCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2">
      {pendingCount}
    </Badge>
  );
}
