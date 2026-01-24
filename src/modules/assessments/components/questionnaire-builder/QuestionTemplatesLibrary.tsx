import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Search, Plus, Filter, X } from 'lucide-react';
import { QUESTION_CATEGORIES, QUESTION_TEMPLATES, getQuestionsByCategory, searchQuestions, convertTemplateToQuestion, type QuestionTemplate } from '@/shared/lib/assessments/questionTemplatesLibrary';
import type { QuestionnaireQuestion } from '@/shared/types/questionnaireBuilder';

interface QuestionTemplatesLibraryProps {
  onAddQuestion: (question: QuestionnaireQuestion) => void;
  currentQuestionCount: number;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  'multiple-choice': 'Multiple Choice',
  'rating-scale': 'Rating Scale',
  'yes-no': 'Yes/No',
  'short-text': 'Short Text',
  'long-text': 'Long Text',
  'numeric': 'Numeric',
  'date': 'Date',
};

export default function QuestionTemplatesLibrary({ onAddQuestion, currentQuestionCount }: QuestionTemplatesLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const displayedTemplates = searchTerm 
    ? searchQuestions(searchTerm)
    : selectedCategory === 'all'
    ? QUESTION_TEMPLATES
    : getQuestionsByCategory(selectedCategory);

  const handleAddTemplate = (template: QuestionTemplate) => {
    const question = convertTemplateToQuestion(template, currentQuestionCount);
    onAddQuestion(question);
  };

  const getQuestionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'multiple-choice': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      'rating-scale': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      'yes-no': 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      'short-text': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      'long-text': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      'numeric': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      'date': 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20',
    };
    return colors[type] || 'bg-secondary';
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Question Templates Library</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Choose from {QUESTION_TEMPLATES.length} pre-written questions
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="border-b px-2">
            <ScrollArea className="w-full">
              <TabsList className="w-full justify-start h-auto p-2 bg-transparent">
                <TabsTrigger value="all" className="text-xs">
                  All ({QUESTION_TEMPLATES.length})
                </TabsTrigger>
                {QUESTION_CATEGORIES.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category} ({getQuestionsByCategory(category).length})
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          <ScrollArea className="h-[600px]">
            <TabsContent value={selectedCategory} className="mt-0 p-4 space-y-3">
              {displayedTemplates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No questions found</p>
                  <p className="text-sm mt-1">Try adjusting your search or category filter</p>
                </div>
              ) : (
                displayedTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-relaxed mb-2">
                            {template.text}
                          </p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddTemplate(template)}
                          className="flex-shrink-0"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getQuestionTypeColor(template.type)}>
                          {QUESTION_TYPE_LABELS[template.type]}
                        </Badge>
                        {!searchTerm && (
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        )}
                      </div>

                      {/* Show options preview for multiple choice */}
                      {template.type === 'multiple-choice' && template.options && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Options:</p>
                          <ul className="text-xs space-y-1">
                            {template.options.slice(0, 3).map((option, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                • {option.text}
                                {option.score !== undefined && (
                                  <span className="ml-2 text-primary">({option.score} pts)</span>
                                )}
                              </li>
                            ))}
                            {template.options.length > 3 && (
                              <li className="text-muted-foreground italic">
                                +{template.options.length - 3} more options
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Show rating scale preview */}
                      {template.type === 'rating-scale' && template.ratingConfig && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Scale: {template.ratingConfig.min} to {template.ratingConfig.max}
                            {template.ratingConfig.minLabel && template.ratingConfig.maxLabel && (
                              <span className="ml-2">
                                ({template.ratingConfig.minLabel} → {template.ratingConfig.maxLabel})
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {template.tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 4 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                +{template.tags.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
