import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import {
  getRatingCriteria,
  saveRatingCriterion,
  updateRatingCriterion,
  deleteRatingCriterion,
} from '@/shared/lib/collaborativeFeedbackService';
import { RatingCriterion, RatingScale } from '@/shared/types/collaborativeFeedback';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export function RatingCriteriaManager() {
  const { toast } = useToast();
  const [criteria, setCriteria] = useState<RatingCriterion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<RatingCriterion>>({
    name: '',
    description: '',
    scale: '1-10',
    weight: 0.1,
    category: 'custom',
  });

  const loadCriteria = () => {
    const data = getRatingCriteria();
    setCriteria(data);
  };

  useEffect(() => {
    loadCriteria();
  }, []);

  const handleAdd = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide name and description.',
        variant: 'destructive',
      });
      return;
    }

    saveRatingCriterion(formData as Omit<RatingCriterion, 'id'>);
    toast({
      title: 'Criterion Added',
      description: 'New rating criterion has been added successfully.',
    });
    setIsAdding(false);
    setFormData({
      name: '',
      description: '',
      scale: '1-10',
      weight: 0.1,
      category: 'custom',
    });
    loadCriteria();
  };

  const handleUpdate = (id: string) => {
    updateRatingCriterion(id, formData);
    toast({
      title: 'Criterion Updated',
      description: 'Rating criterion has been updated successfully.',
    });
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      scale: '1-10',
      weight: 0.1,
      category: 'custom',
    });
    loadCriteria();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this criterion?')) {
      deleteRatingCriterion(id);
      toast({
        title: 'Criterion Deleted',
        description: 'Rating criterion has been removed.',
      });
      loadCriteria();
    }
  };

  const startEdit = (criterion: RatingCriterion) => {
    setEditingId(criterion.id);
    setFormData(criterion);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      description: '',
      scale: '1-10',
      weight: 0.1,
      category: 'custom',
    });
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rating Criteria</CardTitle>
              <CardDescription>
                Manage custom rating criteria for candidate evaluation
              </CardDescription>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">Total Weight</span>
            <Badge variant={totalWeight === 1 ? 'default' : 'destructive'}>
              {(totalWeight * 100).toFixed(0)}%
            </Badge>
          </div>

          {/* Add Form */}
          {isAdding && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-base">New Criterion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Technical Expertise"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe what this criterion measures..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scale</label>
                    <Select
                      value={formData.scale}
                      onValueChange={(value: RatingScale) => setFormData({ ...formData, scale: value })}
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="leadership">Leadership</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Weight: {(formData.weight! * 100).toFixed(0)}%
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[formData.weight || 0.1]}
                    onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAdd}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Criteria List */}
          {criteria.map((criterion) => (
            <Card key={criterion.id} className={editingId === criterion.id ? 'border-2 border-primary' : ''}>
              <CardContent className="pt-6">
                {editingId === criterion.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Scale</label>
                        <Select
                          value={formData.scale}
                          onValueChange={(value: RatingScale) => setFormData({ ...formData, scale: value })}
                        >
                          <SelectTrigger>
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
                        <label className="text-sm font-medium">Category</label>
                        <Select
                          value={formData.category}
                          onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                            <SelectItem value="leadership">Leadership</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Weight: {(formData.weight! * 100).toFixed(0)}%
                      </label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[formData.weight || 0.1]}
                        onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(criterion.id)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={cancelEdit} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{criterion.name}</h4>
                          <Badge variant="outline">{criterion.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(criterion)}
                          disabled={isAdding || editingId !== null}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(criterion.id)}
                          disabled={isAdding || editingId !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">Scale: {criterion.scale}</Badge>
                      <Badge>Weight: {(criterion.weight * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {criteria.length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              No rating criteria defined. Add your first criterion to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
