import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { TouchTarget } from '@/shared/components/ui/touch-target';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { GripVertical, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface FormSection {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  order: number;
}

interface SortableSectionProps {
  section: FormSection;
  onToggleVisibility: (id: string) => void;
}

function SortableSection({ section, onToggleVisibility }: SortableSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="mb-3">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <TouchTarget size="lg" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-6 w-6 text-muted-foreground" />
              </TouchTarget>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{section.name}</CardTitle>
              </div>
              <TouchTarget size="lg" onClick={() => onToggleVisibility(section.id)}>
                {section.visible ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
              </TouchTarget>
              <CollapsibleTrigger asChild>
                <TouchTarget size="lg">
                  <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </TouchTarget>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label htmlFor={`visible-${section.id}`} className="text-sm">
                  {section.visible ? 'Visible in form' : 'Hidden from form'}
                </Label>
                <Switch
                  id={`visible-${section.id}`}
                  checked={section.visible}
                  onCheckedChange={() => onToggleVisibility(section.id)}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

const DEFAULT_SECTIONS: FormSection[] = [
  {
    id: 'criteria-ratings',
    name: 'Criteria Ratings',
    description: 'Rate candidate on each criterion with confidence levels',
    visible: true,
    order: 1,
  },
  {
    id: 'structured-comments',
    name: 'Structured Comments',
    description: 'Add categorized feedback (strengths, concerns, observations)',
    visible: true,
    order: 2,
  },
  {
    id: 'overall-assessment',
    name: 'Overall Assessment',
    description: 'Overall score and hiring recommendation',
    visible: true,
    order: 3,
  },
  {
    id: 'confidence-rating',
    name: 'Confidence Rating',
    description: 'How confident are you in your evaluation?',
    visible: true,
    order: 4,
  },
];

export function MobileFormLayoutCustomizer() {
  const [sections, setSections] = useState<FormSection[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem('feedbackFormLayout');
    if (saved) {
      setSections(JSON.parse(saved));
    } else {
      setSections(DEFAULT_SECTIONS);
    }
  }, []);

  const saveSections = (updatedSections: FormSection[]) => {
    localStorage.setItem('feedbackFormLayout', JSON.stringify(updatedSections));
    setSections(updatedSections);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(sections, oldIndex, newIndex).map((section, index) => ({
      ...section,
      order: index + 1,
    }));

    saveSections(reordered);

    toast({
      title: 'Layout Updated',
      description: 'Form section order has been updated',
    });
  };

  const handleToggleVisibility = (id: string) => {
    const updated = sections.map((section) =>
      section.id === id ? { ...section, visible: !section.visible } : section
    );
    saveSections(updated);

    const section = updated.find(s => s.id === id);
    toast({
      title: section?.visible ? 'Section Shown' : 'Section Hidden',
      description: `${section?.name} ${section?.visible ? 'will appear' : 'is hidden'} in feedback forms`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Layout</CardTitle>
        <CardDescription>
          Drag to reorder sections. Tap eye icon to show/hide. Tap to expand details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
