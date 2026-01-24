/**
 * Schedule Report Dialog
 * Dialog for scheduling recurring report emails
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Loader2, Calendar, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  reportType: string;
  currentFilters?: Record<string, string>;
}

export function ScheduleReportDialog({
  open,
  onOpenChange,
  reportName,
  reportType,
}: ScheduleReportDialogProps) {
  const [saving, setSaving] = useState(false);
  const [frequency, setFrequency] = useState<string>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState<string>('monday');
  const [dayOfMonth, setDayOfMonth] = useState<string>('1');
  const [time, setTime] = useState<string>('09:00');
  const [recipients, setRecipients] = useState<string>('');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [format, setFormat] = useState<string>('pdf');

  const handleSave = async () => {
    if (!recipients.trim()) {
      toast.error('Please enter at least one email recipient');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Report scheduled successfully', {
        description: `${reportName} will be sent ${frequency}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to schedule report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Report
          </DialogTitle>
          <DialogDescription>
            Set up recurring email delivery for <strong>{reportName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day selection based on frequency */}
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>Day of Month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Delivery Time
            </Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Recipients
            </Label>
            <Input
              placeholder="email@example.com, another@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Report Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include current filters */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includeFilters">Include Current Filters</Label>
              <p className="text-sm text-muted-foreground">Apply your current filter settings to scheduled report</p>
            </div>
            <Switch
              id="includeFilters"
              checked={includeFilters}
              onCheckedChange={setIncludeFilters}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
