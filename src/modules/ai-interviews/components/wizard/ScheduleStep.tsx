import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';

interface ScheduleStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ScheduleStep({ data, onUpdate }: ScheduleStepProps) {
  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="scheduledDate">Interview Date & Time</Label>
        <Input
          id="scheduledDate"
          type="datetime-local"
          min={minDate}
          value={data.scheduledDate || ''}
          onChange={(e) => onUpdate({ scheduledDate: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">
          The candidate will receive an invitation email with the interview link.
        </p>
      </div>
    </div>
  );
}
