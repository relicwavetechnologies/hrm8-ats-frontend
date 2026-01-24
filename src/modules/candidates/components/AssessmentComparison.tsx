import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
import type { Assessment } from '@/shared/types/assessment';
import { Users, TrendingUp, Award } from 'lucide-react';

interface AssessmentComparisonProps {
  candidateId: string;
  candidateName: string;
  jobId?: string;
}

export function AssessmentComparison({ candidateId, candidateName, jobId }: AssessmentComparisonProps) {
  // Get all assessments for this job (if jobId provided) or all assessments
  const allAssessments = getAssessments();
  const jobAssessments = jobId 
    ? allAssessments.filter(a => a.jobId === jobId && a.status === 'completed' && a.overallScore !== undefined)
    : allAssessments.filter(a => a.status === 'completed' && a.overallScore !== undefined);

  if (jobAssessments.length === 0) {
    return null;
  }

  // Get candidate's assessments for this job
  const candidateAssessments = jobAssessments.filter(a => a.candidateId === candidateId);
  
  if (candidateAssessments.length === 0) {
    return null;
  }

  // Calculate candidate's average score
  const candidateAvg = candidateAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / candidateAssessments.length;

  // Calculate other candidates' average scores
  const otherCandidates = jobAssessments.filter(a => a.candidateId !== candidateId);
  const otherCandidatesAvg = otherCandidates.length > 0
    ? otherCandidates.reduce((sum, a) => sum + (a.overallScore || 0), 0) / otherCandidates.length
    : 0;

  // Calculate overall average
  const overallAvg = jobAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / jobAssessments.length;

  // Calculate percentile ranking
  const totalCandidates = new Set(jobAssessments.map(a => a.candidateId)).size;
  const candidatesScores = Array.from(new Set(jobAssessments.map(a => a.candidateId)))
    .map(id => {
      const assessments = jobAssessments.filter(a => a.candidateId === id);
      return {
        candidateId: id,
        avgScore: assessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / assessments.length,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  const candidateRank = candidatesScores.findIndex(c => c.candidateId === candidateId) + 1;
  const percentile = Math.round((1 - (candidateRank - 1) / totalCandidates) * 100);

  // Comparison chart data
  const comparisonData = [
    {
      name: 'This Candidate',
      score: Math.round(candidateAvg * 10) / 10,
      fill: 'hsl(var(--primary))',
    },
    {
      name: 'Other Candidates',
      score: Math.round(otherCandidatesAvg * 10) / 10,
      fill: 'hsl(var(--muted-foreground))',
    },
    {
      name: 'Overall Average',
      score: Math.round(overallAvg * 10) / 10,
      fill: 'hsl(var(--warning))',
    },
  ];

  // Top performers comparison
  const topPerformers = candidatesScores.slice(0, 5).map((c, index) => ({
    rank: index + 1,
    name: c.candidateId === candidateId ? candidateName : `Candidate ${index + 1}`,
    score: Math.round(c.avgScore * 10) / 10,
    isCurrentCandidate: c.candidateId === candidateId,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground transition-colors duration-500">Percentile Rank</p>
                <p className="text-2xl font-bold transition-colors duration-500">{percentile}th</p>
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
                <p className="text-sm text-muted-foreground transition-colors duration-500">vs. Average</p>
                <p className={`text-2xl font-bold transition-colors duration-500 ${
                  candidateAvg >= overallAvg ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {candidateAvg >= overallAvg ? '+' : ''}{Math.round((candidateAvg - overallAvg) * 10) / 10}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground transition-colors duration-500">Rank</p>
                <p className="text-2xl font-bold transition-colors duration-500">
                  #{candidateRank} of {totalCandidates}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="transition-[background,border-color,box-shadow,color] duration-500">
        <CardHeader>
          <CardTitle className="transition-colors duration-500">Performance Comparison</CardTitle>
          <CardDescription className="transition-colors duration-500">
            {jobId ? 'Comparison with other candidates for this position' : 'Comparison with all candidates'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
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
              <Bar 
                dataKey="score" 
                radius={[8, 8, 0, 0]}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers Leaderboard */}
      <Card className="transition-[background,border-color,box-shadow,color] duration-500">
        <CardHeader>
          <CardTitle className="transition-colors duration-500">Top Performers</CardTitle>
          <CardDescription className="transition-colors duration-500">
            Highest scoring candidates for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((performer) => (
              <div 
                key={performer.rank}
                className={`flex items-center justify-between p-3 rounded-lg border transition-[background,border-color,box-shadow,color] duration-500 ${
                  performer.isCurrentCandidate ? 'bg-primary/5 border-primary' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    performer.rank === 1 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                    performer.rank === 2 ? 'bg-gray-400/20 text-gray-600 dark:text-gray-400' :
                    performer.rank === 3 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {performer.rank}
                  </div>
                  <div>
                    <p className={`font-medium transition-colors duration-500 ${
                      performer.isCurrentCandidate ? 'text-primary' : ''
                    }`}>
                      {performer.name}
                      {performer.isCurrentCandidate && (
                        <Badge variant="default" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold transition-colors duration-500">{performer.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
