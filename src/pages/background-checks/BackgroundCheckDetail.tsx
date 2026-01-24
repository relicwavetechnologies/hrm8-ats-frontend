import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/components/layouts/AtsPageHeader';
import { ArrowLeft, Download, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, User, FileText, Shield, Mail, Edit, Eye, Users, History } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/hooks/use-toast';
import { getBackgroundCheckById } from '@/shared/lib/mockBackgroundCheckStorage';
import { getConsentsByBackgroundCheck, getConsentResponseByRequestId } from '@/shared/lib/backgroundChecks/consentStorage';
import { getRefereesByBackgroundCheck } from '@/shared/lib/backgroundChecks/refereeStorage';
import { getAISessionsByBackgroundCheck } from '@/shared/lib/backgroundChecks/aiReferenceCheckStorage';
import { getReportBySessionId, getReportsByCandidateId } from '@/shared/lib/backgroundChecks/aiReportStorage';
import { exportBackgroundCheckPDF } from '@/shared/lib/backgroundChecks/backgroundCheckExport';
import { exportAIReferencePDF } from '@/shared/lib/backgroundChecks/aiReportExport';
import { calculateSLAStatus } from '@/shared/lib/backgroundChecks/slaService';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import type { ConsentRequest } from '@/shared/types/consent';
import type { RefereeDetails } from '@/shared/types/referee';
import type { EditableReport } from '@/shared/types/aiReferenceReport';
import type { AIReferenceCheckSession } from '@/shared/types/aiReferenceCheck';
import BackgroundCheckTimeline from '@/components/backgroundChecks/BackgroundCheckTimeline';
import ConsentStatusSection from '@/components/backgroundChecks/ConsentStatusSection';
import RefereeResponsesSection from '@/components/backgroundChecks/RefereeResponsesSection';
import CheckResultsSection from '@/components/backgroundChecks/CheckResultsSection';
import { AIReportEditor } from '@/components/backgroundChecks/ai-interview/AIReportEditor';
import { EmailReportDialog } from '@/components/backgroundChecks/ai-interview/EmailReportDialog';
import RefereeComparison from '@/components/backgroundChecks/ai-interview/RefereeComparison';
import { StatusHistoryTimeline } from '@/components/backgroundChecks/StatusHistoryTimeline';
import { SLAIndicator } from '@/components/backgroundChecks/SLAIndicator';

export default function BackgroundCheckDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [check, setCheck] = useState<BackgroundCheck | null>(null);
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [referees, setReferees] = useState<RefereeDetails[]>([]);
  const [aiSessions, setAiSessions] = useState<AIReferenceCheckSession[]>([]);
  const [aiReports, setAiReports] = useState<EditableReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EditableReport | null>(null);
  const [selectedSession, setSelectedSession] = useState<AIReferenceCheckSession | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (id) {
      const checkData = getBackgroundCheckById(id);
      if (checkData) {
        setCheck(checkData);
        setConsents(getConsentsByBackgroundCheck(id));
        const refereesData = getRefereesByBackgroundCheck(id);
        setReferees(refereesData);
        
        // Load AI sessions and reports
        const sessions = getAISessionsByBackgroundCheck(id);
        setAiSessions(sessions);
        
        // Load reports for completed AI sessions
        const reports: EditableReport[] = [];
        sessions.forEach(session => {
          if (session.status === 'completed') {
            const report = getReportBySessionId(session.id);
            if (report) {
              reports.push(report);
            }
          }
        });
        setAiReports(reports);
      }
      setLoading(false);
    }
  }, [id]);

  const handleExportPDF = () => {
    if (check) {
      exportBackgroundCheckPDF(check, consents, referees);
    }
  };

  const handleViewReport = (report: EditableReport) => {
    const session = aiSessions.find(s => s.id === report.sessionId);
    if (session) {
      setSelectedReport(report);
      setSelectedSession(session);
      setEditorOpen(true);
    }
  };

  const handleExportAIPDF = (report: EditableReport, includeTranscript: boolean = false) => {
    const session = aiSessions.find(s => s.id === report.sessionId);
    if (session) {
      try {
        exportAIReferencePDF(report, session, {
          includeTranscript,
          includeMetadata: true,
          includeSignature: true,
        });
        toast({
          title: "PDF exported",
          description: includeTranscript 
            ? "AI report with full transcript downloaded successfully."
            : "AI report downloaded successfully.",
        });
      } catch (error) {
        console.error('Error exporting AI PDF:', error);
        toast({
          title: "Export failed",
          description: "Failed to generate PDF report.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveReport = (editedReport: EditableReport) => {
    // Report saving is handled by AIReportEditor
    setEditorOpen(false);
    toast({
      title: "Report saved",
      description: "AI report has been saved successfully.",
    });
    
    // Reload reports
    if (id) {
      const sessions = getAISessionsByBackgroundCheck(id);
      const reports: EditableReport[] = [];
      sessions.forEach(session => {
        if (session.status === 'completed') {
          const report = getReportBySessionId(session.id);
          if (report) {
            reports.push(report);
          }
        }
      });
      setAiReports(reports);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading background check details...</p>
        </div>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Background Check Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The background check you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/background-checks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Background Checks
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    'not-started': { label: 'Not Started', variant: 'secondary' as const, icon: Clock },
    'pending-consent': { label: 'Pending Consent', variant: 'warning' as const, icon: Mail },
    'in-progress': { label: 'In Progress', variant: 'default' as const, icon: Clock },
    'completed': { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
    'issues-found': { label: 'Issues Found', variant: 'destructive' as const, icon: AlertTriangle },
    'cancelled': { label: 'Cancelled', variant: 'secondary' as const, icon: XCircle },
  };

  const currentStatus = statusConfig[check.status];
  const StatusIcon = currentStatus.icon;

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title={check.candidateName}
          subtitle={`Background Check #${check.id.slice(0, 8).toUpperCase()} • Initiated ${new Date(check.initiatedDate).toLocaleDateString()} by ${check.initiatedByName}`}
        >
          <div className="text-base font-semibold flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/background-checks')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant={currentStatus.variant} className="gap-1.5 h-6 px-2 text-xs">
              <StatusIcon className="h-3 w-3" />
                  {currentStatus.label}
                </Badge>
                {(() => {
                  const slaStatus = calculateSLAStatus(check);
                  return slaStatus ? <SLAIndicator slaStatus={slaStatus} /> : null;
                })()}
            <Button size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
                </div>
        </AtsPageHeader>

        {/* Quick Stats Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                <p className="text-2xl font-bold">${check.totalCost?.toFixed(2) || '0.00'}</p>
              {check.paymentStatus && (
                  <Badge variant={check.paymentStatus === 'paid' ? 'success' : 'warning'} className="mt-1 text-xs">
                  {check.paymentStatus.charAt(0).toUpperCase() + check.paymentStatus.slice(1)}
                </Badge>
              )}
            </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Check Types</p>
                <p className="text-2xl font-bold">{check.checkTypes.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Provider</p>
                <p className="text-sm font-medium">{check.provider.toUpperCase()}</p>
          </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Referees</p>
                <p className="text-2xl font-bold">{referees.length}</p>
        </div>
      </div>
          </CardContent>
        </Card>

      {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timeline */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h2>
              <BackgroundCheckTimeline check={check} consents={consents} referees={referees} />
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 mt-6">
              <h3 className="text-base font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Check Types</span>
                  <Badge variant="secondary">{check.checkTypes.length}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <Badge variant="outline">{check.provider.toUpperCase()}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Referees</span>
                  <Badge variant="secondary">{referees.length}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Consent Status</span>
                  <Badge variant={check.consentGiven ? 'success' : 'warning'}>
                    {check.consentGiven ? 'Given' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="results">Check Results</TabsTrigger>
                <TabsTrigger value="consent">Consent Status</TabsTrigger>
                <TabsTrigger value="referees">Referee Responses</TabsTrigger>
                <TabsTrigger value="ai-reports">
                  AI Reports
                  {aiReports.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {aiReports.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-1.5" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="mt-6">
                <CheckResultsSection check={check} />
              </TabsContent>

              <TabsContent value="consent" className="mt-6">
                <ConsentStatusSection check={check} consents={consents} />
              </TabsContent>

              <TabsContent value="referees" className="mt-6">
                <RefereeResponsesSection check={check} referees={referees} />
              </TabsContent>

              <TabsContent value="ai-reports" className="mt-6">
                {showComparison && aiReports.length >= 2 ? (
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowComparison(false)}
                      className="mb-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Reports List
                    </Button>
                    <RefereeComparison
                      reports={aiReports.map((r) => r.summary)}
                      candidateName={check.candidateName}
                      candidateId={check.candidateId}
                    />
                  </div>
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        AI Reference Check Reports
                      </h3>
                      {aiReports.length >= 2 && (
                        <Button
                          variant="outline"
                          onClick={() => setShowComparison(true)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Compare {aiReports.length} Reports
                        </Button>
                      )}
                    </div>
                    
                    {aiReports.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No AI reports available yet.</p>
                        <p className="text-sm mt-1">Reports will appear here once AI reference interviews are completed.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {aiReports.map((report) => {
                        const session = aiSessions.find(s => s.id === report.sessionId);
                        return (
                          <Card key={report.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex flex-col">
                                    <h4 className="font-semibold">{report.summary.candidateName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Referee: {report.summary.refereeInfo.name} ({report.summary.refereeInfo.relationship})
                                    </p>
                                  </div>
                                  <Badge variant={
                                    report.status === 'finalized' ? 'default' : 
                                    report.status === 'reviewed' ? 'secondary' : 'outline'
                                  }>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Interview Mode:</span>
                                    <span className="ml-2 font-medium capitalize">{report.summary.sessionDetails.mode}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Overall Score:</span>
                                    <span className="ml-2 font-medium">{report.summary.recommendation.overallScore}/100</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Recommendation:</span>
                                    <Badge 
                                      variant={
                                        report.summary.recommendation.hiringRecommendation === 'strongly-recommend' ? 'default' :
                                        report.summary.recommendation.hiringRecommendation === 'recommend' ? 'secondary' :
                                        report.summary.recommendation.hiringRecommendation === 'neutral' ? 'outline' :
                                        'destructive'
                                      }
                                      className="ml-2"
                                    >
                                      {report.summary.recommendation.hiringRecommendation.replace(/-/g, ' ')}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Completed:</span>
                                    <span className="ml-2">{new Date(report.summary.sessionDetails.completedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  View/Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExportAIPDF(report, false)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export PDF
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setEmailDialogOpen(true);
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Email
                                </Button>
                              </div>
                            </div>
                          </Card>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <StatusHistoryTimeline checkId={check.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* AI Report Editor Dialog */}
      {editorOpen && selectedReport && selectedSession && (
        <AIReportEditor
          open={editorOpen}
          session={selectedSession}
          summary={selectedReport.summary}
          existingReport={selectedReport}
          onSave={handleSaveReport}
          onCancel={() => setEditorOpen(false)}
        />
      )}

      {/* Email Report Dialog */}
      <EmailReportDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        report={selectedReport}
      />
    </DashboardPageLayout>
  );
}
