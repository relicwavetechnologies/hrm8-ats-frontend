import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  getCandidateFeedback,
  calculateConsensusMetrics,
  getCandidateVotes,
  getCandidateDecisionHistory,
  getRecommendationColor,
  getRecommendationLabel,
  getRatingCriteria,
} from '@/shared/lib/collaborativeFeedbackService';
import { TeamMemberFeedback, ConsensusMetrics } from '@/shared/types/collaborativeFeedback';
import { CollaborativeFeedbackForm } from './CollaborativeFeedbackForm';
import { TeamVoting } from './TeamVoting';
import { DecisionRecorder } from './DecisionRecorder';
import { VotingPanel } from './VotingPanel';
import { TeamConsensusView } from './TeamConsensusView';
import { FeedbackFilterBar } from './FeedbackFilterBar';
import { FeedbackRequestDialog } from './FeedbackRequestDialog';
import { BulkFeedbackRequestDialog } from './BulkFeedbackRequestDialog';
import { PendingFeedbackRequests } from './PendingFeedbackRequests';
import { FeedbackResponseTracker } from './FeedbackResponseTracker';
import FeedbackLiveCollaboration from './FeedbackLiveCollaboration';
import { useFeedbackPresence } from '@/shared/hooks/useFeedbackPresence';
import { useTypingIndicator } from '@/shared/hooks/useTypingIndicator';
import { useRealtimeFeedback } from '@/shared/hooks/useRealtimeFeedback';
import { TypingIndicator } from './TypingIndicator';
import { RealtimeUpdateNotification } from './RealtimeUpdateNotification';
import { RealtimeConnectionStatus } from './RealtimeConnectionStatus';
import { toast } from '@/shared/hooks/use-toast';
import { ActivityFeed } from './ActivityFeed';
import { CommentThreads } from './CommentThreads';
import { FeedbackVersionHistory } from './FeedbackVersionHistory';
import { FeedbackExporter } from './FeedbackExporter';
import { AIFeedbackInsights } from './AIFeedbackInsights';
import { FeedbackQualityIndicator } from './FeedbackQualityIndicator';
import { InterviewQuestionGenerator } from './InterviewQuestionGenerator';
import { AIInsightsComparison } from './AIInsightsComparison';
import { TeamAIAnalyticsDashboard } from './TeamAIAnalyticsDashboard';
import { EditFeedbackDialog } from './EditFeedbackDialog';
import { calculateFeedbackQuality } from '@/shared/lib/mockFeedbackQuality';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, AlertCircle, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface CollaborativeFeedbackPanelProps {
  candidateId: string;
  candidateName: string;
  applicationId?: string;
}

export function CollaborativeFeedbackPanel({
  candidateId,
  candidateName,
  applicationId,
}: CollaborativeFeedbackPanelProps) {
  const [feedback, setFeedback] = useState<TeamMemberFeedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<TeamMemberFeedback[]>([]);
  const [consensus, setConsensus] = useState<ConsensusMetrics | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string>('');
  const [currentAIAnalysis, setCurrentAIAnalysis] = useState<any>(null);
  const [editingFeedback, setEditingFeedback] = useState<TeamMemberFeedback | null>(null);
  const criteria = getRatingCriteria();
  
  // Real-time presence tracking
  const { activeUsers, updatePresence } = useFeedbackPresence({
    candidateId,
    currentUserId: 'current-user',
    currentUserName: 'John Doe',
    currentUserRole: 'Hiring Manager',
  });

  // Typing indicators
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
    candidateId,
    currentUserId: 'current-user',
  });

  // Real-time feedback updates
  const { recentUpdates, isConnected, broadcastFeedback, clearUpdates } = useRealtimeFeedback({
    candidateId,
    onUpdate: (update) => {
      if (update.feedback.reviewerId !== 'current-user') {
        toast({
          title: update.type === 'new' ? '🎉 New Feedback' : '🔄 Feedback Updated',
          description: `${update.feedback.reviewerName} ${update.type === 'new' ? 'submitted' : 'updated'} their feedback`,
        });
      }
    },
  });

  const handleRefreshFeedback = () => {
    loadData();
    clearUpdates();
    toast({
      title: '✅ Feedback Refreshed',
      description: 'You are viewing the latest feedback from all team members',
    });
  };

  const loadData = () => {
    const feedbackData = getCandidateFeedback(candidateId);
    const consensusData = calculateConsensusMetrics(candidateId);
    setFeedback(feedbackData);
    setFilteredFeedback(feedbackData);
    setConsensus(consensusData);
  };

  useEffect(() => {
    loadData();
  }, [candidateId]);

  return (
    <div className="space-y-6">
      {/* Real-time Update Notifications */}
      <RealtimeUpdateNotification
        updates={recentUpdates}
        onRefresh={handleRefreshFeedback}
        onDismiss={clearUpdates}
      />

      {/* Live Collaboration */}
      <FeedbackLiveCollaboration 
        activeUsers={activeUsers}
        currentUserId="current-user"
      />

      {/* Consensus Overview */}
      {consensus && consensus.totalFeedbacks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Consensus
            </CardTitle>
            <CardDescription>Aggregated team feedback and alignment metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{consensus.averageScore.toFixed(1)}</p>
                <Progress value={consensus.averageScore} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Agreement Level</p>
                <p className="text-3xl font-bold">{(consensus.agreementLevel * 100).toFixed(0)}%</p>
                <Progress value={consensus.agreementLevel * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  {consensus.totalFeedbacks}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Std Deviation</p>
                <p className="text-3xl font-bold">{consensus.scoreStdDev.toFixed(1)}</p>
              </div>
            </div>

            {/* Recommendation Distribution */}
            <div>
              <h4 className="font-semibold mb-3">Recommendation Distribution</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(consensus.recommendationDistribution).map(([rec, count]) => (
                  <Badge key={rec} className={getRecommendationColor(rec)}>
                    {getRecommendationLabel(rec)}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Criteria Averages */}
            <div>
              <h4 className="font-semibold mb-3">Criteria Averages</h4>
              <div className="space-y-3">
                {criteria.map(criterion => {
                  const avg = consensus.criteriaAverages[criterion.id] || 0;
                  return (
                    <div key={criterion.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{criterion.name}</span>
                        <span className="text-sm font-bold">{avg.toFixed(1)}/10</span>
                      </div>
                      <Progress value={avg * 10} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Top Strengths
                </h4>
                <ul className="space-y-1">
                  {consensus.topStrengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Top Concerns
                </h4>
                <ul className="space-y-1">
                  {consensus.topConcerns.slice(0, 3).map((concern, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {concern}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="feedback" className="relative">
            Team Feedback ({feedback.length})
            {recentUpdates.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-pulse">
                {recentUpdates.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="tracking">Response Tracking</TabsTrigger>
          <TabsTrigger value="consensus">Consensus</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
          <TabsTrigger value="provide">Provide Feedback</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Individual Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TypingIndicator typingUsers={typingUsers} />
              <RealtimeConnectionStatus isConnected={isConnected} />
            </div>
            <div className="flex gap-2">
              <FeedbackExporter candidateId={candidateId} candidateName={candidateName} />
              <FeedbackRequestDialog 
                candidateId={candidateId}
                candidateName={candidateName}
              />
              <BulkFeedbackRequestDialog 
                candidateId={candidateId}
                candidateName={candidateName}
              />
            </div>
          </div>
          {feedback.length > 0 && (
            <FeedbackFilterBar
              feedback={feedback}
              onFilteredChange={setFilteredFeedback}
            />
          )}
          {filteredFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No feedback yet. Be the first to provide feedback!
              </CardContent>
            </Card>
          ) : (
            filteredFeedback.map((fb) => (
              <Card key={fb.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{fb.reviewerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{fb.reviewerName}</CardTitle>
                        <CardDescription>
                          {fb.reviewerRole} • {formatDistanceToNow(new Date(fb.submittedAt), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right space-y-2">
                        <div>
                          <div className="text-2xl font-bold">{fb.overallScore}</div>
                          <Badge className={getRecommendationColor(fb.recommendation)}>
                            {getRecommendationLabel(fb.recommendation)}
                          </Badge>
                        </div>
                        <FeedbackQualityIndicator 
                          quality={calculateFeedbackQuality(
                            fb.comments.map(c => c.content).join(' '),
                            fb.comments.length
                          )}
                          compact
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFeedback(fb)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ratings */}
                  <div>
                    <h4 className="font-semibold mb-2">Ratings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {fb.ratings.map((rating) => {
                        const criterion = criteria.find(c => c.id === rating.criterionId);
                        return (
                          <div key={rating.criterionId} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{criterion?.name}</span>
                            <span className="font-bold">{rating.value}/10</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments */}
                  {fb.comments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments
                      </h4>
                      <div className="space-y-2">
                        {fb.comments.map((comment) => (
                          <div key={comment.id} className="p-3 border rounded-lg">
                            <div className="flex gap-2 mb-1">
                              <Badge variant="outline">{comment.type}</Badge>
                              <Badge variant="secondary">{comment.importance}</Badge>
                              {comment.category && <Badge variant="secondary">{comment.category}</Badge>}
                            </div>
                            <p className="text-sm mt-2">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Confidence: {fb.confidence}/5</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Consensus Tab */}
        <TabsContent value="consensus" className="space-y-4">
          {consensus ? (
            <TeamConsensusView metrics={consensus} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No consensus data available yet. At least one feedback is required.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No feedback available to analyze. Submit feedback first to see AI insights.
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="individual">Individual Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
                <TabsTrigger value="questions">Interview Questions</TabsTrigger>
                <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Feedback to Analyze</CardTitle>
                    <CardDescription>Choose which team member's feedback to analyze</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedFeedbackId || feedback[0]?.id}
                      onValueChange={setSelectedFeedbackId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedback.map(fb => (
                          <SelectItem key={fb.id} value={fb.id}>
                            {fb.reviewerName} - {fb.reviewerRole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {(() => {
                  const selectedFeedback = feedback.find(
                    fb => fb.id === (selectedFeedbackId || feedback[0]?.id)
                  ) || feedback[0];
                  const feedbackText = selectedFeedback.comments
                    .map(c => `[${c.type.toUpperCase()}] ${c.content}`)
                    .join('\n\n');
                  const quality = calculateFeedbackQuality(
                    selectedFeedback.comments.map(c => c.content).join(' '),
                    selectedFeedback.comments.length
                  );

                  return (
                    <>
                      <FeedbackQualityIndicator quality={quality} />
                      <AIFeedbackInsights 
                        feedbackText={feedbackText}
                        onAnalysisComplete={setCurrentAIAnalysis}
                      />
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <AIInsightsComparison feedbacks={feedback} />
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                {currentAIAnalysis ? (
                  <InterviewQuestionGenerator 
                    analysis={currentAIAnalysis}
                    candidateName={candidateName}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Analyze feedback first to generate interview questions
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <TeamAIAnalyticsDashboard allFeedback={feedback} />
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        {/* Response Tracking Tab */}
        <TabsContent value="tracking">
          <FeedbackResponseTracker 
            candidateId={candidateId}
            candidateName={candidateName}
          />
        </TabsContent>

        {/* Voting Tab */}
        <TabsContent value="voting">
          <VotingPanel
            candidateId={candidateId}
            candidateName={candidateName}
            onVoteCast={loadData}
          />
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <PendingFeedbackRequests />
        </TabsContent>

        {/* Decision Tab */}
        <TabsContent value="decision">
          <DecisionRecorder
            candidateId={candidateId}
            candidateName={candidateName}
            onDecisionRecorded={loadData}
          />
        </TabsContent>

        {/* Provide Feedback Tab */}
        <TabsContent value="provide">
          <div 
            onFocus={() => {
              updatePresence('editing', 'ratings');
              startTyping('ratings');
            }}
            onBlur={() => {
              updatePresence('viewing');
              stopTyping();
            }}
          >
            <div className="mb-4">
              <TypingIndicator typingUsers={typingUsers} section="ratings" />
            </div>
            <CollaborativeFeedbackForm
              candidateId={candidateId}
              candidateName={candidateName}
              applicationId={applicationId}
              onSubmitSuccess={() => {
                const updatedFeedback = getCandidateFeedback(candidateId);
                const newFeedback = updatedFeedback[updatedFeedback.length - 1];
                if (newFeedback) {
                  broadcastFeedback(newFeedback, 'new');
                }
                loadData();
                setShowForm(false);
                toast({
                  title: '✅ Feedback Submitted',
                  description: 'Your feedback has been shared with the team in real-time',
                });
              }}
            />
          </div>
        </TabsContent>

        {/* Discussion Tab */}
        <TabsContent value="discussion">
          <CommentThreads candidateId={candidateId} feedbackId={feedback[0]?.id} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <ActivityFeed candidateId={candidateId} />
        </TabsContent>
      </Tabs>

      {/* Edit Feedback Dialog with Conflict Detection */}
      {editingFeedback && (
        <EditFeedbackDialog
          open={!!editingFeedback}
          onOpenChange={(open) => !open && setEditingFeedback(null)}
          feedback={editingFeedback}
          onSaved={() => {
            loadData();
            setEditingFeedback(null);
          }}
        />
      )}
    </div>
  );
}
