import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
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
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Bell, Plus, Trash2, Save, Settings2, Moon, Mail, Smartphone, MessageSquare, Loader2 } from 'lucide-react';
import type { AlertRule, NotificationEventType, NotificationChannel } from '@/shared/types/notificationPreferences';
import { userNotificationPreferencesService, type CreateAlertRuleData } from '@/shared/lib/userNotificationPreferencesService';
import { toast } from 'sonner';

// Event labels for display
const EVENT_LABELS: Record<string, string> = {
  new_application: 'New Job Application',
  application_status_change: 'Application Status Change',
  interview_scheduled: 'Interview Scheduled',
  job_posted: 'Job Posted',
  payment_received: 'Payment Received',
  payment_failed: 'Payment Failed',
  subscription_change: 'Subscription Change',
  system_announcement: 'System Announcement',
  user_signup: 'New User Signup',
  support_ticket: 'Support Ticket',
};

// Channel icons
const CHANNEL_ICONS = {
  email: Mail,
  'in-app': Bell,
  sms: Smartphone,
  slack: MessageSquare,
};

// Channels that are coming soon (not yet implemented)
const COMING_SOON_CHANNELS: NotificationChannel[] = ['sms', 'slack'];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<any>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  // Load preferences and rules from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prefs, rules] = await Promise.all([
        userNotificationPreferencesService.getPreferences(),
        userNotificationPreferencesService.getAlertRules(),
      ]);
      setPreferences(prefs);
      setAlertRules(rules);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast.error('Failed to load preferences');
      // Set defaults if API fails
      setPreferences({
        eventPreferences: Object.keys(EVENT_LABELS).reduce((acc, key) => ({
          ...acc,
          [key]: { enabled: true, channels: ['email', 'in-app'] }
        }), {}),
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
      });
      setAlertRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = (eventType: string, enabled: boolean) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      eventPreferences: {
        ...preferences.eventPreferences,
        [eventType]: {
          ...preferences.eventPreferences[eventType],
          enabled,
        },
      },
    });
  };

  const handleToggleChannel = (eventType: string, channel: NotificationChannel) => {
    if (!preferences) return;

    // Don't allow toggling coming soon channels
    if (COMING_SOON_CHANNELS.includes(channel)) {
      toast.info(`${channel.toUpperCase()} notifications coming soon!`);
      return;
    }

    const currentChannels = preferences.eventPreferences[eventType]?.channels || [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c: string) => c !== channel)
      : [...currentChannels, channel];

    setPreferences({
      ...preferences,
      eventPreferences: {
        ...preferences.eventPreferences,
        [eventType]: {
          ...preferences.eventPreferences[eventType],
          channels: newChannels,
        },
      },
    });
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      await userNotificationPreferencesService.updatePreferences({
        eventPreferences: preferences.eventPreferences,
        quietHours: preferences.quietHours,
      });
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleQuietHours = (enabled: boolean) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        enabled,
      },
    });
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [field]: value,
      },
    });
  };

  const handleCreateRule = () => {
    setEditingRule({
      id: '',
      userId: '',
      name: '',
      description: '',
      enabled: true,
      eventType: 'new_application' as NotificationEventType,
      conditions: [],
      actions: {
        channels: ['email', 'in-app'],
        recipients: [],
        priority: 'high',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '',
    } as AlertRule);
    setIsRuleDialogOpen(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setIsRuleDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!editingRule) return;

    setSavingRule(true);
    try {
      const ruleData: CreateAlertRuleData = {
        name: editingRule.name,
        description: editingRule.description,
        enabled: editingRule.enabled,
        eventType: editingRule.eventType,
        conditions: editingRule.conditions || [],
        actions: editingRule.actions,
      };

      if (editingRule.id) {
        await userNotificationPreferencesService.updateAlertRule(editingRule.id, ruleData);
        toast.success('Alert rule updated');
      } else {
        await userNotificationPreferencesService.createAlertRule(ruleData);
        toast.success('Alert rule created');
      }

      // Reload rules
      const rules = await userNotificationPreferencesService.getAlertRules();
      setAlertRules(rules);
      setIsRuleDialogOpen(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to save alert rule:', error);
      toast.error('Failed to save alert rule');
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await userNotificationPreferencesService.deleteAlertRule(id);
      toast.success('Alert rule deleted');
      setAlertRules(rules => rules.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
      toast.error('Failed to delete alert rule');
    }
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    try {
      await userNotificationPreferencesService.updateAlertRule(id, { enabled });
      setAlertRules(rules => rules.map(r => r.id === id ? { ...r, enabled } : r));
    } catch (error) {
      console.error('Failed to toggle alert rule:', error);
      toast.error('Failed to update alert rule');
    }
  };

  if (loading) {
    return (
      <DashboardPageLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  if (!preferences) return null;

  return (
    <DashboardPageLayout>
      <TooltipProvider>
        <div className="p-6 space-y-6">
          <AtsPageHeader
            title="Notification Preferences"
            subtitle="Configure notification channels and automated alert rules"
          >
            <Button onClick={handleSavePreferences} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </AtsPageHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Event Notifications
                </CardTitle>
                <CardDescription className="text-sm">Configure which events trigger notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(preferences.eventPreferences || {}).map(([eventType, config]: [string, any]) => (
                  <div key={eventType} className="space-y-2 pb-4 border-b last:border-0">
                    <div className="text-base font-semibold flex items-center justify-between">
                      <Label className="text-sm font-medium">{EVENT_LABELS[eventType] || eventType}</Label>
                      <Switch
                        checked={config?.enabled ?? true}
                        onCheckedChange={(checked) => handleToggleEvent(eventType, checked)}
                      />
                    </div>
                    {config?.enabled && (
                      <div className="flex gap-2 ml-6 flex-wrap">
                        {(['email', 'in-app', 'sms', 'slack'] as NotificationChannel[]).map((channel) => {
                          const Icon = CHANNEL_ICONS[channel];
                          const isActive = config.channels?.includes(channel);
                          const isComingSoon = COMING_SOON_CHANNELS.includes(channel);

                          const button = (
                            <Button
                              key={channel}
                              variant={isActive && !isComingSoon ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleChannel(eventType, channel)}
                              disabled={isComingSoon}
                              className={isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {channel}
                              {isComingSoon && (
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                                  Soon
                                </Badge>
                              )}
                            </Button>
                          );

                          if (isComingSoon) {
                            return (
                              <Tooltip key={channel}>
                                <TooltipTrigger asChild>
                                  {button}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{channel.toUpperCase()} notifications coming soon!</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          }

                          return button;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Quiet Hours
                </CardTitle>
                <CardDescription className="text-sm">Pause non-critical notifications during specific hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-base font-semibold flex items-center justify-between">
                  <Label>Enable Quiet Hours</Label>
                  <Switch
                    checked={preferences.quietHours?.enabled ?? false}
                    onCheckedChange={handleToggleQuietHours}
                  />
                </div>
                {preferences.quietHours?.enabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={preferences.quietHours.start || '22:00'}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={preferences.quietHours.end || '08:00'}
                        onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Alert Rules
                  </CardTitle>
                  <CardDescription className="text-sm">Configure automated alert rules with custom conditions</CardDescription>
                </div>
                <Button onClick={handleCreateRule} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No alert rules configured yet</p>
                  </div>
                ) : (
                  alertRules.map((rule) => (
                    <Card key={rule.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-semibold">{rule.name}</h4>
                              <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                                {rule.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                              <Badge variant="outline">{rule.actions?.priority}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                            <div className="flex gap-2 text-xs flex-wrap">
                              <span className="text-muted-foreground">Event: {EVENT_LABELS[rule.eventType] || rule.eventType}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                Channels: {rule.actions?.channels?.join(', ')}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                Recipients: {rule.actions?.recipients?.length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRule(rule)}
                            >
                              Edit
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingRule?.id ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>
                <DialogDescription>Configure automated alerts based on specific conditions</DialogDescription>
              </DialogHeader>
              {editingRule && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input
                      value={editingRule.name}
                      onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                      placeholder="e.g., Critical Ticket Alert"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editingRule.description || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                      placeholder="Describe when this rule should trigger"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={editingRule.eventType}
                      onValueChange={(value) => setEditingRule({ ...editingRule, eventType: value as NotificationEventType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EVENT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={editingRule.actions?.priority || 'medium'}
                      onValueChange={(value: any) => setEditingRule({
                        ...editingRule,
                        actions: { ...editingRule.actions, priority: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipients (comma-separated emails)</Label>
                    <Input
                      value={editingRule.actions?.recipients?.join(', ') || ''}
                      onChange={(e) => setEditingRule({
                        ...editingRule,
                        actions: {
                          ...editingRule.actions,
                          recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                      })}
                      placeholder="admin@example.com, manager@example.com"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveRule} disabled={savingRule}>
                      {savingRule && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Rule
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </DashboardPageLayout>
  );
}
