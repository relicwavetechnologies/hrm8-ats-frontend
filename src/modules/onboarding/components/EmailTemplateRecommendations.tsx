import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { getSentEmails } from "@/shared/lib/scheduledEmails";
import { TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";

interface TemplatePerformance {
  templateId: string;
  templateName: string;
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  ctr: number;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export function EmailTemplateRecommendations() {
  const sentEmails = useMemo(() => getSentEmails(), []);

  const templatePerformance = useMemo(() => {
    const templateMap = new Map<string, {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    }>();

    sentEmails.forEach(email => {
      const key = email.emailType;
      if (!templateMap.has(key)) {
        templateMap.set(key, { sent: 0, delivered: 0, opened: 0, clicked: 0 });
      }
      const stats = templateMap.get(key)!;
      stats.sent++;
      if (email.deliveryStatus === 'delivered') stats.delivered++;
      if (email.openedAt) stats.opened++;
      if (email.clickedAt) stats.clicked++;
    });

    const performances: TemplatePerformance[] = Array.from(templateMap.entries()).map(([id, stats]) => {
      const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
      const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
      const clickRate = stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0;
      const ctr = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;
      
      // Calculate overall score (weighted average)
      const score = (deliveryRate * 0.2) + (openRate * 0.4) + (clickRate * 0.3) + (ctr * 0.1);
      
      // Mock trend (in real app would compare to historical data)
      const trend: 'up' | 'down' | 'stable' = 
        score > 70 ? 'up' : score < 40 ? 'down' : 'stable';

      return {
        templateId: id,
        templateName: id,
        totalSent: stats.sent,
        delivered: stats.delivered,
        opened: stats.opened,
        clicked: stats.clicked,
        deliveryRate: Math.round(deliveryRate),
        openRate: Math.round(openRate),
        clickRate: Math.round(clickRate),
        ctr: Math.round(ctr),
        score: Math.round(score),
        trend,
      };
    });

    return performances.sort((a, b) => b.score - a.score);
  }, [sentEmails]);

  const insights = useMemo(() => {
    if (templatePerformance.length === 0) return [];

    const bestTemplate = templatePerformance[0];
    const worstTemplate = templatePerformance[templatePerformance.length - 1];
    const avgOpenRate = templatePerformance.reduce((sum, t) => sum + t.openRate, 0) / templatePerformance.length;
    const avgClickRate = templatePerformance.reduce((sum, t) => sum + t.clickRate, 0) / templatePerformance.length;

    const recommendations = [];

    // Best performer insight
    if (bestTemplate.score > 60) {
      recommendations.push({
        type: 'success' as const,
        title: 'Top Performing Template',
        message: `"${bestTemplate.templateName}" is your best performer with ${bestTemplate.openRate}% open rate. Consider using similar messaging and tone in other templates.`,
        icon: Award,
      });
    }

    // Low engagement warning
    if (worstTemplate.score < 40) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Template Needs Improvement',
        message: `"${worstTemplate.templateName}" has low engagement (${worstTemplate.openRate}% open rate). Consider revising the subject line, timing, or content.`,
        icon: AlertTriangle,
      });
    }

    // Click rate insights
    const lowClickTemplates = templatePerformance.filter(t => t.openRate > 50 && t.clickRate < 10);
    if (lowClickTemplates.length > 0) {
      recommendations.push({
        type: 'info' as const,
        title: 'Improve Call-to-Actions',
        message: `${lowClickTemplates.length} template(s) have good open rates but low click rates. Add clearer calls-to-action or links.`,
        icon: Lightbulb,
      });
    }

    // Overall performance insight
    if (avgOpenRate > 40) {
      recommendations.push({
        type: 'success' as const,
        title: 'Strong Overall Performance',
        message: `Your average open rate of ${Math.round(avgOpenRate)}% is above industry standards (20-30%). Keep up the good work!`,
        icon: CheckCircle2,
      });
    } else if (avgOpenRate < 20) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Below Industry Standards',
        message: `Your average open rate of ${Math.round(avgOpenRate)}% is below standards. Focus on subject lines, sender name, and sending times.`,
        icon: AlertTriangle,
      });
    }

    return recommendations;
  }, [templatePerformance]);

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 50) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 30) return <Badge className="bg-yellow-600">Fair</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  if (sentEmails.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No email data available yet.<br />
            Send some emails to get recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights & Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        {insights.map((insight, index) => (
          <Alert key={index} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
            <insight.icon className="h-4 w-4" />
            <AlertTitle>{insight.title}</AlertTitle>
            <AlertDescription>{insight.message}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Template Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance Breakdown</CardTitle>
          <CardDescription>Detailed metrics for each email template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {templatePerformance.map((template, index) => (
            <div key={template.templateId} className="space-y-3 pb-6 border-b last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{template.templateName}</h4>
                    <p className="text-sm text-muted-foreground">{template.totalSent} emails sent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(template.trend)}
                  {getScoreBadge(template.score)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Score</span>
                  <span className="font-semibold">{template.score}/100</span>
                </div>
                <Progress value={template.score} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Rate</p>
                  <p className="text-lg font-semibold">{template.deliveryRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                  <p className="text-lg font-semibold text-blue-600">{template.openRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Click Rate</p>
                  <p className="text-lg font-semibold text-purple-600">{template.clickRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CTR</p>
                  <p className="text-lg font-semibold text-green-600">{template.ctr}%</p>
                </div>
              </div>

              {/* Specific recommendations for this template */}
              {template.openRate < 30 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Tip:</strong> Try A/B testing different subject lines. Personal touches like recipient names can boost opens by 20%.
                  </AlertDescription>
                </Alert>
              )}
              
              {template.openRate > 40 && template.clickRate < 15 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Tip:</strong> Good open rate! Add prominent buttons and clear next steps to improve clicks.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Email Best Practices</CardTitle>
          <CardDescription>Tips to improve your email engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Subject Lines
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Keep under 50 characters</li>
                <li>Personalize with recipient name</li>
                <li>Create urgency or curiosity</li>
                <li>Avoid spam trigger words</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Content
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Single, clear call-to-action</li>
                <li>Mobile-friendly formatting</li>
                <li>Scannable with bullets/headers</li>
                <li>Include employee name</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Timing
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Send Tuesday-Thursday for best results</li>
                <li>Morning (9-11am) performs well</li>
                <li>Avoid Mondays and Fridays</li>
                <li>Test different times for your audience</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Frequency
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Don't overwhelm recipients</li>
                <li>Space emails 2-3 days apart</li>
                <li>Important updates can be immediate</li>
                <li>Monitor unsubscribe rates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
