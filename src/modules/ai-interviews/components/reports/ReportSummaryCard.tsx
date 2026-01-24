import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { InterviewReport } from '@/shared/types/aiInterviewReport';
import { FileText, User, Briefcase, TrendingUp, Eye, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ReportSummaryCardProps {
  report: InterviewReport;
  commentCount?: number;
  onView?: (report: InterviewReport) => void;
}

const STATUS_VARIANTS = {
  draft: 'outline' as const,
  'in-review': 'secondary' as const,
  finalized: 'default' as const
};

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-blue-600 dark:text-blue-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function ReportSummaryCard({ report, commentCount = 0, onView }: ReportSummaryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {report.candidateName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              {report.jobTitle}
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANTS[report.status]}>
            {report.status === 'in-review' ? 'In Review' : report.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
          <span className="text-sm font-medium">Overall Score</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(report.analysis.overallScore)}`}>
              {report.analysis.overallScore}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Recommendation:</span>
            <Badge variant="outline" className="capitalize">
              {report.analysis.recommendation.replace('-', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              v{report.version}
            </div>
            {report.isShared && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Shared with {report.sharedWith.length}
              </div>
            )}
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {commentCount} comments
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {report.executiveSummary}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {format(new Date(report.updatedAt), 'MMM d, yyyy')}</span>
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(report)}>
            View Report
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
