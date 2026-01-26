import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Sparkles, TrendingUp, Target, Users, Lightbulb } from "lucide-react";
import { Employee } from "@/types/employee";
import { PerformanceGoal } from "@/types/performance";
import { useState, useEffect } from "react";

interface GoalRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
  suggestedTarget: string;
  timeline: string;
}

interface GoalRecommendationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  existingGoals: PerformanceGoal[];
  onSelectGoal: (recommendation: GoalRecommendation) => void;
}

const generateRecommendations = (employee: Employee, existingGoals: PerformanceGoal[]): GoalRecommendation[] => {
  const existingCategories = new Set(existingGoals.map(g => g.category));
  const recommendations: GoalRecommendation[] = [];
  
  // Role-based recommendations
  const roleRecommendations: Record<string, Array<{ title: string; category: string; description: string; target: string; timeline: string }>> = {
    'Software Engineer': [
      { title: 'Implement CI/CD Pipeline', category: 'Technical', description: 'Set up automated testing and deployment', target: 'Deploy 3 services with automated pipelines', timeline: 'Q2 2024' },
      { title: 'Code Review Leadership', category: 'Professional Development', description: 'Mentor junior developers through code reviews', target: 'Review 50+ PRs with detailed feedback', timeline: 'Q1-Q2 2024' },
      { title: 'System Architecture Documentation', category: 'Technical', description: 'Document key system architectures', target: 'Complete 5 architecture documents', timeline: 'Q2 2024' }
    ],
    'Product Manager': [
      { title: 'Product Roadmap Delivery', category: 'Business', description: 'Execute on quarterly product roadmap', target: 'Ship 4 major features on time', timeline: 'Q2 2024' },
      { title: 'Stakeholder Engagement', category: 'Leadership', description: 'Improve cross-functional collaboration', target: 'Hold monthly stakeholder reviews', timeline: 'Ongoing 2024' },
      { title: 'User Research Initiative', category: 'Business', description: 'Conduct user research to inform product decisions', target: 'Complete 20 user interviews', timeline: 'Q1-Q2 2024' }
    ],
    'Marketing Manager': [
      { title: 'Campaign Performance Optimization', category: 'Business', description: 'Improve marketing ROI across channels', target: 'Achieve 25% increase in conversion rate', timeline: 'Q2 2024' },
      { title: 'Brand Awareness Initiative', category: 'Business', description: 'Expand brand reach in target markets', target: 'Grow social media following by 10k', timeline: 'Q2-Q3 2024' },
      { title: 'Content Strategy Development', category: 'Professional Development', description: 'Create comprehensive content calendar', target: 'Publish 50 high-quality pieces', timeline: 'Q1-Q2 2024' }
    ]
  };

  // Default recommendations for other roles
  const defaultRecommendations = [
    { title: 'Professional Skills Development', category: 'Professional Development', description: 'Complete relevant training and certifications', target: 'Obtain 2 industry certifications', timeline: 'H1 2024' },
    { title: 'Team Collaboration Excellence', category: 'Leadership', description: 'Foster cross-team collaboration', target: 'Lead 3 cross-functional projects', timeline: 'Q2-Q3 2024' },
    { title: 'Process Improvement Initiative', category: 'Business', description: 'Identify and implement efficiency gains', target: 'Reduce process time by 20%', timeline: 'Q2 2024' }
  ];

  const roleSpecific = roleRecommendations[employee.jobTitle] || defaultRecommendations;
  
  roleSpecific.forEach((rec, idx) => {
    const priority = idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low';
    const reasoning = `Based on your role as ${employee.jobTitle}, this goal aligns with typical career progression and organizational needs.`;
    
    recommendations.push({
      id: `rec-${idx}`,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      priority,
      reasoning,
      suggestedTarget: rec.target,
      timeline: rec.timeline
    });
  });

  // Add performance-based recommendation if no goals in a category
  if (!existingCategories.has('Personal Development')) {
    recommendations.push({
      id: 'rec-personal',
      title: 'Emotional Intelligence Development',
      description: 'Enhance interpersonal skills and self-awareness',
      category: 'Personal Development',
      priority: 'medium',
      reasoning: 'Developing soft skills complements technical expertise and supports career growth.',
      suggestedTarget: 'Complete EQ assessment and 5 workshops',
      timeline: 'Q2-Q3 2024'
    });
  }

  return recommendations.slice(0, 5);
};

export function GoalRecommendationsDialog({
  open,
  onOpenChange,
  employee,
  existingGoals,
  onSelectGoal
}: GoalRecommendationsDialogProps) {
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsGenerating(true);
      // Simulate AI processing delay
      setTimeout(() => {
        const recs = generateRecommendations(employee, existingGoals);
        setRecommendations(recs);
        setIsGenerating(false);
      }, 1500);
    }
  }, [open, employee, existingGoals]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>AI-Powered Goal Recommendations</DialogTitle>
          </div>
          <DialogDescription>
            Personalized goal suggestions for {employee.firstName} {employee.lastName} based on role, performance, and company objectives
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 rounded-full bg-primary/20 animate-ping" />
              </div>
              <p className="text-sm text-muted-foreground">Analyzing performance data and generating recommendations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getPriorityColor(rec.priority)} className="gap-1">
                            {getPriorityIcon(rec.priority)}
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription className="mt-1">{rec.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Suggested Target</p>
                        <p className="text-sm text-muted-foreground">{rec.suggestedTarget}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Timeline</p>
                        <p className="text-sm text-muted-foreground">{rec.timeline}</p>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">Why this goal?</p>
                          <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => onSelectGoal(rec)} variant="default">
                        Use This Goal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <p className="text-sm">
                      These recommendations are based on role expectations, past performance patterns, and organizational objectives. You can customize any suggestion to better fit specific needs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
