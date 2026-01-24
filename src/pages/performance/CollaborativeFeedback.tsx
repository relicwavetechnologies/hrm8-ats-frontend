import { useState } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { CollaborativeFeedbackPanel } from '@/modules/performance/components/CollaborativeFeedbackPanel';
import { CandidateComparisonReport } from '@/modules/performance/components/CandidateComparisonReport';
import { DraggableRatingCriteria } from '@/modules/performance/components/DraggableRatingCriteria';
import { MobileDraggableRatingCriteria } from '@/modules/performance/components/MobileDraggableRatingCriteria';
import { FormLayoutCustomizer } from '@/modules/performance/components/FormLayoutCustomizer';
import { MobileFormLayoutCustomizer } from '@/modules/performance/components/MobileFormLayoutCustomizer';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { FeedbackAnalyticsChart } from '@/modules/performance/components/FeedbackAnalyticsChart';
import { FeedbackTemplateManager } from '@/modules/performance/components/FeedbackTemplateManager';
import { FeedbackSystemOverview } from '@/modules/performance/components/FeedbackSystemOverview';
import { DecisionRecorder } from '@/modules/performance/components/DecisionRecorder';
import { ActivityFeed } from '@/modules/performance/components/ActivityFeed';
import { NotificationCenter } from '@/modules/performance/components/NotificationCenter';
import { TeamPerformanceAnalytics } from '@/modules/performance/components/TeamPerformanceAnalytics';
import { Users, BarChart3, Settings, TrendingUp, Bell, FileText, LayoutDashboard, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollaborativeFeedback() {
  const isMobile = useIsMobile();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [comparisonCandidateIds, setComparisonCandidateIds] = useState<string[]>([]);
  const [candidateIdInput, setCandidateIdInput] = useState('');
  const [comparisonInput, setComparisonInput] = useState('');

  const handleLoadCandidate = () => {
    if (candidateIdInput.trim()) {
      setSelectedCandidateId(candidateIdInput.trim());
    }
  };

  const handleLoadComparison = () => {
    if (comparisonInput.trim()) {
      const ids = comparisonInput.split(',').map(id => id.trim()).filter(Boolean);
      setComparisonCandidateIds(ids);
    }
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Collaborative Feedback - ATS</title>
      </Helmet>
      <div className="space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collaborative Feedback</h1>
            <p className="text-muted-foreground">Multi-criteria candidate evaluation with team voting and consensus tracking</p>
          </div>
          <div className="flex gap-2">
            <Link to="/feedback-dashboard">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/feedback-templates">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </Link>
          </div>
        </div>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Multi-Criteria</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rate candidates on customizable criteria with confidence levels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Consensus Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Agreement Metrics</p>
              <p className="text-xs text-muted-foreground mt-1">
                Track team alignment and voting consensus in real-time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparison Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Side-by-Side</p>
              <p className="text-xs text-muted-foreground mt-1">
                Compare multiple candidates with aggregated team feedback
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback">Candidate Feedback</TabsTrigger>
            <TabsTrigger value="comparison">Comparison Report</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Rating Criteria</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <FeedbackSystemOverview />
          </TabsContent>

          {/* Candidate Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Load Candidate for Feedback</CardTitle>
                <CardDescription>
                  Enter a candidate ID to view and provide collaborative feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter candidate ID (e.g., candidate-1)"
                    value={candidateIdInput}
                    onChange={(e) => setCandidateIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadCandidate()}
                  />
                  <Button onClick={handleLoadCandidate}>Load Candidate</Button>
                </div>
              </CardContent>
            </Card>

            {selectedCandidateId ? (
              <CollaborativeFeedbackPanel
                candidateId={selectedCandidateId}
                candidateName={`Candidate ${selectedCandidateId}`}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a candidate ID above to start collaborative feedback</p>
                  <p className="text-sm mt-2">
                    Example: Try "candidate-1" or "candidate-2"
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comparison Report Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Load Candidates for Comparison</CardTitle>
                <CardDescription>
                  Enter multiple candidate IDs separated by commas to compare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter candidate IDs separated by commas (e.g., candidate-1, candidate-2)"
                    value={comparisonInput}
                    onChange={(e) => setComparisonInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadComparison()}
                  />
                  <Button onClick={handleLoadComparison}>Compare</Button>
                </div>
              </CardContent>
            </Card>

            {comparisonCandidateIds.length > 0 ? (
              <CandidateComparisonReport candidateIds={comparisonCandidateIds} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter candidate IDs above to generate a comparison report</p>
                  <p className="text-sm mt-2">
                    Example: Try "candidate-1, candidate-2, candidate-3"
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <FeedbackAnalyticsChart />
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <TeamPerformanceAnalytics />
          </TabsContent>

          {/* Activity Feed Tab */}
          <TabsContent value="activity" className="space-y-4">
            <ActivityFeed />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <FeedbackTemplateManager />
          </TabsContent>

          {/* Rating Criteria Tab */}
          <TabsContent value="settings" className="space-y-4">
            {isMobile ? (
              <>
                <MobileDraggableRatingCriteria />
                <MobileFormLayoutCustomizer />
              </>
            ) : (
              <>
                <DraggableRatingCriteria />
                <FormLayoutCustomizer />
              </>
            )}
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Record Hiring Decision</CardTitle>
                <CardDescription>
                  Make final hiring decisions based on team feedback and consensus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter candidate ID to record decision"
                      value={candidateIdInput}
                      onChange={(e) => setCandidateIdInput(e.target.value)}
                    />
                  </div>
                  {candidateIdInput ? (
                    <DecisionRecorder
                      candidateId={candidateIdInput}
                      candidateName={`Candidate ${candidateIdInput}`}
                      onDecisionRecorded={() => {}}
                    />
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter a candidate ID above to record a hiring decision</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
