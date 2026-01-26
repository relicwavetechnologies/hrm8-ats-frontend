import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sparkles, Clock, Target, TrendingUp, BookOpen, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Course, PerformanceGoal } from '@/types/performance';
import { toast } from 'sonner';

interface AIRecommendation {
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  courseCategory: string;
  courseDuration: number;
  courseSkills: string[];
  courseThumbnail?: string;
  courseDescription: string;
  relevance: 'high' | 'medium' | 'low';
  reason: string;
  impact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface AILearningRecommendationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeData: {
    id: string;
    name: string;
    role: string;
    department: string;
    skills?: string[];
    experienceLevel?: string;
  };
  availableCourses: Course[];
  goals?: PerformanceGoal[];
  performanceGaps?: any[];
  onEnrollCourse: (courseId: string) => void;
}

export function AILearningRecommendations({
  open,
  onOpenChange,
  employeeData,
  availableCourses,
  goals = [],
  performanceGaps = [],
  onEnrollCourse,
}: AILearningRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/learning-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          employeeData,
          availableCourses: availableCourses.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            level: c.level,
            duration: c.duration,
            skills: c.skills,
            thumbnail: c.thumbnail,
          })),
          goals: goals.map(g => ({
            title: g.title,
            category: g.category,
            priority: g.priority,
          })),
          performanceGaps,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits depleted. Please contact your administrator.');
        }
        throw new Error(errorData.error || 'Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setSummary(data.summary);
      toast.success('AI recommendations generated!');
    } catch (err) {
      console.error('Error generating recommendations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
      case 'medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'low':
        return <BookOpen className="h-4 w-4 text-gray-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Learning Recommendations
          </DialogTitle>
          <DialogDescription>
            Personalized course recommendations based on your skills, goals, and performance data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {recommendations.length === 0 && !loading && !error && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">Get Personalized Recommendations</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Our AI will analyze your profile, goals, and performance to suggest the best courses for you
                </p>
                <Button onClick={handleGenerateRecommendations} disabled={loading}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </Button>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing your profile and generating recommendations...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error generating recommendations</p>
                    <p className="text-sm mt-1">{error}</p>
                    <Button 
                      onClick={handleGenerateRecommendations} 
                      variant="outline" 
                      size="sm"
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{summary}</p>
                </div>
                <Button onClick={handleGenerateRecommendations} variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <Card key={rec.courseId} className="overflow-hidden">
                      <div className="flex">
                        {rec.courseThumbnail && (
                          <div className="w-48 flex-shrink-0">
                            <img
                              src={rec.courseThumbnail}
                              alt={rec.courseTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    {index + 1}
                                  </span>
                                  <CardTitle className="text-lg">{rec.courseTitle}</CardTitle>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline">{rec.courseLevel}</Badge>
                                  <Badge variant="secondary">{rec.courseCategory}</Badge>
                                  <Badge className={getPriorityColor(rec.priority)}>
                                    {rec.priority} priority
                                  </Badge>
                                </div>
                              </div>
                              {getRelevanceIcon(rec.relevance)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {rec.courseDescription}
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">Why recommended</p>
                                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">Expected impact</p>
                                  <p className="text-sm text-muted-foreground">{rec.impact}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {rec.courseDuration}h
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {rec.courseSkills.slice(0, 2).join(', ')}
                                  {rec.courseSkills.length > 2 && ` +${rec.courseSkills.length - 2}`}
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  onEnrollCourse(rec.courseId);
                                  toast.success(`Enrolled in ${rec.courseTitle}`);
                                }}
                                size="sm"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Enroll Now
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
