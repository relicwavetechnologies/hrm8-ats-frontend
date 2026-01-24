import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Calendar, Clock, Mail, Trash2, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { toast } from '@/shared/hooks/use-toast';
import { ScheduledAssessment } from '@/shared/types/scheduledAssessment';
import { cancelScheduledAssessment, deleteScheduledAssessment, TIMEZONES } from '@/shared/lib/assessments/mockScheduledAssessmentStorage';

interface ScheduledAssessmentsTableProps {
  scheduledAssessments: ScheduledAssessment[];
  onUpdate: () => void;
}

export function ScheduledAssessmentsTable({ scheduledAssessments, onUpdate }: ScheduledAssessmentsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getStatusBadge = (status: ScheduledAssessment['status']) => {
    const variants = {
      scheduled: { variant: 'default' as const, label: 'Scheduled' },
      sent: { variant: 'default' as const, label: 'Sent' },
      cancelled: { variant: 'secondary' as const, label: 'Cancelled' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAssessmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'cognitive': 'Cognitive Ability',
      'personality': 'Personality',
      'technical-skills': 'Technical Skills',
      'situational-judgment': 'Situational Judgment',
      'behavioral': 'Behavioral',
      'culture-fit': 'Culture Fit',
      'custom': 'Custom',
    };
    return labels[type] || type;
  };

  const handleCancel = (id: string) => {
    cancelScheduledAssessment(id);
    toast({
      title: 'Assessment Cancelled',
      description: 'The scheduled assessment has been cancelled.',
    });
    onUpdate();
  };

  const handleDelete = (id: string) => {
    deleteScheduledAssessment(id);
    toast({
      title: 'Assessment Deleted',
      description: 'The scheduled assessment has been deleted.',
    });
    onUpdate();
  };

  const formatScheduledDateTime = (assessment: ScheduledAssessment) => {
    const timezoneLabel = TIMEZONES.find(tz => tz.value === assessment.timezone)?.label || assessment.timezone;
    return `${format(new Date(assessment.scheduledDate), 'MMM dd, yyyy')} at ${assessment.scheduledTime} (${timezoneLabel})`;
  };

  if (scheduledAssessments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Scheduled Assessments</h3>
        <p className="text-sm text-muted-foreground">
          Schedule assessment invitations to be sent automatically at specific dates and times.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Assessment Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Scheduled For</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduledAssessments.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{assessment.candidateName}</span>
                  <span className="text-xs text-muted-foreground">{assessment.candidateEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                {assessment.jobTitle || <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>{getAssessmentTypeLabel(assessment.assessmentType)}</TableCell>
              <TableCell className="capitalize">{assessment.provider}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(new Date(assessment.scheduledDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {assessment.scheduledTime} ({TIMEZONES.find(tz => tz.value === assessment.timezone)?.label})
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(assessment.status)}</TableCell>
              <TableCell>${assessment.cost}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {assessment.status === 'scheduled' && (
                      <>
                        <DropdownMenuItem onClick={() => handleCancel(assessment.id)}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel Schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDelete(assessment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
