import { Column } from '@/shared/components/tables/DataTable';
import { Link } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MoreVertical, Eye, Bell, Download, XCircle } from 'lucide-react';
import { EntityAvatar } from '@/shared/components/tables/EntityAvatar';
import { ReminderStatusIndicator } from './ReminderStatusIndicator';
import type { Assessment } from '@/shared/types/assessment';
import { format } from 'date-fns';

const getStatusBadge = (status: Assessment['status']) => {
  const styles: Record<Assessment['status'], { label: string; className: string }> = {
    'draft': { label: 'Draft', className: 'text-foreground/70 border-foreground/20' },
    'pending-invitation': { label: 'Pending Invitation', className: 'text-warning border-warning/30 bg-warning/5' },
    'invited': { label: 'Invited', className: 'text-purple-600 border-purple-300/70 bg-purple-50/40' },
    'in-progress': { label: 'In Progress', className: 'text-blue-600 border-blue-300/70 bg-blue-50/40' },
    'completed': { label: 'Completed', className: 'text-success border-success/30 bg-success/5' },
    'expired': { label: 'Expired', className: 'text-destructive border-destructive/30 bg-destructive/5' },
    'cancelled': { label: 'Cancelled', className: 'text-foreground/60 border-foreground/20' },
  };
  const s = styles[status];
  return (
    <Badge
      variant="outline"
      className={`h-6 px-2 rounded-full text-xs font-medium ${s.className}`}
    >
      {s.label}
    </Badge>
  );
};

export const createAssessmentTableColumns = (
  onViewDetails: (id: string) => void,
  onSendReminder: (id: string) => void,
  onDownloadReport: (id: string) => void,
  onCancelAssessment: (id: string) => void
): Column<Assessment>[] => [
  {
    key: 'candidateName',
    label: 'Candidate',
    sortable: true,
    render: (assessment) => (
      <div className="flex items-center gap-3">
        <EntityAvatar
          name={assessment.employerName || 'Unknown'}
          src={assessment.employerLogo}
          type="logo"
        />
        <div className="min-w-0 flex-1">
          <Link to={`/candidates/${assessment.candidateId}`}>
            <p className="font-semibold text-base cursor-pointer line-clamp-1 block">
              {assessment.candidateName}
            </p>
          </Link>
          {assessment.jobTitle && (
            <Link to={`/jobs/${assessment.jobId}`}>
              <p className="text-sm text-muted-foreground line-clamp-1 block">
                {assessment.jobTitle}
              </p>
            </Link>
          )}
          {assessment.employerName && (
            <Link to={`/employers/${assessment.employerId}`}>
              <p className="text-xs text-muted-foreground line-clamp-1 block">
                {assessment.employerName}
              </p>
            </Link>
          )}
        </div>
      </div>
    )
  },
  {
    key: 'assessmentType',
    label: 'Type',
    sortable: true,
    render: (assessment) => (
      <span className="capitalize transition-colors duration-500">
        {assessment.assessmentType.replace('-', ' ')}
      </span>
    )
  },
  {
    key: 'provider',
    label: 'Provider',
    sortable: true,
    render: (assessment) => (
      <span className="capitalize transition-colors duration-500">
        {assessment.provider}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (assessment) => (
      <div className="flex flex-col items-start gap-1">
        {getStatusBadge(assessment.status)}
        <ReminderStatusIndicator
          remindersSent={assessment.remindersSent}
          lastReminderDate={assessment.lastReminderDate}
          invitedDate={assessment.invitedDate}
          status={assessment.status}
        />
      </div>
    )
  },
  {
    key: 'overallScore',
    label: 'Score',
    sortable: true,
    render: (assessment) => {
      if (assessment.overallScore) {
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {assessment.overallScore}%
            </span>
            {assessment.passed !== undefined && (
              <Badge
                variant="outline"
                className={`h-6 px-2 rounded-full text-xs ${assessment.passed ? 'text-success border-success/30 bg-success/5' : 'text-destructive border-destructive/30 bg-destructive/5'}`}
              >
                {assessment.passed ? 'Pass' : 'Fail'}
              </Badge>
            )}
          </div>
        );
      }
      return <span className="text-muted-foreground">—</span>;
    }
  },
  {
    key: 'invitedDate',
    label: 'Invited Date',
    sortable: true,
    render: (assessment) => (
      <span className="transition-colors duration-500">
        {format(new Date(assessment.invitedDate), 'MMM d, yyyy')}
      </span>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    width: "80px",
    render: (assessment) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails(assessment.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {assessment.status !== 'completed' && (
            <DropdownMenuItem onClick={() => onSendReminder(assessment.id)}>
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder
            </DropdownMenuItem>
          )}
          {assessment.status === 'completed' && (
            <DropdownMenuItem onClick={() => onDownloadReport(assessment.id)}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </DropdownMenuItem>
          )}
          {assessment.status !== 'completed' && assessment.status !== 'cancelled' && (
            <DropdownMenuItem onClick={() => onCancelAssessment(assessment.id)}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Assessment
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
];
