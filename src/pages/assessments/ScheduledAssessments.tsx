import { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { ScheduledAssessmentsTable } from '@/components/assessments/ScheduledAssessmentsTable';
import { ScheduleAssessmentDialog } from '@/components/assessments/ScheduleAssessmentDialog';
import { toast } from '@/shared/hooks/use-toast';
import { 
  getAllScheduledAssessments, 
  checkAndSendScheduledAssessments 
} from '@/shared/lib/assessments/mockScheduledAssessmentStorage';
import { ScheduledAssessment } from '@/shared/types/scheduledAssessment';

export default function ScheduledAssessments() {
  const [scheduledAssessments, setScheduledAssessments] = useState<ScheduledAssessment[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const loadScheduledAssessments = () => {
    const assessments = getAllScheduledAssessments();
    setScheduledAssessments(assessments);
  };

  useEffect(() => {
    loadScheduledAssessments();

    // Simulate automatic checking every 30 seconds (in production, this would be backend)
    const interval = setInterval(() => {
      checkAndSendScheduledAssessments();
      loadScheduledAssessments();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckNow = () => {
    setIsChecking(true);
    checkAndSendScheduledAssessments();
    
    setTimeout(() => {
      loadScheduledAssessments();
      setIsChecking(false);
      toast({
        title: 'Check Complete',
        description: 'Scheduled assessments have been checked and processed.',
      });
    }, 1000);
  };

  const upcomingCount = scheduledAssessments.filter(a => a.status === 'scheduled').length;
  const sentCount = scheduledAssessments.filter(a => a.status === 'sent').length;

  return (
    <DashboardPageLayout
      title="Scheduled Assessments"
      breadcrumbActions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckNow}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsScheduleDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Schedule Assessment
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-base font-semibold flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Scheduled</p>
              <p className="text-3xl font-bold">{scheduledAssessments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-base font-semibold flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600">{upcomingCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-base font-semibold flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sent</p>
              <p className="text-3xl font-bold text-green-600">{sentCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Scheduled Assessments Table */}
      <div className="space-y-4">
        <div className="text-base font-semibold flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Scheduled Assessments</h2>
          <p className="text-sm text-muted-foreground">
            Assessments are automatically sent at their scheduled time
          </p>
        </div>
        <ScheduledAssessmentsTable 
          scheduledAssessments={scheduledAssessments}
          onUpdate={loadScheduledAssessments}
        />
      </div>

        <ScheduleAssessmentDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
        />
      </div>
    </DashboardPageLayout>
  );
}
