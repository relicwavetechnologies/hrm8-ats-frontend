import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Clock, Target } from 'lucide-react';

// Mock data for team performance
const mockTeamPerformance = [
  {
    memberId: 'user-1',
    name: 'Sarah Johnson',
    role: 'Technical Lead',
    feedbackCount: 24,
    averageResponseTime: '2.3 hours',
    consensusAlignment: 0.92,
    qualityScore: 4.7,
  },
  {
    memberId: 'user-2',
    name: 'Mike Chen',
    role: 'Senior Developer',
    feedbackCount: 18,
    averageResponseTime: '4.1 hours',
    consensusAlignment: 0.85,
    qualityScore: 4.5,
  },
  {
    memberId: 'user-3',
    name: 'Emily Davis',
    role: 'HR Manager',
    feedbackCount: 31,
    averageResponseTime: '1.8 hours',
    consensusAlignment: 0.88,
    qualityScore: 4.8,
  },
];

const feedbackTrendData = [
  { month: 'Jan', count: 15 },
  { month: 'Feb', count: 22 },
  { month: 'Mar', count: 28 },
  { month: 'Apr', count: 25 },
  { month: 'May', count: 32 },
  { month: 'Jun', count: 38 },
];

export const TeamPerformanceAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Reviewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockTeamPerformance.length}</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(mockTeamPerformance.reduce((sum, m) => sum + m.qualityScore, 0) / mockTeamPerformance.length).toFixed(1)}
            </p>
            <Progress 
              value={(mockTeamPerformance.reduce((sum, m) => sum + m.qualityScore, 0) / mockTeamPerformance.length / 5) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2.7h</p>
            <p className="text-xs text-muted-foreground mt-1">Team average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Consensus Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">88%</p>
            <Progress value={88} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Team Member Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Performance</CardTitle>
          <CardDescription>Individual contribution metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamPerformance.map((member) => (
              <div key={member.memberId} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline" className="text-xs">{member.role}</Badge>
                    </div>
                  </div>
                  <Badge className="bg-primary">
                    Quality: {member.qualityScore}/5
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Feedback Given</p>
                    <p className="font-bold text-lg">{member.feedbackCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Response</p>
                    <p className="font-bold text-lg">{member.averageResponseTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Alignment</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{(member.consensusAlignment * 100).toFixed(0)}%</p>
                      <Progress value={member.consensusAlignment * 100} className="h-2 flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Activity Trend</CardTitle>
          <CardDescription>Monthly feedback submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={feedbackTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
