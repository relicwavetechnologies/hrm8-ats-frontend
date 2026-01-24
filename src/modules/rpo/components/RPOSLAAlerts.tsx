import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { AlertCircle, Bell, BellOff, Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  metric: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface RPOSLAAlertsProps {
  contractId: string;
}

export function RPOSLAAlerts({ contractId }: RPOSLAAlertsProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [threshold, setThreshold] = useState(85);

  // Mock alerts data
  const alerts: Alert[] = [
    {
      id: '1',
      metric: 'Monthly Placement Target',
      severity: 'warning',
      message: 'Current placements (7) are below target (10). 3 more placements needed by month end.',
      timestamp: '2 hours ago',
      acknowledged: false
    },
    {
      id: '2',
      metric: 'Time to Submit Candidates',
      severity: 'info',
      message: 'Performance improving! Average submission time decreased by 6 hours this week.',
      timestamp: '5 hours ago',
      acknowledged: false
    },
    {
      id: '3',
      metric: 'Client Response Time',
      severity: 'critical',
      message: 'Response time exceeded target for 2 consecutive days. Immediate attention required.',
      timestamp: '1 day ago',
      acknowledged: true
    }
  ];

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'destructive';
    if (severity === 'warning') return 'default';
    return 'secondary';
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (severity === 'warning') return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
          <CardDescription>Configure when and how you receive SLA alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-alerts">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
              </div>
              <Switch
                id="email-alerts"
                checked={emailAlerts}
                onCheckedChange={setEmailAlerts}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-alerts">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts in the app</p>
                </div>
              </div>
              <Switch
                id="push-alerts"
                checked={pushAlerts}
                onCheckedChange={setPushAlerts}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Alert Threshold (%)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Alert when performance drops below this percentage
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full">Save Alert Settings</Button>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Recent SLA alerts and notifications</CardDescription>
            </div>
            <Badge variant="outline">
              {alerts.filter(a => !a.acknowledged).length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.acknowledged ? 'bg-muted/50 opacity-60' : 'bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{alert.metric}</h4>
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                      {!alert.acknowledged && (
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
