import { useState, useEffect } from 'react';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Save, DollarSign, AlertCircle } from 'lucide-react';
import { saveExportTemplate, updateExportTemplate, isTemplateNameUnique, ExportTemplate } from '@/shared/lib/exportTemplateStorage';
import { useToast } from '@/shared/hooks/use-toast';

interface ExportTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableFields: string[];
  onTemplateSaved?: (template: ExportTemplate) => void;
  editTemplate?: ExportTemplate | null;
}

export function ExportTemplateDialog({
  open,
  onOpenChange,
  availableFields,
  onTemplateSaved,
  editTemplate
}: ExportTemplateDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [currencyFields, setCurrencyFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; fields?: string }>({});

  useEffect(() => {
    if (editTemplate) {
      setName(editTemplate.name);
      setDescription(editTemplate.description || '');
      setSelectedFields(editTemplate.fields);
      setCurrencyFields(editTemplate.currencyFields);
    } else {
      resetForm();
    }
  }, [editTemplate, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedFields([]);
    setCurrencyFields([]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; fields?: string } = {};

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Template name is required';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    } else if (!isTemplateNameUnique(trimmedName, editTemplate?.id)) {
      newErrors.name = 'A template with this name already exists';
    }

    // Validate fields
    if (selectedFields.length === 0) {
      newErrors.fields = 'At least one field must be selected';
    }

    // Validate description
    if (description.trim().length > 500) {
      newErrors.name = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => {
      const isSelected = prev.includes(field);
      const newFields = isSelected
        ? prev.filter(f => f !== field)
        : [...prev, field];
      
      // Remove from currency fields if field is deselected
      if (isSelected) {
        setCurrencyFields(currFields => currFields.filter(f => f !== field));
      }
      
      return newFields;
    });
  };

  const handleCurrencyFieldToggle = (field: string) => {
    setCurrencyFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
      setCurrencyFields([]);
    } else {
      setSelectedFields([...availableFields]);
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    try {
      let savedTemplate: ExportTemplate;

      if (editTemplate) {
        // Update existing template
        const updated = updateExportTemplate(editTemplate.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          fields: selectedFields,
          currencyFields: currencyFields,
        });

        if (!updated) {
          throw new Error('Failed to update template');
        }

        savedTemplate = updated;

        toast({
          title: 'Template Updated',
          description: `"${savedTemplate.name}" has been updated successfully`,
        });
      } else {
        // Create new template
        savedTemplate = saveExportTemplate({
          name: name.trim(),
          description: description.trim() || undefined,
          fields: selectedFields,
          currencyFields: currencyFields,
        });

        toast({
          title: 'Template Saved',
          description: `"${savedTemplate.name}" has been created successfully`,
        });
      }

      onTemplateSaved?.(savedTemplate);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {editTemplate ? 'Edit Export Template' : 'Create Export Template'}
          </DialogTitle>
          <DialogDescription>
            {editTemplate 
              ? 'Update your export template configuration'
              : 'Save field selections and currency settings for quick reuse'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., Monthly Sales Report"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              placeholder="Describe what this template is used for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Field Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Select Fields <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedFields.length === availableFields.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            {errors.fields && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fields}
              </p>
            )}

            <ScrollArea className="h-[200px] border rounded-lg p-3">
              <div className="space-y-2">
                {availableFields.map(field => (
                  <div key={field} className="space-y-2 p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`field-${field}`}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <label
                        htmlFor={`field-${field}`}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        {field}
                      </label>
                      {selectedFields.includes(field) && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>

                    {/* Currency Field Option */}
                    {selectedFields.includes(field) && (
                      <div className="ml-6 flex items-center space-x-2">
                        <Checkbox
                          id={`currency-${field}`}
                          checked={currencyFields.includes(field)}
                          onCheckedChange={() => handleCurrencyFieldToggle(field)}
                        />
                        <label
                          htmlFor={`currency-${field}`}
                          className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
                        >
                          <DollarSign className="h-3 w-3" />
                          Format as currency
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
              {currencyFields.length > 0 && (
                <span> · {currencyFields.length} currency field{currencyFields.length !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>

          {/* Currency Fields Summary */}
          {currencyFields.length > 0 && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Currency Fields
              </div>
              <div className="flex flex-wrap gap-1">
                {currencyFields.map(field => (
                  <Badge key={field} variant="default" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {editTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
