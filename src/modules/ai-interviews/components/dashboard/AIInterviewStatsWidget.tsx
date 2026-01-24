import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { Video, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export interface AIInterviewStatsWidgetProps {
  metric: 'total' | 'completion-rate' | 'avg-score' | 'avg-duration';
}

export function AIInterviewStatsWidget({ metric }: AIInterviewStatsWidgetProps) {
  const sessions = getAIInterviewSessions();
  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  const metrics = {
    total: {
      title: 'Total AI Interviews',
      value: sessions.length,
      subtitle: `${completedSessions.length} completed`,
      icon: Video,
      trend: '+12%',
      suffix: '',
    },
    'completion-rate': {
      title: 'Completion Rate',
      value: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
      subtitle: 'Of scheduled interviews',
      icon: CheckCircle,
      trend: '+5%',
      suffix: '%',
    },
    'avg-score': {
      title: 'Average Score',
      value: completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.analysis?.overallScore || 0), 0) / completedSessions.length)
        : 0,
      subtitle: 'Out of 100',
      icon: TrendingUp,
      trend: '+8%',
      suffix: '',
    },
    'avg-duration': {
      title: 'Avg Duration',
      value: completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length / 60)
        : 0,
      subtitle: 'Per interview',
      icon: Clock,
      trend: '-2 min',
      suffix: ' min',
    },
  };

  const data = metrics[metric];
  const Icon = data.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value}{data.suffix || ''}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{data.subtitle}</p>
          <p className="text-xs text-green-600">{data.trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
