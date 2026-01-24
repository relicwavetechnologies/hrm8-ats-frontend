import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Target,
  Users,
  Star,
  MessageSquare,
  ExternalLink,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import type { RenewalAlert } from '@/shared/lib/rpoRenewalUtils';
import { cn } from '@/shared/lib/utils';

interface RPOContractRenewalAlertsProps {
  alerts: RenewalAlert[];
  summary: {
    total: number;
    critical: number;
    urgent: number;
    upcoming: number;
    stronglyRecommended: number;
    recommended: number;
    reviewNeeded: number;
    notRecommended: number;
    totalPotentialRevenue: number;
    totalRevenueAtRisk: number;
  };
}

export function RPOContractRenewalAlerts({ alerts, summary }: RPOContractRenewalAlertsProps) {
  const navigate = useNavigate();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'urgent' | 'upcoming'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filterUrgency === 'all') return true;
    return alert.urgency === filterUrgency;
  });

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'urgent': return <Clock className="h-4 w-4" />;
      case 'upcoming': return <Bell className="h-4 w-4" />;
      default: return null;
    }
  };

  const getUrgencyVariant = (urgency: string): 'destructive' | 'warning' | 'default' => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'urgent': return 'warning';
      default: return 'default';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strongly-recommend': return <CheckCircle2 className="h-4 w-4 text-chart-1" />;
      case 'recommend': return <TrendingUp className="h-4 w-4 text-chart-2" />;
      case 'review-needed': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'not-recommended': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'strongly-recommend': return 'Strongly Recommend Renewal';
      case 'recommend': return 'Recommend Renewal';
      case 'review-needed': return 'Review Needed';
      case 'not-recommended': return 'Not Recommended';
      default: return recommendation;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Contract Renewal Alerts
            </CardTitle>
            <CardDescription>
              Monitor contracts expiring soon and take action
            </CardDescription>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 border rounded-lg border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
            <p className="text-2xl font-bold text-destructive">{summary.critical}</p>
            <p className="text-xs text-muted-foreground">≤ 30 days</p>
          </div>

          <div className="p-3 border rounded-lg border-warning/50 bg-warning/5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
            <p className="text-2xl font-bold text-warning">{summary.urgent}</p>
            <p className="text-xs text-muted-foreground">31-45 days</p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
            <p className="text-2xl font-bold">{summary.upcoming}</p>
            <p className="text-xs text-muted-foreground">46-60 days</p>
          </div>

          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
            <p className="text-2xl font-bold">${(summary.totalRevenueAtRisk / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">Annual revenue</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filterUrgency === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUrgency('all')}
          >
            All ({summary.total})
          </Button>
          <Button
            variant={filterUrgency === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUrgency('critical')}
          >
            Critical ({summary.critical})
          </Button>
          <Button
            variant={filterUrgency === 'urgent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUrgency('urgent')}
          >
            Urgent ({summary.urgent})
          </Button>
          <Button
            variant={filterUrgency === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUrgency('upcoming')}
          >
            Upcoming ({summary.upcoming})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredAlerts.map((renewalAlert) => (
            <div
              key={renewalAlert.contract.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors",
                renewalAlert.urgency === 'critical' && "border-destructive bg-destructive/5",
                renewalAlert.urgency === 'urgent' && "border-warning bg-warning/5",
                expandedAlert === renewalAlert.contract.id && "bg-muted/50"
              )}
              onClick={() => setExpandedAlert(
                expandedAlert === renewalAlert.contract.id ? null : renewalAlert.contract.id
              )}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {renewalAlert.contract.clientLogo && (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={renewalAlert.contract.clientLogo} />
                      <AvatarFallback>{getInitials(renewalAlert.contract.clientName)}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{renewalAlert.contract.name}</h4>
                      <Badge variant={getUrgencyVariant(renewalAlert.urgency)} className="gap-1">
                        {getUrgencyIcon(renewalAlert.urgency)}
                        {renewalAlert.urgency.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {renewalAlert.contract.clientName}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {format(new Date(renewalAlert.expiryDate), 'MMM d, yyyy')}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        renewalAlert.daysUntilExpiry <= 30 ? "text-destructive" : "text-warning"
                      )}>
                        {renewalAlert.daysUntilExpiry} days remaining
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getRecommendationIcon(renewalAlert.recommendation)}
                  {expandedAlert === renewalAlert.contract.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Quick Performance Snapshot */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 bg-background rounded border">
                  <p className="text-xs text-muted-foreground">Placement Rate</p>
                  <p className="text-lg font-semibold">{renewalAlert.performance.placementSuccessRate}%</p>
                </div>
                <div className="p-2 bg-background rounded border">
                  <p className="text-xs text-muted-foreground">Client Satisfaction</p>
                  <p className="text-lg font-semibold">{renewalAlert.performance.clientSatisfactionScore}%</p>
                </div>
                <div className="p-2 bg-background rounded border">
                  <p className="text-xs text-muted-foreground">Avg. Time-to-Fill</p>
                  <p className="text-lg font-semibold">{renewalAlert.performance.averageTimeToFill}d</p>
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className={cn(
                "p-3 rounded-lg mb-3 flex items-start gap-2",
                renewalAlert.recommendation === 'strongly-recommend' && "bg-chart-1/10 border border-chart-1/20",
                renewalAlert.recommendation === 'recommend' && "bg-chart-2/10 border border-chart-2/20",
                renewalAlert.recommendation === 'review-needed' && "bg-warning/10 border border-warning/20",
                renewalAlert.recommendation === 'not-recommended' && "bg-destructive/10 border border-destructive/20"
              )}>
                {getRecommendationIcon(renewalAlert.recommendation)}
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">
                    {getRecommendationLabel(renewalAlert.recommendation)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {renewalAlert.recommendationReason}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAlert === renewalAlert.contract.id && (
                <div className="pt-3 border-t space-y-4">
                  {/* Detailed Performance Metrics */}
                  <div>
                    <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Performance Metrics
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Placement Success</span>
                          <span className="font-medium">{renewalAlert.performance.placementSuccessRate}%</span>
                        </div>
                        <Progress value={renewalAlert.performance.placementSuccessRate} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Candidate Quality</span>
                          <span className="font-medium">{renewalAlert.performance.candidateQualityScore}%</span>
                        </div>
                        <Progress value={renewalAlert.performance.candidateQualityScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Client Satisfaction</span>
                          <span className="font-medium">{renewalAlert.performance.clientSatisfactionScore}%</span>
                        </div>
                        <Progress value={renewalAlert.performance.clientSatisfactionScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Budget Adherence</span>
                          <span className="font-medium">{renewalAlert.performance.budgetAdherence}%</span>
                        </div>
                        <Progress value={renewalAlert.performance.budgetAdherence} className="h-2" />
                      </div>

                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Avg. Time-to-Fill</p>
                        <p className="text-sm font-semibold">{renewalAlert.performance.averageTimeToFill} days</p>
                      </div>

                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Communication Rating
                        </p>
                        <p className="text-sm font-semibold">{renewalAlert.performance.communicationRating.toFixed(1)} / 5.0</p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  <div>
                    <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Suggested Actions ({renewalAlert.suggestedActions.length})
                    </h5>
                    <div className="space-y-2">
                      {renewalAlert.suggestedActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-background">
                          <div className={cn(
                            "h-2 w-2 rounded-full mt-1.5",
                            action.priority === 'high' && "bg-destructive",
                            action.priority === 'medium' && "bg-warning",
                            action.priority === 'low' && "bg-muted-foreground"
                          )} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{action.action}</p>
                              <Badge 
                                variant={action.priority === 'high' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {action.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Impact */}
                  <div>
                    <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial Impact
                    </h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="text-lg font-semibold">
                          ${renewalAlert.currentContractValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg bg-chart-1/10">
                        <p className="text-xs text-muted-foreground">Projected Renewal</p>
                        <p className="text-lg font-semibold">
                          ${renewalAlert.projectedRenewalValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg bg-destructive/10">
                        <p className="text-xs text-muted-foreground">Revenue at Risk</p>
                        <p className="text-lg font-semibold text-destructive">
                          ${renewalAlert.potentialRevenueImpact.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recruitment-services/${renewalAlert.contract.id}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Contract
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // In a real app, this would open a renewal workflow
                        window.alert('Renewal workflow will be implemented here');
                      }}
                    >
                      Start Renewal Process
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contracts require renewal attention in this category</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
