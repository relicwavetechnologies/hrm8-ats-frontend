import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Calendar, DollarSign } from 'lucide-react';

interface RenewalAnalytics {
  contractId: string;
  renewalProbability: number;
  riskFactors: { factor: string; impact: 'high' | 'medium' | 'low' }[];
  positiveSignals: string[];
  recommendedActions: { action: string; priority: 'high' | 'medium' | 'low' }[];
  projectedValue: number;
  daysUntilRenewal: number;
}

interface RPORenewalAnalyticsProps {
  contractId: string;
  onTakeAction: (action: string) => void;
}

export function RPORenewalAnalytics({ contractId, onTakeAction }: RPORenewalAnalyticsProps) {
  // Mock data - will be replaced with real data later
  const analytics: RenewalAnalytics = {
    contractId,
    renewalProbability: 78,
    riskFactors: [
      { factor: 'Placement rate below target (82% vs 90% target)', impact: 'high' },
      { factor: 'Last consultant change was 2 weeks ago', impact: 'medium' },
      { factor: 'Client response time increased by 15%', impact: 'low' }
    ],
    positiveSignals: [
      'All SLAs met this quarter',
      'Client satisfaction score: 4.5/5',
      'Increased placement requests (+12% vs last quarter)',
      'Strong consultant-client relationship'
    ],
    recommendedActions: [
      { action: 'Schedule renewal discussion call', priority: 'high' },
      { action: 'Review and optimize consultant allocation', priority: 'high' },
      { action: 'Prepare performance report for client', priority: 'medium' },
      { action: 'Offer value-add services for renewal', priority: 'medium' }
    ],
    projectedValue: 145000,
    daysUntilRenewal: 45
  };

  const getRenewalColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-blue-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getRenewalStatus = (probability: number) => {
    if (probability >= 80) return { text: 'Strong', variant: 'default' as const };
    if (probability >= 60) return { text: 'Good', variant: 'secondary' as const };
    if (probability >= 40) return { text: 'Moderate', variant: 'outline' as const };
    return { text: 'At Risk', variant: 'destructive' as const };
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'destructive';
    if (impact === 'medium') return 'outline';
    return 'secondary';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
  };

  const status = getRenewalStatus(analytics.renewalProbability);

  return (
    <div className="space-y-6">
      {/* Renewal Probability Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Renewal Prediction</CardTitle>
              <CardDescription>AI-powered renewal likelihood analysis</CardDescription>
            </div>
            <Badge variant={status.variant} className="text-lg px-4 py-2">
              {status.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Renewal Probability</span>
              <span className={`text-2xl font-bold ${getRenewalColor(analytics.renewalProbability)}`}>
                {analytics.renewalProbability}%
              </span>
            </div>
            <Progress value={analytics.renewalProbability} className="h-3" />
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Days Until Renewal</div>
                <div className="font-semibold">{analytics.daysUntilRenewal} days</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Projected Value</div>
                <div className="font-semibold">${analytics.projectedValue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <CardTitle>Risk Factors</CardTitle>
            </div>
            <CardDescription>Issues that may impact renewal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{risk.factor}</p>
                    <Badge variant={getImpactColor(risk.impact)} className="mt-1">
                      {risk.impact} impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Positive Signals */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle>Positive Signals</CardTitle>
            </div>
            <CardDescription>Factors supporting renewal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.positiveSignals.map((signal, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{signal}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Steps to improve renewal probability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recommendedActions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getPriorityIcon(item.priority)}
                  <span className="text-sm">{item.action}</span>
                </div>
                <Button 
                  size="sm" 
                  variant={item.priority === 'high' ? 'default' : 'outline'}
                  onClick={() => onTakeAction(item.action)}
                >
                  Take Action
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
