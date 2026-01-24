import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { TouchTarget } from '@/shared/components/ui/touch-target';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
import { GripVertical, Plus, Trash2, Edit, ChevronDown, Save, X } from 'lucide-react';
import { RatingCriterion, RatingScale } from '@/shared/types/collaborativeFeedback';
import {
  getRatingCriteria,
  saveRatingCriterion,
  updateRatingCriterion,
  deleteRatingCriterion,
  reorderRatingCriteria,
} from '@/shared/lib/collaborativeFeedbackService';
import { useToast } from '@/shared/hooks/use-toast';

interface SortableItemProps {
  criterion: RatingCriterion;
  onEdit: (criterion: RatingCriterion) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ criterion, onEdit, onDelete }: SortableItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: criterion.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColors = {
    technical: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    cultural: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    communication: 'bg-green-500/10 text-green-700 dark:text-green-300',
    leadership: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    custom: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
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
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base truncate">{criterion.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {criterion.scale}
                  </Badge>
                </div>
                <Badge className={categoryColors[criterion.category]} variant="secondary">
                  {criterion.category}
                </Badge>
              </div>
              <CollapsibleTrigger asChild>
                <TouchTarget size="lg">
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </TouchTarget>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-muted-foreground">{criterion.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weight:</span>
                <Badge variant="outline">{criterion.weight}x</Badge>
              </div>
              <div className="flex gap-2">
                <TouchTarget size="lg" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(criterion)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </TouchTarget>
                <TouchTarget size="lg" className="flex-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(criterion.id)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </TouchTarget>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

export function MobileDraggableRatingCriteria() {
  const [criteria, setCriteria] = useState<RatingCriterion[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RatingCriterion>>({
    name: '',
    description: '',
    scale: '1-5' as RatingScale,
    weight: 1,
    category: 'technical',
  });
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
    loadCriteria();
  }, []);

  const loadCriteria = () => {
    const allCriteria = getRatingCriteria();
    setCriteria(allCriteria);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = criteria.findIndex((c) => c.id === active.id);
    const newIndex = criteria.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(criteria, oldIndex, newIndex);
    setCriteria(reordered);
    reorderRatingCriteria(reordered);

    toast({
      title: 'Criteria Reordered',
      description: 'Rating criteria order has been updated',
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingId) {
      updateRatingCriterion(editingId, formData);
      toast({
        title: 'Criterion Updated',
        description: 'Rating criterion has been updated successfully',
      });
      setEditingId(null);
    } else {
      saveRatingCriterion(formData as Omit<RatingCriterion, 'id'>);
      toast({
        title: 'Criterion Added',
        description: 'New rating criterion has been added',
      });
      setIsAdding(false);
    }

    resetForm();
    loadCriteria();
  };

  const handleEdit = (criterion: RatingCriterion) => {
    setFormData(criterion);
    setEditingId(criterion.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    deleteRatingCriterion(id);
    toast({
      title: 'Criterion Deleted',
      description: 'Rating criterion has been removed',
    });
    loadCriteria();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      scale: '1-5',
      weight: 1,
      category: 'technical',
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rating Criteria</CardTitle>
          <CardDescription>
            Drag criteria to reorder. Tap to expand and edit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={criteria.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {criteria.map((criterion) => (
                  <SortableItem
                    key={criterion.id}
                    criterion={criterion}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {!isAdding ? (
            <TouchTarget size="lg" className="w-full">
              <Button onClick={() => setIsAdding(true)} className="w-full" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add New Criterion
              </Button>
            </TouchTarget>
          ) : (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-base">
                  {editingId ? 'Edit Criterion' : 'New Criterion'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Technical Skills"
                    className="min-h-[44px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this criterion evaluates"
                    rows={3}
                    className="min-h-[88px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                  >
                    <SelectTrigger id="category" className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="cultural">Cultural Fit</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scale">Rating Scale</Label>
                  <Select
                    value={formData.scale}
                    onValueChange={(value) => setFormData({ ...formData, scale: value as RatingScale })}
                  >
                    <SelectTrigger id="scale" className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 Scale</SelectItem>
                      <SelectItem value="1-10">1-10 Scale</SelectItem>
                      <SelectItem value="binary">Binary (Yes/No)</SelectItem>
                      <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (1-5)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="min-h-[44px]"
                  />
                </div>

                <div className="flex gap-2">
                  <TouchTarget size="lg" className="flex-1">
                    <Button onClick={handleSave} className="w-full" size="lg">
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Update' : 'Save'}
                    </Button>
                  </TouchTarget>
                  <TouchTarget size="lg" className="flex-1">
                    <Button onClick={resetForm} variant="outline" className="w-full" size="lg">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </TouchTarget>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
