import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Calendar, Clock, Video, Phone, MessageSquare, User, Briefcase } from 'lucide-react';
import type { AIInterviewSession } from '@/shared/types/aiInterview';
import { format } from 'date-fns';

interface AIInterviewSessionCardProps {
  session: AIInterviewSession;
  onViewDetails?: (session: AIInterviewSession) => void;
  onStartInterview?: (session: AIInterviewSession) => void;
}

const STATUS_CONFIG = {
  // Use variants only; avoid forcing text color that can clash with bg
  scheduled: { label: 'Scheduled', variant: 'default' as const },
  ready: { label: 'Ready', variant: 'secondary' as const },
  'in-progress': { label: 'In Progress', variant: 'secondary' as const },
  completed: { label: 'Completed', variant: 'outline' as const },
  cancelled: { label: 'Cancelled', variant: 'outline' as const },
  'no-show': { label: 'No Show', variant: 'destructive' as const }
};

const MODE_ICONS = {
  video: Video,
  phone: Phone,
  text: MessageSquare
};

export function AIInterviewSessionCard({ session, onViewDetails, onStartInterview }: AIInterviewSessionCardProps) {
  const statusConfig = STATUS_CONFIG[session.status];
  const ModeIcon = MODE_ICONS[session.interviewMode];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {session.candidateName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              {session.jobTitle}
            </CardDescription>
          </div>
          <Badge variant={statusConfig.variant}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(session.scheduledDate), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(session.scheduledDate), 'h:mm a')}
          </div>
          <div className="flex items-center gap-1">
            <ModeIcon className="h-4 w-4" />
            <span className="capitalize">{session.interviewMode}</span>
          </div>
        </div>

        {session.status === 'in-progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {session.currentQuestionIndex} / {session.questions.length}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${(session.currentQuestionIndex / session.questions.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {session.status === 'completed' && session.analysis && (
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="text-sm font-medium">Overall Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {session.analysis.overallScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {session.status === 'scheduled' && onStartInterview && (
          <Button onClick={() => onStartInterview(session)} className="flex-1">
            Start Interview
          </Button>
        )}
        {onViewDetails && (
          <Button
            variant={session.status === 'scheduled' ? 'outline' : 'default'}
            onClick={() => onViewDetails(session)}
            className="flex-1"
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
