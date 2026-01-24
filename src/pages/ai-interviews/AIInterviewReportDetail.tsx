import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/components/layouts/AtsPageHeader';
import { useInterviewReport } from '@/shared/hooks/useInterviewReports';
import { useReportComments } from '@/shared/hooks/useReportComments';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { ArrowLeft, Share2, Download, MessageSquare } from 'lucide-react';
import { InterviewScorecard } from '@/components/aiInterview/analysis/InterviewScorecard';
import { format } from 'date-fns';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AIInterviewReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { report, loading } = useInterviewReport(id || '');
  const { comments, addComment } = useReportComments(id || '');
  const [newComment, setNewComment] = useState('');

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(newComment, 'current-user', 'Current User');
      setNewComment('');
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-500',
    'in-review': 'bg-blue-500',
    finalized: 'bg-green-500',
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
        title={`Interview Report: ${report.candidateName}`}
          subtitle={`${report.jobTitle} • ${format(new Date(report.createdAt), 'PPP')}`}
        >
          <div className="text-base font-semibold flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/ai-interviews/reports')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </AtsPageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="text-base font-semibold flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Report Status</CardTitle>
                <Badge className={statusColors[report.status]}>
                  {report.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Version {report.version}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.executiveSummary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewScorecard analysis={report.analysis} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.recommendations}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.nextSteps}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Team Discussion ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b pb-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{comment.userName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(comment.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddComment} size="sm" className="w-full">
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Report Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{format(new Date(report.createdAt), 'PPp')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{format(new Date(report.updatedAt), 'PPp')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created By</p>
                <p>{report.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardPageLayout>
  );
}
