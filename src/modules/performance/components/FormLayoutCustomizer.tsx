import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';

interface FormSection {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
}

const DEFAULT_SECTIONS: FormSection[] = [
  {
    id: 'ratings',
    name: 'Rating Criteria',
    description: 'Numerical ratings based on criteria',
    enabled: true,
    required: true,
  },
  {
    id: 'strengths',
    name: 'Key Strengths',
    description: 'Candidate\'s main strengths',
    enabled: true,
    required: false,
  },
  {
    id: 'concerns',
    name: 'Areas of Concern',
    description: 'Potential concerns or weaknesses',
    enabled: true,
    required: false,
  },
  {
    id: 'comments',
    name: 'Overall Comments',
    description: 'General feedback and observations',
    enabled: true,
    required: false,
  },
  {
    id: 'recommendation',
    name: 'Hiring Recommendation',
    description: 'Final recommendation decision',
    enabled: true,
    required: true,
  },
  {
    id: 'confidence',
    name: 'Confidence Level',
    description: 'Confidence in the assessment',
    enabled: true,
    required: false,
  },
];

const STORAGE_KEY = 'feedback_form_layout';

interface SortableSectionProps {
  section: FormSection;
  onToggle: (id: string) => void;
}

function SortableSection({ section, onToggle }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`${isDragging ? 'shadow-lg scale-105' : ''} transition-all`}
    >
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{section.name}</h4>
              {section.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`toggle-${section.id}`}
              checked={section.enabled}
              onCheckedChange={() => onToggle(section.id)}
              disabled={section.required}
            />
            <Label htmlFor={`toggle-${section.id}`} className="cursor-pointer">
              {section.enabled ? (
                <Eye className="h-4 w-4 text-primary" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FormLayoutCustomizer() {
  const { toast } = useToast();
  const [sections, setSections] = useState<FormSection[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSections(JSON.parse(saved));
    } else {
      setSections(DEFAULT_SECTIONS);
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return reordered;
      });
    }
  };

  const handleToggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id && !s.required ? { ...s, enabled: !s.enabled } : s
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    setHasChanges(false);
    toast({
      title: 'Layout Saved',
      description: 'Feedback form layout has been updated.',
    });
  };

  const handleReset = () => {
    if (confirm('Reset to default layout? This will discard all customizations.')) {
      setSections(DEFAULT_SECTIONS);
      localStorage.removeItem(STORAGE_KEY);
      setHasChanges(false);
      toast({
        title: 'Layout Reset',
        description: 'Feedback form layout has been reset to default.',
      });
    }
  };

  const enabledCount = sections.filter(s => s.enabled).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Form Layout Customization</CardTitle>
            <CardDescription>
              Drag to reorder sections, toggle visibility for optional fields
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Layout
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-medium">Active Sections</span>
          <Badge variant="default">
            {enabledCount} of {sections.length}
          </Badge>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {hasChanges && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fade-in">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              You have unsaved changes. Click "Save Layout" to apply them.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
