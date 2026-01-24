import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Assessment } from '@/shared/types/assessment';
import { format } from 'date-fns';
import { TrendingUp, Users, Award } from 'lucide-react';

interface AssessmentScoreChartProps {
  assessments: Assessment[];
  candidateName: string;
  jobId?: string;
}

export function AssessmentScoreChart({ assessments, candidateName, jobId }: AssessmentScoreChartProps) {
  const completedAssessments = assessments
    .filter(a => a.status === 'completed' && a.overallScore !== undefined)
    .sort((a, b) => new Date(a.completedDate!).getTime() - new Date(b.completedDate!).getTime());

  if (completedAssessments.length === 0) {
    return null;
  }

  // Performance trend data
  const trendData = completedAssessments.map((assessment, index) => ({
    name: format(new Date(assessment.completedDate!), 'MMM d'),
    score: assessment.overallScore,
    assessmentType: assessment.assessmentType.replace('-', ' '),
    passThreshold: assessment.passThreshold,
    index: index + 1,
  }));

  // Calculate average score
  const avgScore = completedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssessments.length;

  // Calculate improvement
  const firstScore = completedAssessments[0].overallScore || 0;
  const lastScore = completedAssessments[completedAssessments.length - 1].overallScore || 0;
  const improvement = lastScore - firstScore;

  // Score by category data (aggregate all category scores)
  const categoryScores: Record<string, number[]> = {};
  completedAssessments.forEach(assessment => {
    if (assessment.result?.details?.categoryScores) {
      Object.entries(assessment.result.details.categoryScores).forEach(([category, score]) => {
        if (!categoryScores[category]) categoryScores[category] = [];
        categoryScores[category].push(score);
      });
    }
  });

  const categoryData = Object.entries(categoryScores).map(([category, scores]) => ({
    category: category.replace(/([A-Z])/g, ' $1').trim(),
    avgScore: Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10,
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
  }));

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground transition-colors duration-500">Average Score</p>
                <p className="text-2xl font-bold transition-colors duration-500">{Math.round(avgScore)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground transition-colors duration-500">Improvement</p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  improvement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {improvement > 0 ? '+' : ''}{Math.round(improvement)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground transition-colors duration-500">Assessments Completed</p>
                <p className="text-2xl font-bold transition-colors duration-500">{completedAssessments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend Chart */}
      <Card className="transition-[background,border-color,box-shadow,color] duration-500">
        <CardHeader>
          <CardTitle className="transition-colors duration-500">Performance Trend</CardTitle>
          <CardDescription className="transition-colors duration-500">
            Score progression across multiple assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                domain={[0, 100]} 
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <ReferenceLine 
                y={70} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="3 3" 
                label={{ value: 'Pass Threshold', position: 'right', fill: 'hsl(var(--warning))' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                activeDot={{ r: 7 }}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      {categoryData.length > 0 && (
        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardHeader>
            <CardTitle className="transition-colors duration-500">Performance by Category</CardTitle>
            <CardDescription className="transition-colors duration-500">
              Average scores across different skill categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="category" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  domain={[0, 100]} 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar 
                  dataKey="avgScore" 
                  fill="hsl(var(--primary))" 
                  name="Avg Score"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
