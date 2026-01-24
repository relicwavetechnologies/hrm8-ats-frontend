import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmailStats } from '@/shared/types/emailTracking';

interface EmailAnalyticsProps {
  stats: EmailStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function EmailAnalytics({ stats }: EmailAnalyticsProps) {
  const pieData = [
    { name: 'Delivered', value: stats.totalDelivered },
    { name: 'Opened', value: stats.totalOpened },
    { name: 'Clicked', value: stats.totalClicked },
    { name: 'Bounced', value: stats.totalBounced },
  ];

  const rateData = [
    { name: 'Open Rate', value: stats.openRate },
    { name: 'Click Rate', value: stats.clickRate },
    { name: 'Delivery Rate', value: stats.deliveryRate },
    { name: 'Bounce Rate', value: stats.bounceRate },
  ];

  // Mock time series data
  const timeSeriesData = [
    { date: 'Mon', sent: 12, opened: 8, clicked: 3 },
    { date: 'Tue', sent: 15, opened: 11, clicked: 5 },
    { date: 'Wed', sent: 10, opened: 7, clicked: 2 },
    { date: 'Thu', sent: 18, opened: 14, clicked: 6 },
    { date: 'Fri', sent: 14, opened: 10, clicked: 4 },
    { date: 'Sat', sent: 8, opened: 5, clicked: 2 },
    { date: 'Sun', sent: 6, opened: 4, clicked: 1 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Email Performance Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Email Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="opened" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="clicked" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
