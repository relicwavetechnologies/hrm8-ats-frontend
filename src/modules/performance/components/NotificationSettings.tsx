import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Settings } from 'lucide-react';
import { getNotificationPreferences, updateNotificationPreferences } from '@/shared/lib/feedbackRequestService';
import { NotificationPreference } from '@/shared/types/feedbackRequest';
import { useToast } from '@/shared/hooks/use-toast';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference>({
    userId: 'current-user',
    emailOnRequest: true,
    emailReminders: true,
    reminderDaysBefore: 2,
    dailyDigest: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    const prefs = getNotificationPreferences('current-user');
    setPreferences(prefs);
  }, []);

  const handleSave = () => {
    updateNotificationPreferences(preferences);
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Email Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when you want to receive email notifications (simulated in frontend)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="email-on-request">Email on Feedback Request</Label>
            <p className="text-sm text-muted-foreground">
              Receive an email when someone requests your feedback
            </p>
          </div>
          <Switch
            id="email-on-request"
            checked={preferences.emailOnRequest}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, emailOnRequest: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="email-reminders">Email Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive reminder emails for pending feedback
            </p>
          </div>
          <Switch
            id="email-reminders"
            checked={preferences.emailReminders}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, emailReminders: checked })
            }
          />
        </div>

        {preferences.emailReminders && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="reminder-days">Send Reminder</Label>
            <Select
              value={preferences.reminderDaysBefore.toString()}
              onValueChange={(value) =>
                setPreferences({ ...preferences, reminderDaysBefore: parseInt(value) })
              }
            >
              <SelectTrigger id="reminder-days">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before due date</SelectItem>
                <SelectItem value="2">2 days before due date</SelectItem>
                <SelectItem value="3">3 days before due date</SelectItem>
                <SelectItem value="5">5 days before due date</SelectItem>
                <SelectItem value="7">1 week before due date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="daily-digest">Daily Digest</Label>
            <p className="text-sm text-muted-foreground">
              Receive a daily summary of pending feedback requests
            </p>
          </div>
          <Switch
            id="daily-digest"
            checked={preferences.dailyDigest}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, dailyDigest: checked })
            }
          />
        </div>

        <div className="pt-4 border-t">
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
