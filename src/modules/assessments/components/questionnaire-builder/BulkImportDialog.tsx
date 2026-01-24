import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { FileUpload } from '@/shared/components/ui/file-upload';
import { parseCSVFile, parseExcelFile } from '@/shared/lib/importService';
import { QuestionnaireQuestion, QuestionType } from '@/shared/types/questionnaireBuilder';
import { useToast } from '@/shared/hooks/use-toast';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (questions: QuestionnaireQuestion[]) => void;
  existingQuestions: QuestionnaireQuestion[];
}

interface ParsedQuestion {
  text: string;
  type: string;
  options?: string;
  required?: string;
  description?: string;
  placeholder?: string;
  maxScore?: string;
  minValue?: string;
  maxValue?: string;
  ratingMin?: string;
  ratingMax?: string;
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
}

const VALID_QUESTION_TYPES: QuestionType[] = [
  'multiple-choice',
  'rating-scale',
  'yes-no',
  'short-text',
  'long-text',
  'numeric',
  'date',
  'file-upload'
];

export function BulkImportDialog({ open, onOpenChange, onImport, existingQuestions }: BulkImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);
    setIsProcessing(true);
    setErrors([]);
    setParsedQuestions([]);

    try {
      let data: ParsedQuestion[];
      
      if (file.name.endsWith('.csv')) {
        data = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcelFile(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      const { questions, validationErrors } = parseQuestionsFromData(data);
      
      setParsedQuestions(questions);
      setErrors(validationErrors);

      if (validationErrors.length === 0) {
        toast({
          title: 'File parsed successfully',
          description: `${questions.length} questions ready to import`,
        });
      } else {
        toast({
          title: 'File parsed with warnings',
          description: `${questions.length} questions parsed, ${validationErrors.length} warnings`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse file';
      setErrors([errorMessage]);
      toast({
        title: 'Import failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseQuestionsFromData = (data: ParsedQuestion[]) => {
    const questions: QuestionnaireQuestion[] = [];
    const validationErrors: string[] = [];
    const startOrder = existingQuestions.length;

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 for header row and 0-indexed array

      // Validate required fields
      if (!row.text || !row.type) {
        validationErrors.push(`Row ${rowNum}: Missing required fields (text or type)`);
        return;
      }

      // Validate question type
      const type = row.type.toLowerCase().trim();
      if (!VALID_QUESTION_TYPES.includes(type as QuestionType)) {
        validationErrors.push(`Row ${rowNum}: Invalid question type "${row.type}". Must be one of: ${VALID_QUESTION_TYPES.join(', ')}`);
        return;
      }

      const question: QuestionnaireQuestion = {
        id: `question-${Date.now()}-${index}`,
        type: type as QuestionType,
        text: row.text.trim(),
        description: row.description?.trim(),
        required: row.required?.toLowerCase() === 'true' || row.required?.toLowerCase() === 'yes',
        order: startOrder + index,
        placeholder: row.placeholder?.trim(),
        maxScore: row.maxScore ? parseInt(row.maxScore) : undefined,
      };

      // Parse options for multiple choice
      if (type === 'multiple-choice' && row.options) {
        const optionTexts = row.options.split('|').map(o => o.trim()).filter(o => o);
        question.options = optionTexts.map((text, idx) => ({
          id: `option-${Date.now()}-${index}-${idx}`,
          text,
        }));
      }

      // Parse rating scale config
      if (type === 'rating-scale') {
        question.ratingConfig = {
          min: row.ratingMin ? parseInt(row.ratingMin) : 1,
          max: row.ratingMax ? parseInt(row.ratingMax) : 5,
          minLabel: row.ratingMinLabel,
          maxLabel: row.ratingMaxLabel,
        };
      }

      // Parse numeric constraints
      if (type === 'numeric') {
        question.minValue = row.minValue ? parseInt(row.minValue) : undefined;
        question.maxValue = row.maxValue ? parseInt(row.maxValue) : undefined;
      }

      questions.push(question);
    });

    return { questions, validationErrors };
  };

  const handleImport = () => {
    if (parsedQuestions.length === 0) {
      toast({
        title: 'No questions to import',
        description: 'Please select a valid file first',
        variant: 'destructive',
      });
      return;
    }

    onImport(parsedQuestions);
    toast({
      title: 'Questions imported',
      description: `Successfully imported ${parsedQuestions.length} questions`,
    });
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedQuestions([]);
    setErrors([]);
    onOpenChange(false);
  };

  const getTypeColor = (type: QuestionType) => {
    const colors: Record<QuestionType, string> = {
      'multiple-choice': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'rating-scale': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'yes-no': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'short-text': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'long-text': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'numeric': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'date': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'file-upload': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[type];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Questions</DialogTitle>
          <DialogDescription>
            Import questions from CSV or Excel file. Download the template to see the expected format.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <FileUpload
              onFilesSelected={handleFileSelected}
              accept=".csv,.xlsx,.xls"
              maxFiles={1}
              maxSize={5 * 1024 * 1024} // 5MB
            />
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // Download template CSV
                const template = `text,type,options,required,description,placeholder,maxScore,ratingMin,ratingMax,ratingMinLabel,ratingMaxLabel,minValue,maxValue
"How would you rate your experience?",rating-scale,,true,"Rate from 1 to 5",,10,1,5,Poor,Excellent,,
"What is your primary skill?",multiple-choice,"JavaScript|Python|Java|C++",true,"Select your main programming language",,,,,,,
"Do you have team leadership experience?",yes-no,,true,"Answer yes or no",,,,,,,
"Describe your biggest achievement",long-text,,false,"Write a detailed response",Tell us about your success story,,,,,,,
"Years of experience",numeric,,true,"Enter number of years",,,,,,0,50`;
                
                const blob = new Blob([template], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'questionnaire_import_template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Errors Section */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Validation Warnings:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-muted-foreground">... and {errors.length - 5} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Section */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Preview: {parsedQuestions.length} questions ready</span>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="w-32">Type</TableHead>
                      <TableHead className="w-24">Required</TableHead>
                      <TableHead className="w-20">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedQuestions.map((question, idx) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{question.text}</div>
                            {question.description && (
                              <div className="text-sm text-muted-foreground">{question.description}</div>
                            )}
                            {question.options && (
                              <div className="text-xs text-muted-foreground">
                                Options: {question.options.map(o => o.text).join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getTypeColor(question.type)}>
                            {question.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={question.required ? 'default' : 'outline'}>
                            {question.required ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>{question.maxScore || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedQuestions.length === 0 || isProcessing}
          >
            Import {parsedQuestions.length > 0 && `(${parsedQuestions.length})`} Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
