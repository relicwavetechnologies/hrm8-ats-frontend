import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getAllFeedback, getRatingCriteria } from '@/shared/lib/collaborativeFeedbackService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function FeedbackAnalyticsChart() {
  const [criteriaData, setCriteriaData] = useState<any[]>([]);
  const [recommendationData, setRecommendationData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    const feedback = getAllFeedback();
    const criteria = getRatingCriteria();

    // Criteria averages
    const criteriaAverages = criteria.map(criterion => {
      const ratings = feedback
        .flatMap(f => f.ratings)
        .filter(r => r.criterionId === criterion.id)
        .map(r => typeof r.value === 'number' ? r.value : parseFloat(r.value as string) || 0);
      
      const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      
      return {
        name: criterion.name,
        average: Number(average.toFixed(1)),
        weight: criterion.weight * 100,
      };
    });
    setCriteriaData(criteriaAverages);

    // Recommendation distribution
    const recDist: Record<string, number> = {};
    feedback.forEach(f => {
      recDist[f.recommendation] = (recDist[f.recommendation] || 0) + 1;
    });
    
    const recData = Object.entries(recDist).map(([name, count]) => ({
      name: name.replace(/-/g, ' ').toUpperCase(),
      count,
    }));
    setRecommendationData(recData);

    // Trend over time (last 30 days)
    const now = new Date();
    const trends: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayFeedback = feedback.filter(f => {
        const fDate = new Date(f.submittedAt);
        return fDate.toDateString() === date.toDateString();
      });
      
      const avgScore = dayFeedback.length > 0
        ? dayFeedback.reduce((sum, f) => sum + f.overallScore, 0) / dayFeedback.length
        : null;
      
      if (dayFeedback.length > 0) {
        trends.push({
          date: dateStr,
          score: Number(avgScore?.toFixed(1)),
          count: dayFeedback.length,
        });
      }
    }
    setTrendData(trends);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Analytics</CardTitle>
        <CardDescription>Visualize team feedback trends and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="criteria">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="criteria">Criteria Averages</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="criteria" className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={criteriaData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar name="Average Rating" dataKey="average" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="recommendations" className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={recommendationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="trends" className="pt-6">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="score" stroke="hsl(var(--primary))" name="Avg Score" />
                  <Line yAxisId="right" type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" name="Feedback Count" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Not enough data to show trends. Submit more feedback to see patterns.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
