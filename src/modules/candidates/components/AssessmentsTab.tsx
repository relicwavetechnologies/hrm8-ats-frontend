import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { AssessmentInvitationWizard } from '@/components/assessments/AssessmentInvitationWizard';
import { AssessmentScoreChart } from './AssessmentScoreChart';
import { AssessmentComparison } from './AssessmentComparison';
import { AssessmentPredictionCard } from '@/components/assessments/AssessmentPredictionCard';
import { getAssessmentsByCandidate } from '@/shared/lib/mockAssessmentStorage';
import { ASSESSMENT_PRICING } from '@/shared/lib/assessments/pricingConstants';
import { generatePrediction } from '@/shared/lib/assessments/predictionService';
import { ClipboardCheck, Calendar, Clock, Award, Eye, Bell, Download, XCircle, TrendingUp, Users } from 'lucide-react';
import type { Assessment } from '@/shared/types/assessment';
import { format } from 'date-fns';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AssessmentsTabProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
}

export function AssessmentsTab({ candidateId, candidateName, candidateEmail }: AssessmentsTabProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>(() => getAssessmentsByCandidate(candidateId));
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleWizardComplete = () => {
    setAssessments(getAssessmentsByCandidate(candidateId));
  };

  const getStatusBadge = (status: Assessment['status']) => {
    const variants: Record<Assessment['status'], { variant: any; label: string }> = {
      'draft': { variant: 'secondary', label: 'Draft' },
      'pending-invitation': { variant: 'warning', label: 'Pending' },
      'invited': { variant: 'default', label: 'Invited' },
      'in-progress': { variant: 'default', label: 'In Progress' },
      'completed': { variant: 'success', label: 'Completed' },
      'expired': { variant: 'destructive', label: 'Expired' },
      'cancelled': { variant: 'secondary', label: 'Cancelled' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 transition-colors duration-500">No Assessments</h3>
          <p className="text-muted-foreground text-center mb-6 transition-colors duration-500">
            This candidate hasn't been invited to any assessments yet.
          </p>
          <Button onClick={() => setWizardOpen(true)}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Invite to Assessment
          </Button>

          <AssessmentInvitationWizard
            open={wizardOpen}
            onClose={() => setWizardOpen(false)}
            candidateId={candidateId}
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            onComplete={handleWizardComplete}
          />
        </CardContent>
      </Card>
    );
  }

  // Get the most recent job ID from completed assessments
  const recentJobId = assessments
    .filter(a => a.jobId && a.status === 'completed')
    .sort((a, b) => new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime())[0]?.jobId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold transition-colors duration-500">Assessments</h3>
          <p className="text-sm text-muted-foreground transition-colors duration-500">
            {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} for this candidate
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Invite to Assessment
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <Users className="h-4 w-4 mr-2" />
            Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {assessments.map((assessment) => {
          const assessmentInfo = ASSESSMENT_PRICING[assessment.assessmentType];
          const Icon = assessmentInfo.icon;

          return (
            <Card key={assessment.id} className="transition-[background,border-color,box-shadow,color] duration-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base transition-colors duration-500">
                        {assessmentInfo.name}
                      </CardTitle>
                      <CardDescription className="transition-colors duration-500">
                        {assessmentInfo.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(assessment.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground transition-colors duration-500">Invited</p>
                      <p className="font-medium transition-colors duration-500">
                        {format(new Date(assessment.invitedDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground transition-colors duration-500">Duration</p>
                      <p className="font-medium transition-colors duration-500">{assessmentInfo.duration} min</p>
                    </div>
                  </div>
                  {assessment.completedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground transition-colors duration-500">Completed</p>
                        <p className="font-medium transition-colors duration-500">
                          {format(new Date(assessment.completedDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                  {assessment.overallScore !== undefined && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground transition-colors duration-500">Score</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium transition-colors duration-500">{assessment.overallScore}%</p>
                          {assessment.passed !== undefined && (
                            <Badge variant={assessment.passed ? 'success' : 'destructive'} className="text-xs">
                              {assessment.passed ? 'Pass' : 'Fail'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {assessment.status === 'completed' && assessment.result && (
                  <div className="rounded-lg border bg-muted/50 p-4 transition-[background,border-color,box-shadow,color] duration-500">
                    <p className="text-sm font-medium mb-2 transition-colors duration-500">Assessment Results</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {assessment.result.details?.categoryScores && 
                        Object.entries(assessment.result.details.categoryScores).map(([category, score]) => (
                          <div key={category}>
                            <p className="text-xs text-muted-foreground transition-colors duration-500">{category}</p>
                            <p className="font-medium transition-colors duration-500">{score}%</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(assessment.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {assessment.status !== 'completed' && assessment.status !== 'cancelled' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(assessment.id)}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelAssessment(assessment.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {assessment.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(assessment.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <AssessmentScoreChart
            assessments={assessments}
            candidateName={candidateName}
            jobId={recentJobId}
          />
          
          {/* AI Performance Prediction for Most Recent Completed Assessment */}
          {assessments.filter(a => a.status === 'completed' && a.overallScore).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Success Prediction</h3>
              <AssessmentPredictionCard 
                prediction={generatePrediction(
                  assessments
                    .filter(a => a.status === 'completed' && a.overallScore)
                    .sort((a, b) => new Date(b.completedDate || 0).getTime() - new Date(a.completedDate || 0).getTime())[0]
                )} 
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <AssessmentComparison
            candidateId={candidateId}
            candidateName={candidateName}
            jobId={recentJobId}
          />
        </TabsContent>
      </Tabs>

      <AssessmentInvitationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        candidateId={candidateId}
        candidateName={candidateName}
        candidateEmail={candidateEmail}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
