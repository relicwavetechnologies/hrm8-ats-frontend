import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import type { InterviewReport } from '@/shared/types/aiInterviewReport';
import { InterviewScorecard } from '../analysis/InterviewScorecard';
import { FileText, Share2, Download, Edit, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewReportProps {
  report: InterviewReport;
  onEdit?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'outline' as const, icon: Edit },
  'in-review': { label: 'In Review', variant: 'secondary' as const, icon: Clock },
  finalized: { label: 'Finalized', variant: 'default' as const, icon: CheckCircle2 }
};

export function InterviewReport({ report, onEdit, onShare, onExport }: InterviewReportProps) {
  const statusConfig = STATUS_CONFIG[report.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interview Report
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {report.candidateName} • {report.jobTitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              <span className="text-xs text-muted-foreground">v{report.version}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {onEdit && report.status !== 'finalized' && (
              <Button variant="outline" onClick={onEdit} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Report
              </Button>
            )}
            {onShare && (
              <Button variant="outline" onClick={onShare} size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {onExport && (
              <Button variant="outline" onClick={onExport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Executive Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.executiveSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      <InterviewScorecard analysis={report.analysis} />

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-line text-muted-foreground">
              {report.recommendations}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-line text-muted-foreground">
              {report.nextSteps}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {format(new Date(report.createdAt), 'PPpp')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="font-medium">
              {format(new Date(report.updatedAt), 'PPpp')}
            </span>
          </div>
          {report.finalizedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Finalized:</span>
              <span className="font-medium">
                {format(new Date(report.finalizedAt), 'PPpp')}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shared:</span>
            <span className="font-medium">
              {report.isShared ? `Yes (${report.sharedWith.length} people)` : 'No'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
