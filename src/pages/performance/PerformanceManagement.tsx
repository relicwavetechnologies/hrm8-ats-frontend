import { useState, useMemo } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus, Target, FileText, Calendar as CalendarIcon, TrendingUp, ClipboardCheck, Download, Sparkles } from "lucide-react";
import { GoalCard } from "@/modules/performance/components/GoalCard";
import { ReviewCard } from "@/modules/performance/components/ReviewCard";
import { GoalFormDialog } from "@/modules/performance/components/GoalFormDialog";
import { GoalsFilterBar } from "@/modules/performance/components/GoalsFilterBar";
import { ReviewCompletionDialog } from "@/modules/performance/components/ReviewCompletionDialog";
import { GoalAnalyticsDashboard } from "@/modules/performance/components/analytics/GoalAnalyticsDashboard";
import { GoalRecommendationsDialog } from "@/modules/performance/components/GoalRecommendationsDialog";
import { PerformanceCalendar } from "@/modules/performance/components/PerformanceCalendar";
import { ReviewDetailDialog } from "@/modules/performance/components/ReviewDetailDialog";
import { PerformanceBenchmarking } from "@/modules/performance/components/PerformanceBenchmarking";
import { GoalAlignmentView } from "@/modules/performance/components/GoalAlignmentView";
import { PerformanceReportExportDialog } from "@/modules/performance/components/PerformanceReportExportDialog";
import { ReviewTemplateBuilder } from "@/modules/performance/components/ReviewTemplateBuilder";
import { PerformanceInsightsDashboard } from "@/modules/performance/components/PerformanceInsightsDashboard";
import { getPerformanceGoals, getPerformanceReviews, getReviewTemplates, mockCompanyOKRs, mockTeamObjectives, getReviewSchedules } from "@/shared/lib/performanceStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import type { PerformanceGoal, PerformanceReview } from "@/shared/types/performance";

export default function PerformanceManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PerformanceGoal | undefined>(undefined);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState(false);
  const [reviewDetailOpen, setReviewDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [currentUserRole] = useState<'manager' | 'hr'>('manager');
  
  // Filter and sort state
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress-desc");

  // Mock current user
  const currentEmployeeId = "1";
  const currentEmployeeName = "John Smith";

  const allGoals = useMemo(() => getPerformanceGoals(currentEmployeeId), [currentEmployeeId, refreshKey]);
  const myReviews = useMemo(() => getPerformanceReviews({ employeeId: currentEmployeeId }), [currentEmployeeId, refreshKey]);
  const templates = useMemo(() => getReviewTemplates(), [refreshKey]);
  const schedules = useMemo(() => getReviewSchedules(), [refreshKey]);
  const employees = useMemo(() => getEmployees(), []);
  const currentEmployee = employees.find(e => e.id === currentEmployeeId) || employees[0];

  // Apply filters and sorting
  const myGoals = useMemo(() => {
    let filtered = [...allGoals];

    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(search) ||
          g.description.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((g) => g.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((g) => g.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((g) => g.category === categoryFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "progress-desc":
          return b.progress - a.progress;
        case "progress-asc":
          return a.progress - b.progress;
        case "priority-desc": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case "priority-asc": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "date-newest":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case "date-oldest":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "target-date":
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allGoals, searchValue, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const activeGoals = allGoals.filter(g => g.status === 'in-progress');
  const completedGoals = allGoals.filter(g => g.status === 'completed');
  const avgProgress = allGoals.length > 0 
    ? allGoals.reduce((sum, g) => sum + g.progress, 0) / allGoals.length 
    : 0;

  const activeFiltersCount = [
    searchValue !== "",
    statusFilter !== "all",
    priorityFilter !== "all",
    categoryFilter !== "all",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
  };

  const handleEditGoal = (goal: PerformanceGoal) => {
    setSelectedGoal(goal);
    setGoalDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setGoalDialogOpen(open);
    if (!open) {
      setSelectedGoal(undefined);
    }
  };

  const handleViewReview = (reviewId: string) => {
    const review = myReviews.find(r => r.id === reviewId);
    if (review) {
      setSelectedReview(review);
      setReviewDetailOpen(true);
    }
  };

  const handleApprovalUpdate = (reviewId: string, stageId: string, action: 'approve' | 'reject', comments: string) => {
    console.log('Approval action:', { reviewId, stageId, action, comments });
    setRefreshKey(prev => prev + 1);
    return Promise.resolve();
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Management</h1>
            <p className="text-muted-foreground">
              Track goals, reviews, and performance analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setExportDialogOpen(true)} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => setReviewDialogOpen(true)} variant="outline">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Complete Review
            </Button>
            <Button onClick={() => {
              setSelectedGoal(undefined);
              setGoalDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedGoals.length} completed this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProgress.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                Across all goals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                {myReviews.filter(r => r.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Reviews</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming reviews
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="goals" className="w-full">
          <TabsList>
            <TabsTrigger value="goals">
              <Target className="mr-2 h-4 w-4" />
              Goals & KPIs
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="benchmarking">
              <TrendingUp className="mr-2 h-4 w-4" />
              Benchmarking
            </TabsTrigger>
            <TabsTrigger value="alignment">
              <Target className="mr-2 h-4 w-4" />
              Goal Alignment
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <FileText className="mr-2 h-4 w-4" />
              Performance Reviews
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Review Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">My Goals</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setRecommendationsDialogOpen(true)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Recommendations
                  </Button>
                  <Button onClick={() => {
                    setSelectedGoal(undefined);
                    setGoalDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </div>
              </div>

              <GoalsFilterBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onClearFilters={handleClearFilters}
                activeFiltersCount={activeFiltersCount}
              />

              {myGoals.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Goals Set</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start tracking your performance by setting goals
                    </p>
                    <Button onClick={() => {
                      setSelectedGoal(undefined);
                      setGoalDialogOpen(true);
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={handleEditGoal}
                      onProgressUpdate={() => setRefreshKey((prev) => prev + 1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <PerformanceInsightsDashboard
              goals={allGoals}
              reviews={myReviews}
              employees={employees}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <GoalAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="benchmarking" className="space-y-6">
            <PerformanceBenchmarking 
              goals={allGoals}
              reviews={myReviews}
              employees={employees}
            />
          </TabsContent>

          <TabsContent value="alignment" className="space-y-6">
            <GoalAlignmentView
              goals={allGoals}
              companyOKRs={mockCompanyOKRs}
              teamObjectives={mockTeamObjectives}
              onViewGoal={handleEditGoal}
            />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Reviews</h3>
              
              {myReviews.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Performance reviews will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {myReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} onView={handleViewReview} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <PerformanceCalendar
              goals={allGoals}
              reviews={myReviews}
              feedback={[]}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <ReviewTemplateBuilder />
          </TabsContent>
        </Tabs>

        <GoalFormDialog
          open={goalDialogOpen}
          onOpenChange={handleDialogClose}
          goal={selectedGoal}
          employeeId={currentEmployeeId}
          employeeName={currentEmployeeName}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />

        <ReviewCompletionDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onComplete={() => setRefreshKey((prev) => prev + 1)}
        />

        <PerformanceReportExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />

        <GoalRecommendationsDialog
          open={recommendationsDialogOpen}
          onOpenChange={setRecommendationsDialogOpen}
          employee={currentEmployee}
          existingGoals={allGoals}
          onSelectGoal={(rec) => {
            // Pre-fill the goal form with recommendation
            setSelectedGoal({
              id: `goal-${Date.now()}`,
              employeeId: currentEmployeeId,
              employeeName: currentEmployeeName,
              title: rec.title,
              description: rec.description,
              category: rec.category,
              priority: rec.priority,
              status: 'not-started',
              progress: 0,
              startDate: new Date().toISOString().split('T')[0],
              targetDate: rec.timeline.includes('Q2') ? '2024-06-30' : '2024-12-31',
              kpis: [{
                id: 'kpi-1',
                name: rec.suggestedTarget,
                target: 100,
                current: 0,
                unit: '%'
              }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: currentEmployeeId
            });
            setRecommendationsDialogOpen(false);
            setGoalDialogOpen(true);
          }}
        />

        {selectedReview && (
          <ReviewDetailDialog
            open={reviewDetailOpen}
            onOpenChange={setReviewDetailOpen}
            review={selectedReview}
            currentUserRole={currentUserRole}
            onApprovalUpdate={handleApprovalUpdate}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
