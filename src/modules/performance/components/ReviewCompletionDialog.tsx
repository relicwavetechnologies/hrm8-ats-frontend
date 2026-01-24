import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { getReviewTemplates, savePerformanceReview } from "@/shared/lib/performanceStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import type { PerformanceReview, ReviewResponse } from "@/shared/types/performance";

interface ReviewCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function ReviewCompletionDialog({ open, onOpenChange, onComplete }: ReviewCompletionDialogProps) {
  const [step, setStep] = useState<'setup' | 'review'>('setup');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [overallRating, setOverallRating] = useState<number>(0);
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [goals, setGoals] = useState("");
  const [managerComments, setManagerComments] = useState("");

  const employees = getEmployees();
  const templates = getReviewTemplates().filter(t => t.isActive);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleStartReview = () => {
    if (!selectedEmployeeId || !selectedTemplateId) {
      toast({
        title: "Missing Information",
        description: "Please select both employee and review template",
        variant: "destructive"
      });
      return;
    }
    setStep('review');
  };

  const handleResponseChange = (sectionId: string, questionId: string, value: any, type: 'rating' | 'text' | 'options') => {
    setResponses(prev => {
      const existing = prev.find(r => r.sectionId === sectionId && r.questionId === questionId);
      const newResponse: ReviewResponse = {
        sectionId,
        questionId,
        ...(type === 'rating' && { rating: value }),
        ...(type === 'text' && { textResponse: value }),
        ...(type === 'options' && { selectedOptions: value })
      };

      if (existing) {
        return prev.map(r => 
          r.sectionId === sectionId && r.questionId === questionId ? newResponse : r
        );
      }
      return [...prev, newResponse];
    });
  };

  const getResponseValue = (sectionId: string, questionId: string, type: 'rating' | 'text' | 'options') => {
    const response = responses.find(r => r.sectionId === sectionId && r.questionId === questionId);
    if (!response) return type === 'options' ? [] : type === 'rating' ? 0 : '';
    return type === 'rating' ? response.rating : type === 'text' ? response.textResponse : response.selectedOptions;
  };

  const handleComplete = () => {
    if (!selectedTemplate || !selectedEmployeeId) return;

    const employee = employees.find(e => e.id === selectedEmployeeId);
    if (!employee) return;

    const employeeName = `${employee.firstName} ${employee.lastName}`;

    // Validate all required questions are answered
    const allQuestions = selectedTemplate.sections.flatMap(s => 
      s.questions.filter(q => q.required).map(q => ({ sectionId: s.id, questionId: q.id }))
    );
    
    const missingResponses = allQuestions.filter(({ sectionId, questionId }) => 
      !responses.find(r => r.sectionId === sectionId && r.questionId === questionId)
    );

    if (missingResponses.length > 0) {
      toast({
        title: "Incomplete Review",
        description: "Please answer all required questions",
        variant: "destructive"
      });
      return;
    }

    if (overallRating === 0) {
      toast({
        title: "Overall Rating Required",
        description: "Please provide an overall rating",
        variant: "destructive"
      });
      return;
    }

    const review: PerformanceReview = {
      id: `review-${Date.now()}`,
      employeeId: selectedEmployeeId,
      employeeName,
      reviewerId: "current-user", // In real app, get from auth
      reviewerName: "Current Manager",
      templateId: selectedTemplateId,
      templateName: selectedTemplate.name,
      reviewPeriodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      reviewPeriodEnd: new Date().toISOString(),
      status: 'completed',
      dueDate: new Date().toISOString(),
      completedDate: new Date().toISOString(),
      overallRating,
      responses,
      strengths,
      areasForImprovement,
      goals,
      managerComments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    savePerformanceReview(review);
    
    toast({
      title: "Review Completed",
      description: `Performance review for ${employeeName} has been submitted`
    });

    handleClose();
    onComplete?.();
  };

  const handleClose = () => {
    setStep('setup');
    setSelectedEmployeeId("");
    setSelectedTemplateId("");
    setCurrentSectionIndex(0);
    setResponses([]);
    setOverallRating(0);
    setStrengths("");
    setAreasForImprovement("");
    setGoals("");
    setManagerComments("");
    onOpenChange(false);
  };

  const currentSection = selectedTemplate?.sections[currentSectionIndex];
  const isLastSection = selectedTemplate && currentSectionIndex === selectedTemplate.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 'setup' ? 'Start Performance Review' : 'Complete Performance Review'}
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee to review" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Review Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose review template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.cycle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              )}
            </div>

            <Button onClick={handleStartReview} className="w-full">
              Start Review
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress indicator */}
            {selectedTemplate && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Section {currentSectionIndex + 1} of {selectedTemplate.sections.length}</span>
                  <span>{Math.round(((currentSectionIndex + 1) / selectedTemplate.sections.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentSectionIndex + 1) / selectedTemplate.sections.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <ScrollArea className="h-[500px] pr-4">
              {currentSection && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">{currentSection.title}</h3>
                    {currentSection.description && (
                      <p className="text-sm text-muted-foreground mt-1">{currentSection.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Weight: {currentSection.weight}% of overall score
                    </p>
                  </div>

                  {currentSection.questions.map(question => (
                    <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <Label className="text-base">
                          {question.question}
                          {question.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                      </div>
                      {question.helpText && (
                        <p className="text-sm text-muted-foreground">{question.helpText}</p>
                      )}

                      {question.type === 'rating' && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant={getResponseValue(currentSection.id, question.id, 'rating') === rating ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleResponseChange(currentSection.id, question.id, rating, 'rating')}
                              className="flex items-center gap-1"
                            >
                              <Star className="h-4 w-4" />
                              {rating}
                            </Button>
                          ))}
                        </div>
                      )}

                      {question.type === 'text' && (
                        <Textarea
                          value={getResponseValue(currentSection.id, question.id, 'text') as string || ''}
                          onChange={(e) => handleResponseChange(currentSection.id, question.id, e.target.value, 'text')}
                          placeholder="Enter your response..."
                          rows={4}
                        />
                      )}

                      {question.type === 'yes-no' && (
                        <RadioGroup
                          value={getResponseValue(currentSection.id, question.id, 'text') as string || ''}
                          onValueChange={(value) => handleResponseChange(currentSection.id, question.id, value, 'text')}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                            <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id={`${question.id}-no`} />
                            <Label htmlFor={`${question.id}-no`}>No</Label>
                          </div>
                        </RadioGroup>
                      )}

                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${question.id}-${option}`}
                                checked={(getResponseValue(currentSection.id, question.id, 'options') as string[] || []).includes(option)}
                                onCheckedChange={(checked) => {
                                  const current = getResponseValue(currentSection.id, question.id, 'options') as string[] || [];
                                  const updated = checked
                                    ? [...current, option]
                                    : current.filter(o => o !== option);
                                  handleResponseChange(currentSection.id, question.id, updated, 'options');
                                }}
                              />
                              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Overall rating and comments on last section */}
                  {isLastSection && (
                    <div className="space-y-6 mt-8 pt-6 border-t">
                      <div className="space-y-3">
                        <Label className="text-base">
                          Overall Performance Rating <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Button
                              key={rating}
                              variant={overallRating === rating ? 'default' : 'outline'}
                              size="lg"
                              onClick={() => setOverallRating(rating)}
                              className="flex-1 flex items-center justify-center gap-2"
                            >
                              <Star className="h-5 w-5" />
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Key Strengths</Label>
                        <Textarea
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                          placeholder="What are this employee's key strengths?"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Areas for Improvement</Label>
                        <Textarea
                          value={areasForImprovement}
                          onChange={(e) => setAreasForImprovement(e.target.value)}
                          placeholder="What areas should this employee focus on improving?"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Goals for Next Period</Label>
                        <Textarea
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                          placeholder="What goals should be set for the next review period?"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Manager Comments</Label>
                        <Textarea
                          value={managerComments}
                          onChange={(e) => setManagerComments(e.target.value)}
                          placeholder="Any additional comments or notes..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentSectionIndex(prev => prev - 1)}
                disabled={isFirstSection}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {!isLastSection ? (
                <Button onClick={() => setCurrentSectionIndex(prev => prev + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Complete Review
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
