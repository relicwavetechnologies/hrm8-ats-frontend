import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Calendar,
  TrendingUp,
  Target,
  Award,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Plus,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface PerformanceReview {
  id: string;
  consultantId: string;
  consultantName: string;
  period: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  completedDate?: string;
  overallRating: number;
  categories: {
    name: string;
    score: number;
    feedback: string;
  }[];
  strengths: string[];
  improvements: string[];
  goals: Goal[];
  aiInsights?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  priority: 'high' | 'medium' | 'low';
}

interface ReviewTemplate {
  id: string;
  name: string;
  categories: string[];
  frequency: 'quarterly' | 'semi-annual' | 'annual';
}

export function RPOPerformanceReviewSystem() {
  const { toast } = useToast();
  const [selectedConsultant, setSelectedConsultant] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  // Mock data
  const templates: ReviewTemplate[] = [
    {
      id: 'standard',
      name: 'Standard Performance Review',
      categories: ['Technical Skills', 'Client Relations', 'Communication', 'Time Management', 'Leadership'],
      frequency: 'quarterly'
    },
    {
      id: 'senior',
      name: 'Senior Consultant Review',
      categories: ['Strategic Thinking', 'Mentorship', 'Business Development', 'Client Relations', 'Technical Excellence'],
      frequency: 'quarterly'
    },
    {
      id: 'executive',
      name: 'Executive Search Specialist',
      categories: ['Executive Relations', 'Market Knowledge', 'Negotiation Skills', 'Client Acquisition', 'Strategic Planning'],
      frequency: 'semi-annual'
    }
  ];

  const reviews: PerformanceReview[] = [
    {
      id: '1',
      consultantId: '1',
      consultantName: 'Sarah Johnson',
      period: 'Q4 2024',
      status: 'completed',
      dueDate: '2024-12-31',
      completedDate: '2024-12-28',
      overallRating: 92,
      categories: [
        { name: 'Technical Skills', score: 95, feedback: 'Exceptional technical knowledge and problem-solving abilities' },
        { name: 'Client Relations', score: 90, feedback: 'Strong client relationships with high satisfaction scores' },
        { name: 'Communication', score: 88, feedback: 'Clear communication, could improve documentation' },
        { name: 'Time Management', score: 92, feedback: 'Excellent prioritization and deadline management' },
        { name: 'Leadership', score: 94, feedback: 'Natural leader, mentors junior consultants effectively' }
      ],
      strengths: [
        'Consistently exceeds placement targets',
        'High client satisfaction ratings',
        'Excellent technical recruitment skills',
        'Strong team player and mentor'
      ],
      improvements: [
        'Improve written documentation',
        'Better work-life balance needed',
        'Develop executive search skills'
      ],
      goals: [
        {
          id: 'g1',
          title: 'Increase Executive Placements',
          description: 'Place 5 executive-level positions in Q1 2025',
          targetDate: '2025-03-31',
          status: 'in-progress',
          progress: 40,
          priority: 'high'
        },
        {
          id: 'g2',
          title: 'Complete Leadership Training',
          description: 'Finish advanced leadership certification program',
          targetDate: '2025-02-28',
          status: 'in-progress',
          progress: 65,
          priority: 'medium'
        }
      ],
      aiInsights: 'Sarah demonstrates exceptional performance with consistent high scores across all categories. Her technical recruitment skills are a key strength, particularly in the technology sector. However, the recent trend shows increased workload leading to occasional overtime. Consider redistributing assignments to maintain sustainable performance. Her mentorship of junior consultants adds significant value to the team. Recommend focusing on executive search development to diversify her skill portfolio.'
    },
    {
      id: '2',
      consultantId: '2',
      consultantName: 'Michael Chen',
      period: 'Q4 2024',
      status: 'scheduled',
      dueDate: '2025-01-15',
      overallRating: 0,
      categories: [],
      strengths: [],
      improvements: [],
      goals: []
    },
    {
      id: '3',
      consultantId: '3',
      consultantName: 'Emily Rodriguez',
      period: 'Q4 2024',
      status: 'in-progress',
      dueDate: '2025-01-10',
      overallRating: 0,
      categories: [],
      strengths: [],
      improvements: [],
      goals: []
    }
  ];

  // Performance history
  const performanceHistory = [
    { quarter: 'Q1', technical: 88, client: 85, communication: 82, time: 86, leadership: 90 },
    { quarter: 'Q2', technical: 90, client: 87, communication: 85, time: 89, leadership: 91 },
    { quarter: 'Q3', technical: 93, client: 89, communication: 86, time: 90, leadership: 93 },
    { quarter: 'Q4', technical: 95, client: 90, communication: 88, time: 92, leadership: 94 }
  ];

  const generateAIInsights = async (reviewId: string) => {
    setGeneratingInsights(true);
    
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) throw new Error('Review not found');

      // Prepare performance data for AI analysis
      const performanceData = {
        consultantName: review.consultantName,
        period: review.period,
        categories: review.categories,
        metrics: {
          placements: 24, // This would come from actual data
          successRate: 92,
          clientSatisfaction: 4.7,
          hoursWorked: 42,
          responseTime: 3.5
        },
        workloadHistory: [
          { week: 'Week 1', utilization: 85 },
          { week: 'Week 2', utilization: 90 },
          { week: 'Week 3', utilization: 95 },
          { week: 'Week 4', utilization: 92 }
        ]
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-review-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ performanceData })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate insights');
      }

      const { insights } = await response.json();

      toast({
        title: 'AI Insights Generated',
        description: 'Performance analysis and recommendations have been added to the review.',
      });

      // In a real app, you would update the review in the database here
      console.log('Generated insights:', insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate AI insights. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  const scheduleReview = () => {
    toast({
      title: 'Review Scheduled',
      description: 'Performance review has been scheduled and notifications sent.',
    });
    setReviewDialogOpen(false);
  };

  const addGoal = () => {
    toast({
      title: 'Goal Added',
      description: 'New performance goal has been added successfully.',
    });
    setGoalDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'default';
    if (status === 'in-progress') return 'secondary';
    if (status === 'scheduled') return 'outline';
    return 'destructive';
  };

  const getGoalStatusColor = (status: string) => {
    if (status === 'completed') return 'default';
    if (status === 'in-progress') return 'secondary';
    if (status === 'blocked') return 'destructive';
    return 'outline';
  };

  const upcomingReviews = reviews.filter(r => r.status === 'scheduled' || r.status === 'in-progress');
  const completedReviews = reviews.filter(r => r.status === 'completed');
  const overdueReviews = reviews.filter(r => r.status === 'overdue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Performance Review System</h2>
          <p className="text-muted-foreground">Automated evaluations with AI-powered insights</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Performance Review</DialogTitle>
                <DialogDescription>Create a new performance review for a consultant</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consultant">Consultant</Label>
                  <Select>
                    <SelectTrigger id="consultant">
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Sarah Johnson</SelectItem>
                      <SelectItem value="2">Michael Chen</SelectItem>
                      <SelectItem value="3">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Review Template</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
                <Button onClick={scheduleReview} className="w-full">
                  Schedule Review
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Reviews</p>
                <p className="text-2xl font-bold">{upcomingReviews.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedReviews.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueReviews.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(completedReviews.reduce((acc, r) => acc + r.overallRating, 0) / completedReviews.length || 0).toFixed(0)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{review.consultantName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{review.consultantName}</CardTitle>
                        <CardDescription>{review.period} Performance Review</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(review.status) as any}>
                        {review.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      {review.status === 'completed' && (
                        <Badge className="bg-green-600">{review.overallRating}%</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Due: {new Date(review.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {review.completedDate && (
                      <span className="text-green-600">
                        Completed: {new Date(review.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {review.status === 'completed' && (
                    <>
                      {/* Performance Categories */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Performance Categories</h4>
                        {review.categories.map((cat, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{cat.name}</span>
                              <span className="font-medium">{cat.score}%</span>
                            </div>
                            <Progress value={cat.score} className="h-2" />
                          </div>
                        ))}
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {review.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {review.improvements.map((improvement, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* AI Insights */}
                      {review.aiInsights ? (
                        <Alert>
                          <Sparkles className="h-4 w-4" />
                          <AlertDescription>
                            <strong>AI Insights:</strong> {review.aiInsights}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => generateAIInsights(review.id)}
                          disabled={generatingInsights}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {generatingInsights ? 'Generating...' : 'Generate AI Insights'}
                        </Button>
                      )}
                    </>
                  )}

                  {review.status !== 'completed' && (
                    <Button className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      {review.status === 'scheduled' ? 'Start Review' : 'Continue Review'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Performance Goals</h3>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Performance Goal</DialogTitle>
                  <DialogDescription>Create a new goal for consultant development</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalTitle">Goal Title</Label>
                    <Input id="goalTitle" placeholder="e.g., Increase client satisfaction" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goalDesc">Description</Label>
                    <Textarea id="goalDesc" placeholder="Detailed description of the goal..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetDate">Target Date</Label>
                      <Input id="targetDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addGoal} className="w-full">Add Goal</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {reviews
              .filter(r => r.goals.length > 0)
              .map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{review.consultantName}</CardTitle>
                    <CardDescription>Active performance goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {review.goals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getGoalStatusColor(goal.status) as any}>
                              {goal.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant={goal.priority === 'high' ? 'destructive' : 'outline'}>
                              {goal.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Quarterly performance across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="quarter" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="technical" stroke="hsl(var(--primary))" strokeWidth={2} name="Technical" />
                    <Line type="monotone" dataKey="client" stroke="hsl(142, 76%, 36%)" strokeWidth={2} name="Client Relations" />
                    <Line type="monotone" dataKey="leadership" stroke="hsl(48, 96%, 53%)" strokeWidth={2} name="Leadership" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Performance Profile</CardTitle>
                <CardDescription>Multi-dimensional assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceHistory[performanceHistory.length - 1] ? [
                    { category: 'Technical', value: performanceHistory[performanceHistory.length - 1].technical },
                    { category: 'Client Relations', value: performanceHistory[performanceHistory.length - 1].client },
                    { category: 'Communication', value: performanceHistory[performanceHistory.length - 1].communication },
                    { category: 'Time Mgmt', value: performanceHistory[performanceHistory.length - 1].time },
                    { category: 'Leadership', value: performanceHistory[performanceHistory.length - 1].leadership }
                  ] : []}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" className="text-xs" />
                    <PolarRadiusAxis domain={[0, 100]} className="text-xs" />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    {template.frequency.charAt(0).toUpperCase() + template.frequency.slice(1)} Review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Categories ({template.categories.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.categories.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
