import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Briefcase, ExternalLink, Mail, Calendar } from 'lucide-react';
import { getCandidateApplications, updateApplicationStatus } from '@/shared/lib/mockCandidateApplications';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  applied: { label: 'Applied', variant: 'secondary' as const, color: 'bg-secondary' },
  screening: { label: 'Screening', variant: 'default' as const, color: 'bg-primary' },
  interviewing: { label: 'Interviewing', variant: 'default' as const, color: 'bg-accent' },
  offer: { label: 'Offer', variant: 'default' as const, color: 'bg-success' },
  hired: { label: 'Hired', variant: 'default' as const, color: 'bg-success' },
  rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-destructive' },
};

interface ApplicationsTabProps {
  candidateId: string;
}

export function ApplicationsTab({ candidateId }: ApplicationsTabProps) {
  const [applications, setApplications] = React.useState(getCandidateApplications(candidateId));

  const handleStatusChange = (appId: string, newStatus: keyof typeof STATUS_CONFIG) => {
    updateApplicationStatus(appId, newStatus);
    setApplications(getCandidateApplications(candidateId));
    toast.success('Application status updated');
  };

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No Applications Yet"
        description="This candidate hasn't applied to any jobs yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Applications</h3>
        <Badge variant="secondary">{applications.length} Total</Badge>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-1">{app.jobTitle}</h4>
                <p className="text-sm text-muted-foreground mb-3">{app.employer}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied: {format(app.appliedDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    Updated: {format(app.lastUpdated, 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <Badge variant={STATUS_CONFIG[app.status].variant}>
                {STATUS_CONFIG[app.status].label}
              </Badge>
            </div>

            {/* Status Pipeline */}
            <div className="flex items-center gap-2 mb-4">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <div
                  key={status}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    Object.keys(STATUS_CONFIG).indexOf(app.status) >= Object.keys(STATUS_CONFIG).indexOf(status)
                      ? config.color
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {app.notes && (
              <div className="p-3 bg-muted rounded-lg mb-4">
                <p className="text-sm">{app.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Job
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              
              {/* Quick Status Updates */}
              {app.status === 'applied' && (
                <Button size="sm" onClick={() => handleStatusChange(app.id, 'screening')}>
                  Move to Screening
                </Button>
              )}
              {app.status === 'screening' && (
                <Button size="sm" onClick={() => handleStatusChange(app.id, 'interviewing')}>
                  Schedule Interview
                </Button>
              )}
              {app.status === 'interviewing' && (
                <Button size="sm" onClick={() => handleStatusChange(app.id, 'offer')}>
                  Extend Offer
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}