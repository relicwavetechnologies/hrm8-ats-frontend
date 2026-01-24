import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Mail, Eye, MousePointerClick, MessageSquare, TrendingUp } from 'lucide-react';
import { getTemplatePerformance, getTopPerformingTemplates } from '@/lib/mockTemplatePerformance';
import { format } from 'date-fns';

interface TemplateAnalyticsProps {
  templateId?: string;
}

export function TemplateAnalytics({ templateId }: TemplateAnalyticsProps) {
  const templates = templateId ? getTemplatePerformance(templateId) : getTopPerformingTemplates();

  const performanceData = templates.map(t => ({
    name: t.templateName,
    'Open Rate': t.openRate,
    'Click Rate': t.clickRate,
    'Response Rate': t.responseRate,
  }));

  const usageData = templates.map(t => ({
    name: t.templateName.substring(0, 15),
    sent: t.sendCount,
    opened: t.openCount,
    clicked: t.clickCount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.templateId}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground line-clamp-1">
                  {template.templateName}
                </p>
                <p className="text-2xl font-bold">{template.sendCount}</p>
                <p className="text-xs text-muted-foreground">times used</p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    {template.openRate.toFixed(0)}%
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <MousePointerClick className="h-3 w-3 mr-1" />
                    {template.clickRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="Open Rate" fill="hsl(var(--primary))" />
              <Bar dataKey="Click Rate" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Response Rate" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Template Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="opened" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              <Line type="monotone" dataKey="clicked" stroke="hsl(var(--chart-3))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.templateId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.templateName}</CardTitle>
                <Badge variant="outline">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Top Performer
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Sent</span>
                  <span className="font-medium">{template.sendCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Open Rate</span>
                  <span className="font-medium text-green-600">{template.openRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Click Rate</span>
                  <span className="font-medium text-blue-600">{template.clickRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-medium text-purple-600">{template.responseRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Time to Open</span>
                  <span className="font-medium">{template.avgTimeToOpen.toFixed(1)} hours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Used</span>
                  <span className="font-medium">{format(new Date(template.lastUsed), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
