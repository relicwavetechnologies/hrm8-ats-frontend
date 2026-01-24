import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Sparkles, FileText, Layers } from 'lucide-react';
import type { QuestionSource } from '@/shared/types/aiInterview';

interface ConfigureQuestionsStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function ConfigureQuestionsStep({ data, onUpdate }: ConfigureQuestionsStepProps) {
  const sources: { value: QuestionSource; label: string; description: string; icon: any }[] = [
    { value: 'predefined', label: 'Predefined Questions', description: 'Use curated question library', icon: FileText },
    { value: 'ai-generated', label: 'AI-Generated Questions', description: 'Dynamically generated based on job and candidate', icon: Sparkles },
    { value: 'hybrid', label: 'Hybrid Approach', description: 'Combine predefined and AI-generated', icon: Layers },
  ];

  return (
    <div className="space-y-4">
      <Label>Question Strategy</Label>
      <RadioGroup value={data.questionSource} onValueChange={(value) => onUpdate({ questionSource: value })}>
        {sources.map(source => {
          const Icon = source.icon;
          return (
            <div key={source.value} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value={source.value} id={source.value} />
              <div className="flex-1">
                <Label htmlFor={source.value} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-5 w-5" />
                  {source.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
