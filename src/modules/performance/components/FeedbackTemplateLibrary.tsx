import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { feedbackTemplates, FeedbackTemplate } from '@/shared/lib/mockFeedbackTemplates';
import { FileText, Copy, Eye } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface FeedbackTemplateLibraryProps {
  onSelectTemplate?: (template: FeedbackTemplate) => void;
}

export const FeedbackTemplateLibrary = ({ onSelectTemplate }: FeedbackTemplateLibraryProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<FeedbackTemplate | null>(null);

  const categories = ['all', 'technical', 'behavioral', 'leadership', 'general'] as const;
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'All Templates',
      technical: 'Technical',
      behavioral: 'Behavioral',
      leadership: 'Leadership',
      general: 'General'
    };
    return labels[category] || category;
  };

  const getTemplatesByCategory = (category: typeof categories[number]) => {
    if (category === 'all') return feedbackTemplates;
    return feedbackTemplates.filter(t => t.category === category);
  };

  const handleUseTemplate = (template: FeedbackTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    toast({
      title: "Template Applied",
      description: `"${template.name}" template has been loaded.`,
    });
  };

  const handleCopyTemplate = (template: FeedbackTemplate) => {
    const text = template.sections
      .map(s => `${s.prompt}:\n${s.placeholder}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Template structure has been copied.",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Feedback Templates Library</h3>
        <p className="text-sm text-muted-foreground">
          Pre-built templates to help structure your feedback effectively
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTemplatesByCategory(category).map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <FileText className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {template.sections.length} sections
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                            <DialogDescription>
                              {selectedTemplate?.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            {selectedTemplate?.sections.map((section, idx) => (
                              <div key={idx} className="border-l-2 border-primary pl-4">
                                <div className="font-medium text-sm mb-1">{section.prompt}</div>
                                <div className="text-sm text-muted-foreground italic">
                                  {section.placeholder}
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyTemplate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Structure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
