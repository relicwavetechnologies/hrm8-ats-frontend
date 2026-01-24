import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Video, Phone, MessageSquare } from 'lucide-react';
import type { InterviewMode } from '@/shared/types/aiInterview';

interface SelectInterviewModeStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function SelectInterviewModeStep({ data, onUpdate }: SelectInterviewModeStepProps) {
  const modes: { value: InterviewMode; label: string; description: string; icon: any }[] = [
    { value: 'video', label: 'Video Interview', description: 'Face-to-face AI interview with camera', icon: Video },
    { value: 'phone', label: 'Phone Interview', description: 'Voice-only AI interview', icon: Phone },
    { value: 'text', label: 'Text Interview', description: 'Chat-based AI interview', icon: MessageSquare },
  ];

  return (
    <div className="space-y-4">
      <Label>Choose Interview Mode</Label>
      <RadioGroup value={data.interviewMode} onValueChange={(value) => onUpdate({ interviewMode: value })}>
        {modes.map(mode => {
          const Icon = mode.icon;
          return (
            <div key={mode.value} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value={mode.value} id={mode.value} />
              <div className="flex-1">
                <Label htmlFor={mode.value} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-5 w-5" />
                  {mode.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
