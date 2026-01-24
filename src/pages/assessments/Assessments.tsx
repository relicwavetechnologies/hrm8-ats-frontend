import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/components/layouts/AtsPageHeader';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { AssessmentNotificationBadge } from '@/components/assessments/AssessmentNotificationBadge';
import { AssessmentsFilterBar } from '@/components/assessments/AssessmentsFilterBar';
import { AssessmentInvitationWizard } from '@/components/assessments/AssessmentInvitationWizard';
import { AssessmentsBulkActionsToolbar } from '@/components/assessments/AssessmentsBulkActionsToolbar';
import { createAssessmentTableColumns } from '@/components/assessments/AssessmentTableColumns';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ClipboardCheck, TrendingUp, Award, Clock, Settings, BarChart3, Calendar, Upload, Download, ChevronDown, Bell, XCircle } from 'lucide-react';
import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
import { getAssessmentStats } from '@/shared/lib/assessments/dashboardStats';
import { exportAssessments } from '@/shared/lib/assessments/exportAssessments';
import { useToast } from '@/shared/hooks/use-toast';

export default function Assessments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);

  const stats = getAssessmentStats();
  const allAssessments = getAssessments();

  const filteredAssessments = useMemo(() => {
    let filtered = allAssessments;

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.assessmentType === typeFilter);
    }

    if (providerFilter !== 'all') {
      filtered = filtered.filter(a => a.provider === providerFilter);
    }

    return filtered;
  }, [allAssessments, searchTerm, statusFilter, typeFilter, providerFilter]);

  const activeFilterCount = [
    searchTerm ? 1 : 0,
    statusFilter !== 'all' ? 1 : 0,
    typeFilter !== 'all' ? 1 : 0,
    providerFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setProviderFilter('all');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/assessments/${id}`);
  };

  const handleSendReminder = (id: string) => {
    toast({ title: "Reminder sent successfully" });
  };

  const handleDownloadReport = (id: string) => {
    toast({ title: "Report downloaded" });
  };

  const handleCancelAssessment = (id: string) => {
    toast({ title: "Assessment cancelled" });
  };

  const handleImport = () => {
    toast({ title: "Import functionality coming soon" });
  };

  const handleExport = (format: 'csv' | 'excel') => {
    try {
      const result = exportAssessments(filteredAssessments, { format });
      toast({
        title: "Export successful",
        description: `Exported ${result.recordCount} assessment${result.recordCount !== 1 ? 's' : ''} to ${result.filename}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardPageLayout
      breadcrumbActions={
        <>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Assessments"
          subtitle="Evaluate candidates through scientifically validated tests"
        >
          <div className="flex gap-2 items-center">
            <AssessmentNotificationBadge />
            <Button variant="outline" onClick={() => navigate('/scheduled-assessments')}>
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </Button>
            <Button variant="outline" onClick={() => navigate('/assessments/compare')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Compare Results
            </Button>
            <Button variant="outline" onClick={() => navigate('/assessment-templates')}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
            <Button onClick={() => setWizardOpen(true)}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Invite Candidate
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/addons?tab=assessments">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </AtsPageHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Assessments"
            value={stats.total}
            icon={<ClipboardCheck className="h-6 w-6" />}
            change={`${Math.abs(stats.changeFromLastMonth.total)}%`}
            trend={stats.changeFromLastMonth.total > 0 ? 'up' : 'down'}
            variant="neutral"
            showMenu={true}
            menuItems={[
              { label: 'View all assessments', onClick: () => clearFilters() },
              { label: 'View dashboard', onClick: () => navigate('/dashboard/assessments') },
              { label: 'Export data', onClick: () => toast({ title: "Exporting data..." }) }
            ]}
          />
          <EnhancedStatCard
            title="Active Assessments"
            value={stats.active}
            icon={<TrendingUp className="h-6 w-6" />}
            change={`${Math.abs(stats.changeFromLastMonth.active)}%`}
            trend={stats.changeFromLastMonth.active > 0 ? 'up' : 'down'}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: 'View active assessments', onClick: () => setStatusFilter('in-progress') },
              { label: 'Invite candidate', onClick: () => setWizardOpen(true) }
            ]}
          />
          <EnhancedStatCard
            title="Avg. Score"
            value={`${stats.avgScore}%`}
            icon={<Award className="h-6 w-6" />}
            change={`${Math.abs(stats.changeFromLastMonth.avgScore)}%`}
            trend={stats.changeFromLastMonth.avgScore > 0 ? 'up' : 'down'}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: 'View completed assessments', onClick: () => setStatusFilter('completed') },
              { label: 'View high performers', onClick: () => toast({ title: "Filtering high performers..." }) }
            ]}
          />
          <EnhancedStatCard
            title="Pass Rate"
            value={`${stats.passRate}%`}
            icon={<Clock className="h-6 w-6" />}
            change={`${Math.abs(stats.changeFromLastMonth.completed)}%`}
            trend={stats.changeFromLastMonth.completed > 0 ? 'up' : 'down'}
            variant="warning"
            showMenu={true}
            menuItems={[
              { label: 'View analytics', onClick: () => navigate('/dashboard/assessments') },
              { label: 'Export reports', onClick: () => toast({ title: "Exporting reports..." }) }
            ]}
          />
        </div>

        <AssessmentsFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          providerFilter={providerFilter}
          onProviderChange={setProviderFilter}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />

        <AssessmentsBulkActionsToolbar
          selectedCount={selectedAssessments.length}
          onSendReminders={() => {
            toast({ title: `Reminders sent to ${selectedAssessments.length} candidates` });
          }}
          onExportReports={() => {
            toast({ title: `Exporting ${selectedAssessments.length} reports` });
          }}
          onCancelAssessments={() => {
            toast({ title: `Cancelled ${selectedAssessments.length} assessments` });
            setSelectedAssessments([]);
          }}
          onClearSelection={() => setSelectedAssessments([])}
        />

        <div className="overflow-x-auto -mx-1 px-1">
          <DataTable
            data={filteredAssessments}
            columns={createAssessmentTableColumns(
              handleViewDetails,
              handleSendReminder,
              handleDownloadReport,
              handleCancelAssessment
            )}
            selectable
            searchable={false}
            onSelectedRowsChange={setSelectedAssessments}
            emptyMessage="No assessments found matching your criteria"
            tableId="assessments"
            resizable
          />
        </div>

        <AssessmentInvitationWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onComplete={() => window.location.reload()}
        />
      </div>
    </DashboardPageLayout>
  );
}
