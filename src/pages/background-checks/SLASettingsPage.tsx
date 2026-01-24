import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSLAConfigurations, saveSLAConfiguration, getSLAStats } from '@/shared/lib/backgroundChecks/slaService';
import type { SLAConfiguration } from '@/shared/types/sla';
import { useToast } from '@/shared/hooks/use-toast';

export default function SLASettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SLAConfiguration[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
    setStats(getSLAStats());
  }, []);

  const loadConfigs = () => {
    setConfigs(getSLAConfigurations());
  };

  const handleSave = (config: SLAConfiguration) => {
    saveSLAConfiguration(config);
    setEditingId(null);
    loadConfigs();
    
    toast({
      title: "SLA Configuration Saved",
      description: `Settings for ${config.name} have been updated`,
    });
  };

  const handleToggle = (config: SLAConfiguration) => {
    const updated = { ...config, enabled: !config.enabled };
    saveSLAConfiguration(updated);
    loadConfigs();
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

  return (
    <DashboardPageLayout breadcrumbActions={breadcrumbActions}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">SLA Configuration</h1>
          <p className="text-muted-foreground">
            Define Service Level Agreement targets for background check processing times
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>On Track</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Warning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Critical</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Breached</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.breached}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SLA Configurations */}
        <div className="grid gap-4">
          {configs.map(config => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="text-base font-semibold flex items-center gap-2">
                      <CardTitle className="text-base font-semibold">{config.name}</CardTitle>
                      <Badge variant={config.enabled ? 'success' : 'outline'}>
                        {config.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>Status: {config.status}</CardDescription>
                  </div>
                  
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => handleToggle(config)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === config.id ? (
                  <SLAConfigForm
                    config={config}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target Days:</span>
                        <div className="font-medium mt-1">{config.targetDays} days</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Warning Threshold:</span>
                        <div className="font-medium mt-1">{config.warningThresholdPercent}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Critical Threshold:</span>
                        <div className="font-medium mt-1">{config.criticalThresholdPercent}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Business Days Only:</span>
                        <div className="font-medium mt-1">
                          {config.businessDaysOnly ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(config.id)}>
                        Edit Configuration
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  );
}

function SLAConfigForm({
  config,
  onSave,
  onCancel
}: {
  config: SLAConfiguration;
  onSave: (config: SLAConfiguration) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(config);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetDays">Target Days</Label>
          <Input
            id="targetDays"
            type="number"
            value={formData.targetDays}
            onChange={(e) => setFormData({ ...formData, targetDays: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="warningThreshold">Warning Threshold (%)</Label>
          <Input
            id="warningThreshold"
            type="number"
            value={formData.warningThresholdPercent}
            onChange={(e) => setFormData({ ...formData, warningThresholdPercent: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="criticalThreshold">Critical Threshold (%)</Label>
          <Input
            id="criticalThreshold"
            type="number"
            value={formData.criticalThresholdPercent}
            onChange={(e) => setFormData({ ...formData, criticalThresholdPercent: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="businessDays"
            checked={formData.businessDaysOnly}
            onCheckedChange={(checked) => setFormData({ ...formData, businessDaysOnly: checked })}
          />
          <Label htmlFor="businessDays">Business Days Only</Label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifyWarning"
            checked={formData.notifyAtWarning}
            onCheckedChange={(checked) => setFormData({ ...formData, notifyAtWarning: checked })}
          />
          <Label htmlFor="notifyWarning">Notify at Warning</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="notifyCritical"
            checked={formData.notifyAtCritical}
            onCheckedChange={(checked) => setFormData({ ...formData, notifyAtCritical: checked })}
          />
          <Label htmlFor="notifyCritical">Notify at Critical</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="notifyBreached"
            checked={formData.notifyAtBreached}
            onCheckedChange={(checked) => setFormData({ ...formData, notifyAtBreached: checked })}
          />
          <Label htmlFor="notifyBreached">Notify when Breached</Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
