import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/components/layouts/AtsPageHeader";
import { BackgroundCheckNotificationBadge } from "@/components/backgroundChecks/BackgroundCheckNotificationBadge";
import { BackgroundChecksFilterBar } from "@/components/backgroundChecks/BackgroundChecksFilterBar";
import { BackgroundChecksBulkActionsToolbar } from "@/components/backgroundChecks/BackgroundChecksBulkActionsToolbar";
import { useAutomatedReminders } from "@/shared/hooks/useAutomatedReminders";
import { Button } from "@/shared/components/ui/button";
import { Shield, Plus, FileText, Download, Upload, BarChart3, CheckCircle, Clock, AlertCircle, Eye, TestTube, Mail, Settings, Bell, TrendingUp, X, Send, FileDown, Edit } from "lucide-react";
import { getBackgroundChecks, saveBackgroundCheck, getBackgroundCheckById } from "@/shared/lib/mockBackgroundCheckStorage";
import { getConsentsByBackgroundCheck } from "@/shared/lib/backgroundChecks/consentStorage";
import { getRefereesByBackgroundCheck } from "@/shared/lib/backgroundChecks/refereeStorage";
import { exportBackgroundCheckPDF } from "@/shared/lib/backgroundChecks/backgroundCheckExport";
import { generateMockAIReport } from "@/shared/lib/backgroundChecks/mockAIReportData";
import { saveAIReport } from "@/shared/lib/backgroundChecks/aiReportStorage";
import { saveAISession } from "@/shared/lib/backgroundChecks/aiReferenceCheckStorage";
import { AIReportEditor } from "@/components/backgroundChecks/ai-interview/AIReportEditor";
import { BackgroundCheck, BackgroundCheckType } from "@/shared/types/backgroundCheck";
import type { AIReferenceCheckSession, InterviewTranscript, AIAnalysis } from "@/shared/types/aiReferenceCheck";
import type { EditableReport } from "@/shared/types/aiReferenceReport";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu";
import { BackgroundCheckForm } from "@/components/backgroundChecks/BackgroundCheckForm";
import { toast } from "@/shared/hooks/use-toast";
import { EnhancedStatCard } from "@/components/dashboard/EnhancedStatCard";
import { createBackgroundCheckTableColumns } from "@/components/backgroundChecks/BackgroundCheckTableColumns";
import { DataTable } from "@/components/tables/DataTable";
import { getBackgroundCheckStats } from "@/shared/lib/backgroundChecks/dashboardStats";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

export default function BackgroundChecks() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [testEditorOpen, setTestEditorOpen] = useState(false);
  const [testSession, setTestSession] = useState<AIReferenceCheckSession | null>(null);
  const [testReport, setTestReport] = useState<EditableReport | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [checkTypeFilter, setCheckTypeFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [initiatedByFilter, setInitiatedByFilter] = useState<string>("");

  // Track if filters came from analytics
  const [analyticsFilterApplied, setAnalyticsFilterApplied] = useState(false);
  
  // Selected checks for bulk actions
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);

  // Enable automated reminders
  useAutomatedReminders({
    enabled: true,
    checkInterval: 60000, // Check every minute
    onRemindersProcessed: (result) => {
      console.log('Reminders processed:', result);
    }
  });

  useEffect(() => {
    loadChecks();
    
    // Apply filters from URL params (from analytics drill-down)
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const checkType = searchParams.get('checkType');
    const initiatedBy = searchParams.get('initiatedBy');
    const status = searchParams.get('status');
    
    if (dateFrom || dateTo || checkType || initiatedBy || status) {
      setAnalyticsFilterApplied(true);
      
      if (dateFrom) setDateFromFilter(dateFrom);
      if (dateTo) setDateToFilter(dateTo);
      if (checkType) setCheckTypeFilter(checkType);
      if (initiatedBy) setInitiatedByFilter(initiatedBy);
      if (status) setStatusFilter(status);
    }
  }, [searchParams]);

  const loadChecks = () => {
    setChecks(getBackgroundChecks());
  };

  const stats = getBackgroundCheckStats();

  // Filter checks based on active filters
  const filteredChecks = useMemo(() => {
    let filtered = checks;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(check => 
        check.candidateName.toLowerCase().includes(searchLower) ||
        check.id.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(check => check.status === statusFilter);
    }

    // Check type filter
    if (checkTypeFilter !== "all") {
      filtered = filtered.filter(check => 
        check.checkTypes.some(ct => ct.type === checkTypeFilter)
      );
    }

    // Result filter
    if (resultFilter !== "all") {
      if (resultFilter === "pending") {
        filtered = filtered.filter(check => !check.overallStatus);
      } else {
        filtered = filtered.filter(check => check.overallStatus === resultFilter);
      }
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(check => {
        const checkDate = new Date(check.initiatedDate).toISOString().split('T')[0];
        return checkDate >= dateFromFilter;
      });
    }

    if (dateToFilter) {
      filtered = filtered.filter(check => {
        const checkDate = new Date(check.initiatedDate).toISOString().split('T')[0];
        return checkDate <= dateToFilter;
      });
    }

    // Initiated by filter
    if (initiatedByFilter) {
      filtered = filtered.filter(check => check.initiatedBy === initiatedByFilter);
    }

    return filtered;
  }, [checks, searchTerm, statusFilter, checkTypeFilter, resultFilter, dateFromFilter, dateToFilter, initiatedByFilter]);

  type InitiateFormData = {
    provider: 'checkr' | 'sterling' | 'hireright' | 'manual';
    checkTypes: string[];
  };
  const handleInitiateCheck = (data: InitiateFormData) => {
    const newCheck: BackgroundCheck = {
      id: `bgc-${Date.now()}`,
      candidateId: 'cand-temp',
      candidateName: 'Sample Candidate',
      provider: data.provider,
      checkTypes: data.checkTypes.map((type: string) => ({
        type: type as BackgroundCheckType,
        required: true,
      })),
      status: 'pending-consent',
      initiatedBy: 'current-user',
      initiatedByName: 'Current User',
      initiatedDate: new Date().toISOString(),
      consentGiven: false,
      results: [],
      overallStatus: 'clear',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBackgroundCheck(newCheck);
    loadChecks();
    setIsFormOpen(false);
    toast({
      title: "Background Check Initiated",
      description: "Consent request has been sent to the candidate.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Your report is being generated...",
    });
  };

  const handleDownloadReport = (checkId: string) => {
    const check = getBackgroundCheckById(checkId);
    if (!check) {
      toast({
        title: "Error",
        description: "Background check not found.",
        variant: "destructive",
      });
      return;
    }

    const consents = getConsentsByBackgroundCheck(checkId);
    const referees = getRefereesByBackgroundCheck(checkId);
    
    try {
      exportBackgroundCheckPDF(check, consents, referees);
      toast({
        title: "Report Downloaded",
        description: "Background check report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = (checkId: string) => {
    toast({
      title: "Reminder Sent",
      description: "Consent reminder has been sent to the candidate.",
    });
  };

  const handleCancelCheck = (checkId: string) => {
    toast({
      title: "Check Cancelled",
      description: "Background check has been cancelled successfully.",
    });
  };

  const handleTestAIReport = () => {
    // Generate mock AI session
    const mockSessionId = `test_session_${Date.now()}`;
    const mockCandidateId = `test_candidate_${Date.now()}`;
    const mockRefereeId = `test_referee_${Date.now()}`;
    const mockBackgroundCheckId = checks.length > 0 ? checks[0].id : `test_check_${Date.now()}`;

    // Create comprehensive mock transcript
    const mockTranscript: InterviewTranscript = {
      sessionId: mockSessionId,
      turns: [
        {
          id: 'turn_1',
          speaker: 'ai-recruiter',
          text: 'Hello! Thank you for taking the time to speak with me today. I\'m conducting a reference check for Sarah Johnson who has applied for a Senior Software Engineer position. Can you please confirm your name and relationship to Sarah?',
          timestamp: 5,
        },
        {
          id: 'turn_2',
          speaker: 'referee',
          text: 'Yes, my name is Michael Chen. I was Sarah\'s direct manager at TechCorp for about three years. She reported to me in the engineering department.',
          timestamp: 18,
        },
        {
          id: 'turn_3',
          speaker: 'ai-recruiter',
          text: 'Thank you, Michael. Can you describe Sarah\'s primary responsibilities in her role at TechCorp?',
          timestamp: 28,
        },
        {
          id: 'turn_4',
          speaker: 'referee',
          text: 'Sarah was a senior full-stack developer on my team. She led multiple high-priority projects, mentored junior developers, and was responsible for architectural decisions on our main product platform. She also collaborated closely with product and design teams.',
          timestamp: 42,
        },
        {
          id: 'turn_5',
          speaker: 'ai-recruiter',
          text: 'How would you rate Sarah\'s technical skills and expertise?',
          timestamp: 58,
        },
        {
          id: 'turn_6',
          speaker: 'referee',
          text: 'Exceptional. Sarah has deep expertise across the full stack - React, TypeScript, Node.js, and cloud architecture. She consistently produced high-quality, maintainable code and was always up to date with the latest technologies. I\'d say she was one of our top technical contributors.',
          timestamp: 72,
        },
      ],
      summary: 'Comprehensive reference interview discussing technical skills, leadership, and work performance.',
      generatedAt: new Date().toISOString(),
    };

    // Create mock analysis
    const mockAnalysis: AIAnalysis = {
      sessionId: mockSessionId,
      overallRating: 5,
      sentiment: 'positive',
      keyInsights: [
        'Exceptional technical capabilities across the full stack',
        'Strong leadership and mentoring abilities',
        'Highly collaborative and effective communicator',
        'Consistently exceeded expectations',
      ],
      strengths: [
        'Deep technical expertise in React, TypeScript, and Node.js',
        'Natural leadership and mentoring skills',
        'Strong project management abilities',
        'Excellent communication with cross-functional teams',
      ],
      concerns: [
        'Tendency to overcommit occasionally',
        'Could improve delegation skills',
      ],
      recommendationScore: 92,
      categories: [
        {
          category: 'Technical Skills',
          score: 5,
          evidence: ['Deep expertise across full stack', 'High-quality maintainable code'],
        },
        {
          category: 'Leadership',
          score: 4,
          evidence: ['Mentored junior developers', 'Led high-priority projects'],
        },
        {
          category: 'Communication',
          score: 5,
          evidence: ['Collaborated with cross-functional teams', 'Clear and effective presenter'],
        },
      ],
      aiConfidence: 0.95,
      generatedAt: new Date().toISOString(),
    };

    // Create mock session
    const mockSession: AIReferenceCheckSession = {
      id: mockSessionId,
      refereeId: mockRefereeId,
      candidateId: mockCandidateId,
      backgroundCheckId: mockBackgroundCheckId,
      mode: 'video',
      status: 'completed',
      completedAt: new Date().toISOString(),
      duration: 1245,
      questionSource: 'template',
      transcript: mockTranscript,
      analysis: mockAnalysis,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save session to storage
    saveAISession(mockSession);

    // Generate and save mock report
    const mockReport = generateMockAIReport(mockSessionId, mockCandidateId);
    saveAIReport(mockReport);

    // Set state and open editor
    setTestSession(mockSession);
    setTestReport(mockReport);
    setTestEditorOpen(true);

    toast({
      title: "Test Report Generated",
      description: "Mock AI session and report created. Opening editor for testing...",
    });
  };

  const handleSaveTestReport = (editedReport: EditableReport) => {
    saveAIReport(editedReport);
    setTestEditorOpen(false);
    toast({
      title: "Test Report Saved",
      description: "The test report has been saved successfully.",
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCheckTypeFilter("all");
    setResultFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setInitiatedByFilter("");
    setAnalyticsFilterApplied(false);
    setSearchParams(new URLSearchParams());
  };

  const handleClearAnalyticsFilters = () => {
    setDateFromFilter("");
    setDateToFilter("");
    setCheckTypeFilter("all");
    setInitiatedByFilter("");
    setStatusFilter("all");
    setAnalyticsFilterApplied(false);
    setSearchParams(new URLSearchParams());
    
    toast({
      title: "Analytics Filters Cleared",
      description: "Showing all background checks",
    });
  };

  const activeFilterCount = [
    searchTerm ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    checkTypeFilter !== "all" ? 1 : 0,
    resultFilter !== "all" ? 1 : 0,
    dateFromFilter ? 1 : 0,
    dateToFilter ? 1 : 0,
    initiatedByFilter ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <DashboardPageLayout
      breadcrumbActions={
        <>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Background Checks"
          subtitle="Manage candidate screening and verification"
        >
          <div className="flex gap-2 items-center">
            <BackgroundCheckNotificationBadge />
            {/* Test Button (Development) */}
            <Button 
              variant="outline"
              onClick={handleTestAIReport}
              className="gap-2 border-dashed border-2"
            >
              <TestTube className="h-4 w-4" />
              Test AI Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/background-checks/digest-settings')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Configure Digest
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/background-checks/digest-settings')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email Digest Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/background-checks/escalation-rules')}>
                  <Bell className="h-4 w-4 mr-2" />
                  Escalation Rules
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/background-checks/sla-settings')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  SLA Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/background-checks/analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={() => navigate('/questionnaire-templates')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Initiate Check
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/addons?tab=background-checks">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </AtsPageHeader>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Background Checks"
            value={stats.total.toString()}
            change={`+${stats.changeFromLastMonth.total}%`}
            trend="up"
            icon={<Shield className="h-6 w-6" />}
            variant="neutral"
            iconPosition="left"
            showMenu={true}
            menuItems={[
              { label: "View all checks", icon: <Eye className="h-4 w-4" />, onClick: handleClearFilters },
              { label: "View dashboard", icon: <BarChart3 className="h-4 w-4" />, onClick: () => navigate('/dashboard/addons?tab=background-checks') },
              { label: "Export data", icon: <Download className="h-4 w-4" />, onClick: handleExport },
            ]}
          />
          <EnhancedStatCard
            title="Active Checks"
            value={stats.active.toString()}
            change={`${stats.changeFromLastMonth.active}%`}
            trend="down"
            icon={<Shield className="h-6 w-6" />}
            variant="primary"
            iconPosition="left"
            showMenu={true}
            menuItems={[
              { label: "View active checks", icon: <Eye className="h-4 w-4" />, onClick: () => { handleClearFilters(); setStatusFilter('in-progress'); } },
              { label: "Initiate new check", icon: <Plus className="h-4 w-4" />, onClick: () => setIsFormOpen(true) },
            ]}
          />
          <EnhancedStatCard
            title="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            change={`+${stats.changeFromLastMonth.completionRate}%`}
            trend="up"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            iconPosition="left"
            showMenu={true}
            menuItems={[
              { label: "View completed checks", icon: <Eye className="h-4 w-4" />, onClick: () => { handleClearFilters(); setStatusFilter('completed'); } },
              { label: "View dashboard", icon: <BarChart3 className="h-4 w-4" />, onClick: () => navigate('/dashboard/addons?tab=background-checks') },
            ]}
          />
          <EnhancedStatCard
            title="Avg. Completion Time"
            value={`${stats.avgCompletionTime} days`}
            change={`${stats.changeFromLastMonth.avgCompletionTime}%`}
            trend="down"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
            iconPosition="left"
            showMenu={true}
            menuItems={[
              { label: "View in-progress checks", icon: <Eye className="h-4 w-4" />, onClick: () => { handleClearFilters(); setStatusFilter('in-progress'); } },
              { label: "View performance metrics", icon: <BarChart3 className="h-4 w-4" />, onClick: () => navigate('/dashboard/addons?tab=background-checks') },
            ]}
          />
        </div>

        {/* Analytics Filter Alert */}
        {analyticsFilterApplied && (
          <Alert className="border-primary/50 bg-primary/5">
            <BarChart3 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-base font-semibold flex items-center justify-between">
              <span className="text-sm">
                Viewing filtered results from analytics drill-down.
                {dateFromFilter && ` Date: ${new Date(dateFromFilter).toLocaleDateString()}`}
                {checkTypeFilter !== 'all' && ` • Type: ${checkTypeFilter}`}
                {initiatedByFilter && ` • Recruiter filter applied`}
                {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAnalyticsFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <BackgroundChecksFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          checkTypeFilter={checkTypeFilter}
          onCheckTypeChange={setCheckTypeFilter}
          resultFilter={resultFilter}
          onResultChange={setResultFilter}
          onClearFilters={handleClearFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Background Checks Bulk Actions Toolbar */}
        <BackgroundChecksBulkActionsToolbar
          selectedCount={selectedChecks.length}
          onSendReminders={() => {
            const pendingChecks = filteredChecks.filter(
              c => selectedChecks.includes(c.id) && c.status === 'pending-consent'
            );
            if (pendingChecks.length === 0) {
              toast({
                title: "No eligible checks",
                description: "Selected checks must be in 'pending consent' status.",
                variant: "destructive",
              });
              return;
            }
            toast({
              title: "Reminders sent",
              description: `Successfully sent ${pendingChecks.length} reminder(s).`,
            });
          }}
          onExportReports={() => {
            const completedChecks = filteredChecks.filter(
              c => selectedChecks.includes(c.id) && c.status === 'completed'
            );
            if (completedChecks.length === 0) {
              toast({
                title: "No completed checks",
                description: "Only completed checks can be exported.",
                variant: "destructive",
              });
              return;
            }
            toast({
              title: "Export started",
              description: `Preparing ${completedChecks.length} report(s)...`,
            });
          }}
          onUpdateStatus={(status) => {
            toast({ title: "Status updated", description: `Updated ${selectedChecks.length} check(s) to ${status}` });
          }}
          onCancel={() => {
            const eligibleChecks = filteredChecks.filter(
              c => selectedChecks.includes(c.id) && 
              c.status !== 'completed' && 
              c.status !== 'cancelled'
            );
            toast({
              title: "Checks cancelled",
              description: `Cancelled ${eligibleChecks.length} check(s).`,
            });
            setSelectedChecks([]);
          }}
          onClearSelection={() => setSelectedChecks([])}
        />

        {/* Background Checks Table */}
        <div className="overflow-x-auto -mx-1 px-1">
          <DataTable
            data={filteredChecks}
            columns={createBackgroundCheckTableColumns(
              (checkId) => navigate(`/background-checks/${checkId}`),
              undefined,
              undefined,
              handleDownloadReport,
              handleSendReminder,
              handleCancelCheck
            )}
            selectable
            searchable={false}
            onSelectedRowsChange={setSelectedChecks}
            emptyMessage="No background checks found matching your criteria"
            tableId="background-checks"
            resizable
          />
        </div>

        {/* Initiate Check Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Initiate Background Check</DialogTitle>
            </DialogHeader>
            <BackgroundCheckForm
              candidateName="Sample Candidate"
              onSubmit={handleInitiateCheck}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Test AI Report Editor */}
        {testEditorOpen && testSession && testReport && (
          <AIReportEditor
            open={testEditorOpen}
            session={testSession}
            summary={testReport.summary}
            existingReport={testReport}
            onSave={handleSaveTestReport}
            onCancel={() => setTestEditorOpen(false)}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
