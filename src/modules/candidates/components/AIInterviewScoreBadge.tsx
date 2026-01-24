import { Badge } from '@/shared/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { getAIInterviewsByCandidate } from '@/shared/lib/aiInterview/aiInterviewStorage';

interface AIInterviewScoreBadgeProps {
  candidateId: string;
  variant?: 'default' | 'compact';
}

export function AIInterviewScoreBadge({ candidateId, variant = 'default' }: AIInterviewScoreBadgeProps) {
  const interviews = getAIInterviewsByCandidate(candidateId);
  const completedInterviews = interviews.filter(i => i.status === 'completed' && i.analysis);
  
  if (completedInterviews.length === 0) {
    return null;
  }

  const avgScore = Math.round(
    completedInterviews.reduce((sum, i) => sum + (i.analysis?.overallScore || 0), 0) / completedInterviews.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500 hover:bg-green-600';
    if (score >= 70) return 'bg-blue-500 hover:bg-blue-600';
    if (score >= 60) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  if (variant === 'compact') {
    return (
      <Badge className={`${getScoreColor(avgScore)} text-white gap-1`}>
        <TrendingUp className="h-3 w-3" />
        {avgScore}
      </Badge>
    );
  }

  return (
    <Badge className={`${getScoreColor(avgScore)} text-white gap-1`}>
      <TrendingUp className="h-3 w-3" />
      AI Score: {avgScore}
      <span className="text-xs opacity-80">({completedInterviews.length} interview{completedInterviews.length > 1 ? 's' : ''})</span>
    </Badge>
  );
}
