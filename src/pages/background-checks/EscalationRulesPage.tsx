import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEscalationRules, deleteEscalationRule, saveEscalationRule } from '@/shared/lib/backgroundChecks/escalationService';
import type { EscalationRule } from '@/shared/types/escalation';
import { useToast } from '@/shared/hooks/use-toast';

export default function EscalationRulesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rules, setRules] = useState<EscalationRule[]>([]);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    setRules(getEscalationRules());
  };

  const handleToggleRule = (rule: EscalationRule) => {
    const updated = { ...rule, enabled: !rule.enabled };
    saveEscalationRule(updated);
    loadRules();
    
    toast({
      title: rule.enabled ? "Rule Disabled" : "Rule Enabled",
      description: `${rule.name} has been ${rule.enabled ? 'disabled' : 'enabled'}`,
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this escalation rule?')) {
      deleteEscalationRule(ruleId);
      loadRules();
      
      toast({
        title: "Rule Deleted",
        description: "Escalation rule has been removed",
      });
    }
  };

  const breadcrumbActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/background-checks')}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Background Checks
    </Button>
  );

  const priorityColors = {
    low: 'secondary',
    medium: 'default',
    high: 'warning',
    critical: 'destructive',
  } as const;

  return (
    <DashboardPageLayout breadcrumbActions={breadcrumbActions}>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Escalation Rules</h1>
            <p className="text-muted-foreground">
              Configure automatic escalation when background checks exceed time thresholds
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Rule
          </Button>
        </div>

        <div className="grid gap-4">
          {rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <CardTitle className="text-base font-semibold">{rule.name}</CardTitle>
                      <Badge variant={priorityColors[rule.priority]}>
                        {rule.priority}
                      </Badge>
                      <Badge variant={rule.enabled ? 'success' : 'outline'}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                  
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggleRule(rule)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* TODO: Edit dialog */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium mt-1">
                      <Badge variant="outline">{rule.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Threshold:</span>
                    <div className="font-medium mt-1">{rule.daysThreshold} days</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Escalate To:</span>
                    <div className="font-medium mt-1">
                      {rule.escalateToNames?.join(', ') || `${rule.escalateTo.length} users`}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Notify Initiator:</span>
                    <div className="font-medium mt-1">
                      {rule.notifyOriginalInitiator ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rules.length === 0 && (
          <Card className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Escalation Rules</h3>
              <p className="text-muted-foreground mb-4">
                Create escalation rules to automatically notify managers when checks are delayed
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}
