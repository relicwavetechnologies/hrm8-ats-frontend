import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import {
  getAllProviderTemplates,
  getTemplatesByProvider,
  convertProviderTemplateToAssessmentTemplate,
  type ProviderTemplate,
} from '@/shared/lib/assessments/providerTemplates';
import { getAssessmentTemplates, saveAssessmentTemplate } from '@/shared/lib/mockAssessmentTemplateStorage';
import type { AssessmentProvider, AssessmentType } from '@/shared/types/assessment';
import { ASSESSMENT_PRICING } from '@/shared/lib/assessments/pricingConstants';
import { Download, Search, Star, Clock, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface ProviderTemplateImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const PROVIDERS: { value: AssessmentProvider; label: string; logo: string }[] = [
  { value: 'testgorilla', label: 'TestGorilla', logo: '🦍' },
  { value: 'codility', label: 'Codility', logo: '💻' },
  { value: 'vervoe', label: 'Vervoe', logo: '✅' },
  { value: 'criteria', label: 'Criteria Corp', logo: '📊' },
  { value: 'harver', label: 'Harver', logo: '🎯' },
];

export function ProviderTemplateImportDialog({
  open,
  onClose,
  onImportComplete,
}: ProviderTemplateImportDialogProps) {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<AssessmentProvider | 'all'>('all');
  const [selectedType, setSelectedType] = useState<AssessmentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const allTemplates = getAllProviderTemplates();

  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    if (selectedProvider !== 'all') {
      templates = getTemplatesByProvider(selectedProvider);
    }

    if (selectedType !== 'all') {
      templates = templates.filter(t => t.assessmentType === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.categories.some(c => c.toLowerCase().includes(query))
      );
    }

    return templates;
  }, [allTemplates, selectedProvider, selectedType, searchQuery]);

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleImport = async () => {
    if (selectedTemplates.length === 0) {
      toast({
        title: 'No templates selected',
        description: 'Please select at least one template to import',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);

    try {
      const templatesToImport = allTemplates.filter(t =>
        selectedTemplates.includes(t.templateId)
      );

      let importedCount = 0;
      let skippedCount = 0;

      for (const providerTemplate of templatesToImport) {
        const existingTemplates = getAssessmentTemplates();
        const exists = existingTemplates.some(
          t =>
            t.name === `${providerTemplate.name} (${providerTemplate.providerName})` &&
            t.provider === providerTemplate.providerName
        );

        if (exists) {
          skippedCount++;
          continue;
        }

        const template = convertProviderTemplateToAssessmentTemplate(providerTemplate);
        saveAssessmentTemplate({
          id: `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...template,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        importedCount++;
      }

      toast({
        title: 'Import complete',
        description: `Successfully imported ${importedCount} template${importedCount !== 1 ? 's' : ''}${
          skippedCount > 0 ? `. ${skippedCount} template${skippedCount !== 1 ? 's' : ''} already exist${skippedCount === 1 ? 's' : ''}.` : ''
        }`,
      });

      setSelectedTemplates([]);
      onImportComplete();
      onClose();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'An error occurred while importing templates',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'advanced':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="transition-colors duration-500">
            Import Assessment Templates
          </DialogTitle>
          <DialogDescription className="transition-colors duration-500">
            Browse and import pre-built templates from leading assessment providers
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="providers">By Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col space-y-4">
            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={selectedProvider} onValueChange={v => setSelectedProvider(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {PROVIDERS.map(provider => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.logo} {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={selectedType} onValueChange={v => setSelectedType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(ASSESSMENT_PRICING).map(([type, info]) => (
                      <SelectItem key={type} value={type}>
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground transition-colors duration-500">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
              </p>
              <p className="text-sm text-muted-foreground transition-colors duration-500">
                {selectedTemplates.length} selected
              </p>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {filteredTemplates.map(template => {
                  const provider = PROVIDERS.find(p => p.value === template.providerName);
                  const isSelected = selectedTemplates.includes(template.templateId);

                  return (
                    <div
                      key={template.templateId}
                      className={`rounded-lg border p-4 transition-[background,border-color,box-shadow,color] duration-500 cursor-pointer hover:bg-muted/50 ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleTemplate(template.templateId)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTemplate(template.templateId)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium transition-colors duration-500">
                                {template.name}
                              </h4>
                              <p className="text-xs text-muted-foreground transition-colors duration-500 flex items-center gap-1 mt-1">
                                {provider?.logo} {provider?.label}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={getDifficultyColor(template.difficulty)}
                              >
                                {template.difficulty}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {template.popularity}%
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground transition-colors duration-500">
                            {template.description}
                          </p>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground transition-colors duration-500">
                              <Clock className="h-3 w-3" />
                              {template.duration} min
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground transition-colors duration-500">
                              <FileText className="h-3 w-3" />
                              {template.questionCount} questions
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            {template.categories.slice(0, 3).map(category => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {template.categories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.categories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredTemplates.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground transition-colors duration-500">
                      No templates found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="providers" className="flex-1 flex flex-col space-y-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {PROVIDERS.filter(p => getTemplatesByProvider(p.value).length > 0).map(provider => {
                  const templates = getTemplatesByProvider(provider.value);
                  return (
                    <div key={provider.value} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{provider.logo}</span>
                          <div>
                            <h3 className="font-semibold transition-colors duration-500">
                              {provider.label}
                            </h3>
                            <p className="text-xs text-muted-foreground transition-colors duration-500">
                              {templates.length} template{templates.length !== 1 ? 's' : ''} available
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {templates.map(template => {
                          const isSelected = selectedTemplates.includes(template.templateId);
                          return (
                            <div
                              key={template.templateId}
                              className={`rounded-lg border p-3 transition-[background,border-color,box-shadow,color] duration-500 cursor-pointer hover:bg-muted/50 ${
                                isSelected ? 'border-primary bg-primary/5' : ''
                              }`}
                              onClick={() => toggleTemplate(template.templateId)}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleTemplate(template.templateId)}
                                  onClick={e => e.stopPropagation()}
                                />
                                <div className="flex-1 space-y-1">
                                  <h4 className="text-sm font-medium transition-colors duration-500">
                                    {template.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground transition-colors duration-500">
                                    <Clock className="h-3 w-3" />
                                    {template.duration}m
                                    <FileText className="h-3 w-3 ml-1" />
                                    {template.questionCount}q
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground transition-colors duration-500">
            <CheckCircle2 className="h-4 w-4 inline mr-1" />
            {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={selectedTemplates.length === 0 || importing}>
              <Download className="h-4 w-4 mr-2" />
              {importing ? 'Importing...' : `Import ${selectedTemplates.length > 0 ? `(${selectedTemplates.length})` : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
