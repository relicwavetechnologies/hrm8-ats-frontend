import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Calendar, 
  Video, 
  Phone, 
  MessageSquare, 
  Play, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Plus
} from 'lucide-react';
import { getAIInterviewsByCandidate } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { format } from 'date-fns';
import type { InterviewStatus } from '@/shared/types/aiInterview';

interface AIInterviewsTabProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
}

const STATUS_CONFIG: Record<InterviewStatus, { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline'; 
  icon: any;
  color: string;
}> = {
  'scheduled': { label: 'Scheduled', variant: 'secondary', icon: Clock, color: 'text-blue-600' },
  'ready': { label: 'Ready', variant: 'default', icon: CheckCircle2, color: 'text-green-600' },
  'in-progress': { label: 'In Progress', variant: 'default', icon: Play, color: 'text-yellow-600' },
  'completed': { label: 'Completed', variant: 'outline', icon: CheckCircle2, color: 'text-green-600' },
  'cancelled': { label: 'Cancelled', variant: 'destructive', icon: XCircle, color: 'text-red-600' },
  'no-show': { label: 'No Show', variant: 'destructive', icon: XCircle, color: 'text-gray-600' },
};

const MODE_ICONS = {
  video: Video,
  phone: Phone,
  text: MessageSquare,
};

export function AIInterviewsTab({ candidateId, candidateName, candidateEmail }: AIInterviewsTabProps) {
  const navigate = useNavigate();
  const [interviews] = useState(() => getAIInterviewsByCandidate(candidateId));

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.analysis?.overallScore || 0), 0) / completedInterviews.length)
    : null;

  const handleScheduleNew = () => {
    navigate('/ai-interviews/schedule', { 
      state: { 
        candidateId, 
        candidateName, 
        candidateEmail 
      } 
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Interviews</CardDescription>
            <CardTitle className="text-3xl">{interviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{completedInterviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {avgScore !== null ? (
                <>
                  <span className={avgScore >= 75 ? 'text-green-600' : avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                    {avgScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </>
              ) : (
                <span className="text-muted-foreground text-xl">N/A</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Schedule New Interview Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Schedule AI Interview</h3>
              <p className="text-sm text-muted-foreground">
                Conduct an automated AI-powered interview for {candidateName}
              </p>
            </div>
            <Button onClick={handleScheduleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule New
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interview History */}
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
          <CardDescription>All AI interviews for this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No AI interviews scheduled yet</p>
              <Button onClick={handleScheduleNew} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => {
                const statusConfig = STATUS_CONFIG[interview.status];
                const StatusIcon = statusConfig.icon;
                const ModeIcon = MODE_ICONS[interview.interviewMode];

                return (
                  <div key={interview.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {interview.jobTitle}
                              <Badge variant={statusConfig.variant} className="ml-2">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ModeIcon className="h-3 w-3" />
                                <span className="capitalize">{interview.interviewMode}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(interview.scheduledDate), 'PPp')}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Score Badge */}
                          {interview.analysis && (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className={`text-2xl font-bold ${
                                  interview.analysis.overallScore >= 85 ? 'text-green-600' :
                                  interview.analysis.overallScore >= 70 ? 'text-blue-600' :
                                  interview.analysis.overallScore >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {interview.analysis.overallScore}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">Overall Score</span>
                            </div>
                          )}
                        </div>

                        {/* Analysis Summary */}
                        {interview.analysis && (
                          <>
                            <Separator />
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Technical</p>
                                <p className="font-medium">{interview.analysis.categoryScores.technical}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Communication</p>
                                <p className="font-medium">{interview.analysis.categoryScores.communication}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Cultural Fit</p>
                                <p className="font-medium">{interview.analysis.categoryScores.culturalFit}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Experience</p>
                                <p className="font-medium">{interview.analysis.categoryScores.experience}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Problem Solving</p>
                                <p className="font-medium">{interview.analysis.categoryScores.problemSolving}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {interview.analysis.recommendation.replace('-', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Confidence: {interview.analysis.confidenceScore}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/ai-interviews/${interview.id}`)}
                      >
                        View Details
                      </Button>
                      {interview.status === 'scheduled' && (
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/ai-interviews/session/${interview.invitationToken}`)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Interview
                        </Button>
                      )}
                      {interview.reportId && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/ai-interviews/reports/${interview.reportId}`)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
