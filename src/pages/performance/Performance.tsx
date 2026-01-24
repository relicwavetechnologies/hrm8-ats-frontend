import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Target, FileText, Users, TrendingUp, Calendar, Star, Award, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { GoalsOverview } from "@/components/performance/GoalsOverview";
import { ReviewsOverview } from "@/components/performance/ReviewsOverview";
import { Feedback360Overview } from "@/components/performance/Feedback360Overview";
import { CalibrationOverview } from "@/components/performance/CalibrationOverview";
import { getPerformanceGoals, getPerformanceReviews, getFeedback360 } from "@/shared/lib/performanceStorage";

export default function Performance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("goals");

  const goals = useMemo(() => getPerformanceGoals(), []);
  const reviews = useMemo(() => getPerformanceReviews(), []);
  const feedback = useMemo(() => getFeedback360(), []);

  const stats = useMemo(() => {
    const activeGoals = goals.filter(g => g.status === 'in-progress').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    const pendingReviews = reviews.filter(r => r.status === 'in-progress' || r.status === 'not-started').length;
    const completedReviews = reviews.filter(r => r.status === 'completed').length;

    const pendingFeedback = feedback.filter(f => f.status === 'pending').length;
    const completedFeedback = feedback.filter(f => f.status === 'completed').length;

    const avgRating = reviews
      .filter(r => r.overallRating)
      .reduce((sum, r) => sum + r.overallRating!, 0) / reviews.filter(r => r.overallRating).length || 0;

    return {
      activeGoals,
      completedGoals,
      goalCompletionRate,
      pendingReviews,
      completedReviews,
      pendingFeedback,
      completedFeedback,
      avgRating: avgRating.toFixed(1),
    };
  }, [goals, reviews, feedback]);

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Performance Management</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
            <p className="text-muted-foreground">Track goals, conduct reviews, and manage feedback</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGoals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.goalCompletionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedReviews} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                360 Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 5.0
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button onClick={() => navigate('/performance/goals/new')} className="w-full">
            <Target className="h-4 w-4 mr-2" />
            Set New Goal
          </Button>
          <Button onClick={() => navigate('/performance/reviews/new')} variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Start Review
          </Button>
          <Button onClick={() => navigate('/performance/feedback/new')} variant="outline" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Request Feedback
          </Button>
          <Button onClick={() => navigate('/performance/calibration')} variant="outline" className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Calibrate Ratings
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <FileText className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              360 Feedback
            </TabsTrigger>
            <TabsTrigger value="calibration">
              <Award className="h-4 w-4 mr-2" />
              Calibration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <GoalsOverview />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsOverview />
          </TabsContent>

          <TabsContent value="feedback">
            <Feedback360Overview />
          </TabsContent>

          <TabsContent value="calibration">
            <CalibrationOverview />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
