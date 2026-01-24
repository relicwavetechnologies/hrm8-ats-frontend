import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Zap, Plus, Edit, Trash2, Calendar, Play } from 'lucide-react';
import { AutomationRule } from '@/shared/types/feedbackAnalytics';
import { useToast } from '@/shared/hooks/use-toast';

const RULES_KEY = 'automation_rules';

export function AutomationRulesManager() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'interview_completed' as AutomationRule['trigger'],
    enabled: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    const data = localStorage.getItem(RULES_KEY);
    setRules(data ? JSON.parse(data) : []);
  };

  const toggleRule = (id: string, enabled: boolean) => {
    const updated = rules.map(rule =>
      rule.id === id ? { ...rule, enabled, updatedAt: new Date().toISOString() } : rule
    );
    localStorage.setItem(RULES_KEY, JSON.stringify(updated));
    setRules(updated);
    
    toast({
      title: enabled ? 'Rule Enabled' : 'Rule Disabled',
      description: `Automation rule has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const getTriggerLabel = (trigger: AutomationRule['trigger']) => {
    switch (trigger) {
      case 'interview_scheduled':
        return 'Interview Scheduled';
      case 'interview_completed':
        return 'Interview Completed';
      case 'pipeline_stage_change':
        return 'Pipeline Stage Change';
      case 'manual':
        return 'Manual Trigger';
    }
  };

  const getTriggerColor = (trigger: AutomationRule['trigger']) => {
    switch (trigger) {
      case 'interview_scheduled':
        return 'bg-blue-500';
      case 'interview_completed':
        return 'bg-green-500';
      case 'pipeline_stage_change':
        return 'bg-purple-500';
      case 'manual':
        return 'bg-gray-500';
    }
  };

  const simulateRule = (rule: AutomationRule) => {
    toast({
      title: 'Automation Simulated',
      description: `"${rule.name}" would send feedback requests to ${rule.targetRoles.length} role(s)`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Automation Rules
          </h2>
          <p className="text-muted-foreground">
            Configure automated feedback requests based on triggers
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid gap-4 md:grid-cols-2">
        {rules.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No automation rules yet</p>
              <p className="text-sm text-muted-foreground">
                Create rules to automatically request feedback based on events
              </p>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                      />
                    </div>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTriggerColor(rule.trigger)}>
                    {getTriggerLabel(rule.trigger)}
                  </Badge>
                  {rule.conditions.interviewStage && (
                    <Badge variant="outline">Stage: {rule.conditions.interviewStage}</Badge>
                  )}
                  {rule.conditions.daysBeforeInterview && (
                    <Badge variant="outline">
                      {rule.conditions.daysBeforeInterview} days before
                    </Badge>
                  )}
                  {rule.conditions.daysAfterInterview && (
                    <Badge variant="outline">
                      {rule.conditions.daysAfterInterview} days after
                    </Badge>
                  )}
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Target Roles: </span>
                  <span className="font-medium">{rule.targetRoles.join(', ')}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateRule(rule)}
                    disabled={!rule.enabled}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Note about implementation */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Automation rules are configured for frontend demonstration. 
            In production, these would trigger based on actual interview scheduling, completion events, 
            and pipeline changes through backend integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
