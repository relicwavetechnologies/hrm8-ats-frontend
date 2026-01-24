import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getSentEmails, type ScheduledEmail } from "@/shared/lib/scheduledEmails";
import { format, startOfDay, subDays, eachDayOfInterval, getHours } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, Users, Mail } from "lucide-react";

export function EmailAnalyticsDashboard() {
  const sentEmails = useMemo(() => getSentEmails(), []);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const total = sentEmails.length;
    const delivered = sentEmails.filter(e => e.deliveryStatus === 'delivered').length;
    const opened = sentEmails.filter(e => e.openedAt).length;
    const clicked = sentEmails.filter(e => e.clickedAt).length;
    
    const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0';
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0';
    const clickRate = delivered > 0 ? ((clicked / delivered) * 100).toFixed(1) : '0';
    const ctr = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0';

    return { total, delivered, opened, clicked, deliveryRate, openRate, clickRate, ctr };
  }, [sentEmails]);

  // Delivery trends over last 30 days
  const deliveryTrends = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const emailsOnDay = sentEmails.filter(e => 
        e.sentAt && format(startOfDay(new Date(e.sentAt)), 'yyyy-MM-dd') === dateStr
      );

      return {
        date: format(date, 'MMM dd'),
        sent: emailsOnDay.length,
        delivered: emailsOnDay.filter(e => e.deliveryStatus === 'delivered').length,
        opened: emailsOnDay.filter(e => e.openedAt).length,
        clicked: emailsOnDay.filter(e => e.clickedAt).length,
      };
    });
  }, [sentEmails]);

  // Best sending times (by hour)
  const sendingTimeAnalysis = useMemo(() => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      sent: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
    }));

    sentEmails.forEach(email => {
      if (email.sentAt) {
        const hour = getHours(new Date(email.sentAt));
        hourlyData[hour].sent++;
        if (email.openedAt) hourlyData[hour].opened++;
        if (email.clickedAt) hourlyData[hour].clicked++;
      }
    });

    // Calculate open rates
    hourlyData.forEach(data => {
      if (data.sent > 0) {
        data.openRate = Math.round((data.opened / data.sent) * 100);
      }
    });

    return hourlyData.filter(d => d.sent > 0); // Only show hours with activity
  }, [sentEmails]);

  // Delivery status breakdown
  const deliveryStatusData = useMemo(() => {
    const delivered = sentEmails.filter(e => e.deliveryStatus === 'delivered').length;
    const failed = sentEmails.filter(e => e.deliveryStatus === 'failed').length;
    const bounced = sentEmails.filter(e => e.deliveryStatus === 'bounced').length;

    return [
      { name: 'Delivered', value: delivered, color: 'hsl(var(--chart-1))' },
      { name: 'Failed', value: failed, color: 'hsl(var(--chart-2))' },
      { name: 'Bounced', value: bounced, color: 'hsl(var(--chart-3))' },
    ].filter(d => d.value > 0);
  }, [sentEmails]);

  // Engagement trends over time
  const engagementTrends = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const emailsOnDay = sentEmails.filter(e => 
        e.sentAt && format(startOfDay(new Date(e.sentAt)), 'yyyy-MM-dd') === dateStr
      );

      const delivered = emailsOnDay.filter(e => e.deliveryStatus === 'delivered').length;
      const opened = emailsOnDay.filter(e => e.openedAt).length;
      const clicked = emailsOnDay.filter(e => e.clickedAt).length;

      return {
        date: format(date, 'MMM dd'),
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
        ctr: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
      };
    });
  }, [sentEmails]);

  // Email type performance
  const emailTypePerformance = useMemo(() => {
    const typeMap = new Map<string, { sent: number; opened: number; clicked: number }>();

    sentEmails.forEach(email => {
      if (!typeMap.has(email.emailType)) {
        typeMap.set(email.emailType, { sent: 0, opened: 0, clicked: 0 });
      }
      const stats = typeMap.get(email.emailType)!;
      stats.sent++;
      if (email.openedAt) stats.opened++;
      if (email.clickedAt) stats.clicked++;
    });

    return Array.from(typeMap.entries()).map(([type, stats]) => ({
      type,
      sent: stats.sent,
      openRate: Math.round((stats.opened / stats.sent) * 100),
      clickRate: Math.round((stats.clicked / stats.sent) * 100),
    }));
  }, [sentEmails]);

  if (sentEmails.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No email data available yet.<br />
            Send some emails to see analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.deliveryRate}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.opened} of {metrics.delivered} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.clicked} recipients clicked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.ctr}%</div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Delivery Trends</TabsTrigger>
          <TabsTrigger value="times">Best Times</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="types">Email Types</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Trends (Last 30 Days)</CardTitle>
              <CardDescription>Track email volume and delivery over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={deliveryTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="hsl(var(--chart-1))" name="Sent" strokeWidth={2} />
                  <Line type="monotone" dataKey="delivered" stroke="hsl(var(--chart-2))" name="Delivered" strokeWidth={2} />
                  <Line type="monotone" dataKey="opened" stroke="hsl(var(--chart-3))" name="Opened" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicked" stroke="hsl(var(--chart-4))" name="Clicked" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
                <CardDescription>Breakdown of email delivery outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deliveryStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deliveryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="times" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Sending Times</CardTitle>
              <CardDescription>Analyze which hours have the best engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sendingTimeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sent" fill="hsl(var(--chart-1))" name="Emails Sent" />
                  <Bar yAxisId="left" dataKey="opened" fill="hsl(var(--chart-2))" name="Opened" />
                  <Bar yAxisId="right" dataKey="openRate" fill="hsl(var(--chart-3))" name="Open Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rates Over Time</CardTitle>
              <CardDescription>Track open and click rates over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="openRate" stroke="hsl(var(--chart-1))" name="Open Rate %" strokeWidth={2} />
                  <Line type="monotone" dataKey="clickRate" stroke="hsl(var(--chart-2))" name="Click Rate %" strokeWidth={2} />
                  <Line type="monotone" dataKey="ctr" stroke="hsl(var(--chart-3))" name="CTR %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Type Performance</CardTitle>
              <CardDescription>Compare engagement across different email types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={emailTypePerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sent" fill="hsl(var(--chart-1))" name="Sent" />
                  <Bar dataKey="openRate" fill="hsl(var(--chart-2))" name="Open Rate %" />
                  <Bar dataKey="clickRate" fill="hsl(var(--chart-3))" name="Click Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
