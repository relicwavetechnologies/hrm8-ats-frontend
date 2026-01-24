import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { PipelineColumn } from "@/components/pipeline/PipelineColumn";
import { CandidateCard } from "@/components/pipeline/CandidateCard";
import { AICandidateScoring } from "@/components/candidates/AICandidateScoring";
import {
  getPipelineStages,
  getPipelineCandidates,
  moveCandidateToStage,
  updateCandidatePriority,
  getPipelineAnalytics,
  PipelineCandidate,
} from "@/shared/lib/pipelineService";
import { sendStageChangeEmail } from "@/shared/lib/emailNotificationService";
import { getJobs } from "@/shared/lib/mockJobStorage";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Target,
  RefreshCw,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PipelineKanban() {
  const { toast } = useToast();
  const [activeCandidate, setActiveCandidate] = useState<PipelineCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [selectedForScoring, setSelectedForScoring] = useState<PipelineCandidate | null>(null);

  const jobs = getJobs();
  const stages = getPipelineStages();
  const analytics = getPipelineAnalytics();

  // Filters
  const candidates = useMemo(() => {
    return getPipelineCandidates({
      jobId: selectedJob !== "all" ? selectedJob : undefined,
      priority: selectedPriority !== "all" ? (selectedPriority as any) : undefined,
      search: searchQuery || undefined,
    });
  }, [selectedJob, selectedPriority, searchQuery, refreshKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = active.data.current?.candidate as PipelineCandidate;
    setActiveCandidate(candidate);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCandidate(null);
      return;
    }

    const candidateId = active.id as string;
    const toStageId = over.id as string;
    const candidate = active.data.current?.candidate as PipelineCandidate;

    if (candidate && candidate.stageId !== toStageId) {
      const fromStage = stages.find((s) => s.id === candidate.stageId);
      const toStage = stages.find((s) => s.id === toStageId);

      const updated = moveCandidateToStage(candidateId, toStageId);

      if (updated) {
        // Send email notification
        sendStageChangeEmail(
          candidate.name,
          candidate.email,
          fromStage?.name || candidate.stageId,
          toStage?.name || toStageId,
          candidate.jobTitle
        );

        // Check if moving to interview stage and prompt for AI interview
        const interviewStages = ['phone-screen', 'technical', 'final'];
        if (interviewStages.includes(toStageId)) {
          import('@/lib/aiInterview/aiInterviewStorage').then(({ getAIInterviewsByCandidate }) => {
            const aiInterviews = getAIInterviewsByCandidate(candidate.id);
            const hasScheduledInterview = aiInterviews.some(
              i => i.status === 'scheduled' || i.status === 'in-progress'
            );

            if (!hasScheduledInterview) {
              toast({
                title: "Moved to Interview Stage",
                description: `${candidate.name} moved to ${toStage?.name}. Consider scheduling an AI interview.`,
              });
            } else {
              toast({
                title: "Candidate moved",
                description: `${candidate.name} moved to ${toStage?.name}`,
              });
            }
          });
        } else {
          toast({
            title: "Candidate moved",
            description: `${candidate.name} moved to ${toStage?.name}`,
          });
        }

        setRefreshKey((k) => k + 1);
      }
    }

    setActiveCandidate(null);
  };

  const handlePriorityChange = (candidateId: string, priority: 'high' | 'medium' | 'low') => {
    updateCandidatePriority(candidateId, priority);
    toast({
      title: "Priority updated",
      description: `Priority set to ${priority}`,
    });
    setRefreshKey((k) => k + 1);
  };

  const handleViewDetails = (candidate: PipelineCandidate) => {
    toast({
      title: "Candidate Details",
      description: `Viewing details for ${candidate.name}`,
    });
  };

  const handleAIScore = (candidate: PipelineCandidate) => {
    setSelectedForScoring(candidate);
    setScoringDialogOpen(true);
  };

  const chartData = stages
    .filter((s) => s.id !== 'rejected' && s.id !== 'hired')
    .map((stage) => ({
      name: stage.name,
      count: candidates.filter((c) => c.stageId === stage.id).length,
    }));

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Candidate Pipeline</h1>
            <p className="text-muted-foreground">
              Manage candidates through your hiring pipeline
            </p>
          </div>
          <Button variant="outline" onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="board" className="space-y-4">
          <TabsList>
            <TabsTrigger value="board">Kanban Board</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalCandidates}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {candidates.filter(
                      (c) => !['hired', 'rejected'].includes(c.stageId)
                    ).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {candidates.filter((c) => c.priority === 'high').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Time in Stage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.5 days</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.slice(0, 10).map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || selectedJob !== "all" || selectedPriority !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedJob("all");
                    setSelectedPriority("all");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Kanban Board */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {stages.map((stage) => {
                  const stageCandidates = candidates.filter((c) => c.stageId === stage.id);
                  return (
                    <PipelineColumn
                      key={stage.id}
                      stage={stage}
                      candidates={stageCandidates}
                      onPriorityChange={handlePriorityChange}
                      onViewDetails={handleViewDetails}
                      onAIScore={handleAIScore}
                    />
                  );
                })}
              </div>

              <DragOverlay>
                {activeCandidate ? (
                  <CandidateCard candidate={activeCandidate} isDragging />
                ) : null}
              </DragOverlay>
            </DndContext>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Candidates by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Pipeline Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.bottlenecks.map((bottleneck, index) => (
                      <div key={bottleneck.stageId} className="text-base font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{bottleneck.stageName}</span>
                        </div>
                        <Badge variant="secondary">{bottleneck.count} candidates</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Average Time in Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(analytics.averageTimeInStage)
                    .filter(([key]) => !['hired', 'rejected'].includes(key))
                    .map(([stageId, days]) => {
                      const stage = stages.find((s) => s.id === stageId);
                      return (
                        <div key={stageId} className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">{stage?.name}</p>
                          <p className="text-2xl font-bold">{days} days</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedForScoring && (
          <AICandidateScoring
            open={scoringDialogOpen}
            onOpenChange={setScoringDialogOpen}
            candidateName={selectedForScoring.name}
            candidateData={{
              resume: `Professional with ${selectedForScoring.tags.join(', ')} skills`,
              experience: `${selectedForScoring.matchScore}% match based on profile analysis`,
              skills: selectedForScoring.tags,
              education: 'Bachelor\'s degree or equivalent',
            }}
            jobData={{
              title: selectedForScoring.jobTitle,
              requirements: `Looking for candidates with ${selectedForScoring.tags.join(', ')} expertise`,
              description: `Position requires strong skills in ${selectedForScoring.tags.slice(0, 3).join(', ')} and related technologies`,
            }}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
